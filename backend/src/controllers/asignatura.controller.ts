import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { Area } from '../models/area.model';
import { Asignatura } from '../models/asignatura.model';
import { ProgresoEstudiante } from '../models/progress.model';
import { LeccionEvaluacion } from '../models/leccion.model';
import { RecursoContenido } from '../models/resource.model';
import { Reto } from '../models/reto.model';
import { User } from '../models/user.model';
import { CorteAprobado } from '../models/corte-aprobado.model';

export const AsignaturaController = {
    /**
     * Retorna el pensum completo organizado por Áreas de Conocimiento y Semestres,
     * calculando en tiempo real el estado de cada asignatura para el estudiante logueado.
     */
    async getPensum(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            let estudianteSemestre = req.user?.semestre ? Number(req.user.semestre) : null;
            if (!estudianteSemestre) {
                const userRepo = AppDataSource.getRepository(User);
                const userObj = await userRepo.findOneBy({ id: usuario_id });
                estudianteSemestre = userObj?.semestre ? Number(userObj.semestre) : null;
            }

            const semestreActual = estudianteSemestre ?? 1;

            const areaRepo = AppDataSource.getRepository(Area);
            const asigRepo = AppDataSource.getRepository(Asignatura);
            const progRepo = AppDataSource.getRepository(ProgresoEstudiante);

            // 1. Obtener todas las materias con sus prerrequisitos y área
            const asignaturas = await asigRepo.find({
                relations: ['prerrequisitos', 'area'],
                order: { semestre: 'ASC', id: 'ASC' }
            });

            // 2. Obtener el progreso del usuario
            const progresos = await progRepo.findBy({ usuario_id });
            const completadasSet = new Set<number>(
                progresos.filter(p => p.estado === 'completado').map(p => p.asignatura_id)
            );
            // Inscripciones vigentes (estado 'inscrito') para "Para ti" / "Mis cursos".
            const inscritosSet = new Set<number>(
                progresos.filter(p => p.estado === 'inscrito').map(p => p.asignatura_id)
            );

            // Las materias de semestres estrictamente menores al actual se consideran completadas
            if (semestreActual > 1) {
                asignaturas.forEach(asig => {
                    if (asig.semestre < semestreActual) {
                        completadasSet.add(asig.id);
                    }
                });
            }

            // 3. Calcular estado para cada asignatura: 'Completado' | 'Disponible' | 'Bloqueado'
            const asignaturasConEstado = asignaturas.map(asig => {
                let estado: 'Completado' | 'Disponible' | 'Bloqueado' = 'Bloqueado';

                if (completadasSet.has(asig.id)) {
                    estado = 'Completado';
                } else if (asig.semestre > semestreActual) {
                    // Materias de semestres posteriores al actual del estudiante siempre están bloqueadas
                    estado = 'Bloqueado';
                } else if (!asig.prerrequisitos || asig.prerrequisitos.length === 0) {
                    estado = 'Disponible';
                } else {
                    const todosCumplidos = asig.prerrequisitos.every(pre => completadasSet.has(pre.id));
                    estado = todosCumplidos ? 'Disponible' : 'Bloqueado';
                }

                return {
                    id: asig.id,
                    nombre: asig.nombre,
                    semestre: asig.semestre,
                    area_id: asig.area_id,
                    areaNombre: asig.area?.nombre || 'General',
                    areaColor: asig.area?.color || '#3b82f6',
                    areaIcono: asig.area?.icono || 'book',
                    estado,
                    // Inscrito solo cuenta si la materia no está completada.
                    inscrito: inscritosSet.has(asig.id) && !completadasSet.has(asig.id),
                    prerrequisitos: asig.prerrequisitos.map(p => ({
                        id: p.id,
                        nombre: p.nombre,
                        completado: completadasSet.has(p.id)
                    }))
                };
            });

            // 4. Agrupar por Áreas de Conocimiento
            const areas = await areaRepo.find({ order: { id: 'ASC' } });
            const areasAgrupadas = areas.map(area => {
                const nodosArea = asignaturasConEstado.filter(a => a.area_id === area.id);
                const total = nodosArea.length;
                const completadas = nodosArea.filter(a => a.estado === 'Completado').length;
                const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

                return {
                    id: area.id,
                    nombre: area.nombre,
                    descripcion: area.descripcion,
                    color: area.color,
                    icono: area.icono,
                    porcentajeAvance: porcentaje,
                    nodos: nodosArea
                };
            });

            // 5. Agrupar por Semestres
            const totalMaterias = asignaturasConEstado.length;
            const totalCompletadas = completadasSet.size;
            const avanceGlobal = totalMaterias > 0 ? Math.round((totalCompletadas / totalMaterias) * 100) : 0;

            const semestresMap: { [sem: number]: typeof asignaturasConEstado } = {};
            asignaturasConEstado.forEach(asig => {
                if (!semestresMap[asig.semestre]) semestresMap[asig.semestre] = [];
                semestresMap[asig.semestre].push(asig);
            });

            const semestres = Object.keys(semestresMap).map(s => {
                const semNum = Number(s);
                const list = semestresMap[semNum];
                const done = list.filter(a => a.estado === 'Completado').length;
                return {
                    semestre: semNum,
                    total: list.length,
                    completadas: done,
                    porcentaje: Math.round((done / list.length) * 100),
                    materias: list
                };
            });

            const practica_libre = asignaturasConEstado.filter(a =>
                Boolean(estudianteSemestre && a.semestre < estudianteSemestre)
            );

            res.status(200).json({
                avanceGlobal,
                totalMaterias,
                totalCompletadas,
                areas: areasAgrupadas,
                semestres,
                practica_libre
            });
        } catch (error) {
            console.error('[GetPensum Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Retorna la lección de un corte específico (1, 2 o 3) junto a recursos y reto del corte.
     * Para rol 3 (estudiante), los borradores NO se envían (se tratan como pendientes).
     */
    async getLeccion(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const corte = Math.min(3, Math.max(1, parseInt((req.query.corte as string) || '1', 10)));
            const rolId = req.user?.rol_id ?? 3;
            const usuarioId = req.user?.id;

            const asigRepo = AppDataSource.getRepository(Asignatura);
            const leccRepo = AppDataSource.getRepository(LeccionEvaluacion);
            const recuRepo = AppDataSource.getRepository(RecursoContenido);
            const retoRepo = AppDataSource.getRepository(Reto);
            const corteRepo = AppDataSource.getRepository(CorteAprobado);

            const asignatura = await asigRepo.findOne({
                where: { id },
                relations: ['area', 'prerrequisitos']
            });

            if (!asignatura) {
                res.status(404).json({ error: 'Asignatura no encontrada' });
                return;
            }

            // Lecciones de los 3 cortes para calcular el panel de estado
            const todasLecciones = await leccRepo.find({ where: { asignatura_id: id } });

            // Lección del corte solicitado
            const leccionCorte = todasLecciones.find(l => l.corte === corte) ?? null;

            // Para rol 3: borrador = pendiente (no se envía contenido)
            const esEstudiante = rolId === 3;
            const borrador = leccionCorte?.estado === 'borrador';
            const leccionVisible = leccionCorte && (!esEstudiante || !borrador);

            // Cortes aprobados del estudiante en esta asignatura
            let cortesAprobados: number[] = [];
            if (usuarioId) {
                const aprobados = await corteRepo.find({
                    where: { usuario_id: usuarioId, asignatura_id: id }
                });
                cortesAprobados = aprobados.map(ca => ca.corte);
            }

            // Panel de 3 cortes
            const cortes = [1, 2, 3].map(c => {
                const lec = todasLecciones.find(l => l.corte === c);
                let estado: 'aprobada' | 'publicada' | 'borrador' | 'pendiente';
                if (cortesAprobados.includes(c)) {
                    estado = 'aprobada';
                } else if (!lec) {
                    estado = 'pendiente';
                } else if (lec.estado === 'borrador') {
                    estado = esEstudiante ? 'pendiente' : 'borrador';
                } else {
                    estado = 'publicada';
                }
                return { corte: c, estado, aprobado: cortesAprobados.includes(c) };
            });

            const recursos = await recuRepo.findBy({ asignatura_id: id, estado_revision: 'aprobado' });
            const reto = await retoRepo.findOneBy({ asignatura_id: id, corte });

            res.status(200).json({
                asignatura: {
                    id: asignatura.id,
                    nombre: asignatura.nombre,
                    semestre: asignatura.semestre,
                    area: asignatura.area
                },
                corte,
                cortes,
                leccion: leccionVisible
                    ? {
                        id: leccionCorte!.id,
                        corte: leccionCorte!.corte,
                        contenido_lectura: leccionCorte!.contenido_lectura,
                        video_url: leccionCorte!.video_url,
                        tiempo_minimo_segundos: leccionCorte!.tiempo_minimo_segundos,
                        pregunta: leccionCorte!.pregunta,
                        opciones: leccionCorte!.opciones
                    }
                    : null,
                reto: reto
                    ? {
                        id: reto.id,
                        corte: reto.corte,
                        enunciado: reto.enunciado,
                        plantilla: reto.plantilla,
                        nombre_funcion: reto.nombre_funcion,
                        casos: reto.casos
                    }
                    : null,
                recursos
            });
        } catch (error) {
            console.error('[GetLeccion Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Evalúa la respuesta del estudiante para un corte específico.
     * Si es correcta, registra el corte en cortes_aprobados.
     * Cuando los 3 cortes están aprobados, marca la materia como completada.
     */
    async evaluarLeccion(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { respuesta, corte: corteRaw } = req.body;
            const corte = Math.min(3, Math.max(1, Number(corteRaw) || 1));

            if (typeof respuesta !== 'number') {
                res.status(400).json({ error: 'Respuesta inválida. Debe ser un índice numérico.' });
                return;
            }

            const leccRepo = AppDataSource.getRepository(LeccionEvaluacion);
            const leccion = await leccRepo.findOneBy({ asignatura_id: id, corte });

            if (!leccion) {
                res.status(404).json({ error: 'Esta asignatura no tiene lección en el corte ' + corte });
                return;
            }

            // Estudiantes no pueden evaluar borradores
            if (req.user?.rol_id === 3 && leccion.estado === 'borrador') {
                res.status(403).json({ error: 'El contenido de este corte aún no está publicado' });
                return;
            }

            const esCorrecto = respuesta === leccion.respuesta_correcta;
            let corteAprobado = false;
            let materiaCompletada = false;

            if (esCorrecto && req.user?.id) {
                const usuario_id = req.user.id;
                await AppDataSource.transaction(async em => {
                    const corteRepo = em.getRepository(CorteAprobado);
                    const progRepo = em.getRepository(ProgresoEstudiante);

                    // Upsert corte aprobado
                    const existente = await corteRepo.findOneBy({ usuario_id, asignatura_id: id, corte });
                    if (!existente) {
                        await corteRepo.save(corteRepo.create({ usuario_id, asignatura_id: id, corte }));
                    }
                    corteAprobado = true;

                    // Verificar si los 3 cortes están aprobados
                    const totalAprobados = await corteRepo.countBy({ usuario_id, asignatura_id: id });
                    if (totalAprobados >= 3) {
                        let prog = await progRepo.findOneBy({ usuario_id, asignatura_id: id });
                        if (prog) {
                            prog.estado = 'completado';
                        } else {
                            prog = progRepo.create({ usuario_id, asignatura_id: id, estado: 'completado' });
                        }
                        await progRepo.save(prog);
                        materiaCompletada = true;
                    }
                });
            }

            res.status(200).json({
                esCorrecto,
                explicacion: esCorrecto
                    ? leccion.explicacion
                    : 'Respuesta incorrecta. Revisa el contenido e inténtalo nuevamente.',
                corteAprobado,
                materiaCompletada
            });
        } catch (error) {
            console.error('[EvaluarLeccion Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * El estudiante se inscribe en una materia disponible (progreso.estado = 'inscrito').
     * Es la puerta de entrada de la pestaña "Para ti": inscribirse y empezar el curso.
     */
    async inscribirse(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const id = parseInt(req.params.id as string, 10);
            const asigRepo = AppDataSource.getRepository(Asignatura);
            const progRepo = AppDataSource.getRepository(ProgresoEstudiante);

            const asignatura = await asigRepo.findOne({
                where: { id },
                relations: ['prerrequisitos']
            });
            if (!asignatura) {
                res.status(404).json({ error: 'Asignatura no encontrada' });
                return;
            }

            // Semestre actual (mismo criterio que getPensum).
            let semestre = req.user?.semestre;
            if (semestre === undefined || semestre === null) {
                const userObj = await AppDataSource.getRepository(User).findOneBy({ id: usuario_id });
                semestre = userObj?.semestre ?? null;
            }

            const progresos = await progRepo.findBy({ usuario_id });
            const propio = progresos.find(p => p.asignatura_id === id);
            if (propio?.estado === 'completado') {
                res.status(400).json({ error: 'Ya aprobaste esta materia' });
                return;
            }

            // Materias de semestres anteriores cuentan como aprobadas (regla del pensum).
            if (semestre && asignatura.semestre < semestre) {
                res.status(400).json({ error: 'Esta materia ya cuenta como aprobada por tu avance de semestre' });
                return;
            }

            // Prerrequisitos: misma regla que el pensum (completados o semestre anterior).
            const completadasSet = new Set<number>(
                progresos.filter(p => p.estado === 'completado').map(p => p.asignatura_id)
            );
            if (semestre && semestre > 1) {
                asignatura.prerrequisitos.forEach(pre => {
                    if (pre.semestre < semestre!) completadasSet.add(pre.id);
                });
            }
            const faltantes = asignatura.prerrequisitos.filter(pre => !completadasSet.has(pre.id));
            if (faltantes.length > 0) {
                res.status(400).json({
                    error: `Aún no cumples los prerrequisitos: ${faltantes.map(f => f.nombre).join(', ')}`
                });
                return;
            }

            if (propio) {
                propio.estado = 'inscrito'; // idempotente si ya estaba inscrito
                await progRepo.save(propio);
            } else {
                await progRepo.save(progRepo.create({
                    usuario_id,
                    asignatura_id: id,
                    estado: 'inscrito'
                }));
            }

            res.status(200).json({
                message: `Inscripción confirmada en ${asignatura.nombre}`,
                inscrito: true
            });
        } catch (error) {
            console.error('[Inscribirse Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Cancela la inscripción del estudiante en una materia (no toca 'completado').
     */
    async desinscribirse(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const id = parseInt(req.params.id as string, 10);
            const progRepo = AppDataSource.getRepository(ProgresoEstudiante);
            const propio = await progRepo.findOneBy({ usuario_id, asignatura_id: id });

            if (!propio || propio.estado !== 'inscrito') {
                res.status(404).json({ error: 'No estás inscrito en esta materia' });
                return;
            }

            await progRepo.remove(propio);
            res.status(200).json({ message: 'Inscripción cancelada', inscrito: false });
        } catch (error) {
            console.error('[Desinscribirse Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Permite a un Docente o Administrador crear una nueva asignatura o ruta.
     */
    async createAsignatura(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { nombre, semestre, area_id, prerrequisitos_ids } = req.body;
            if (!nombre || !area_id) {
                res.status(400).json({ error: 'Faltan campos obligatorios: nombre y area_id son requeridos' });
                return;
            }

            const asigRepo = AppDataSource.getRepository(Asignatura);
            const areaRepo = AppDataSource.getRepository(Area);

            const area = await areaRepo.findOneBy({ id: Number(area_id) });
            if (!area) {
                res.status(404).json({ error: 'Área de conocimiento no encontrada' });
                return;
            }

            let prerrequisitos: Asignatura[] = [];
            if (Array.isArray(prerrequisitos_ids) && prerrequisitos_ids.length > 0) {
                prerrequisitos = await asigRepo.find({
                    where: prerrequisitos_ids.map(id => ({ id: Number(id) }))
                });
            }

            const tipo = req.user?.rol_id === 1 && req.body.tipo ? req.body.tipo : 'ruta_profesor';

            const nuevaAsig = asigRepo.create({
                nombre: String(nombre).trim(),
                semestre: Number(semestre) || 1,
                area_id: Number(area_id),
                tipo,
                creador_id: req.user?.id ?? null,
                prerrequisitos
            });

            const saved = await asigRepo.save(nuevaAsig);

            res.status(201).json({
                message: 'Asignatura / ruta creada exitosamente',
                asignatura: saved
            });
        } catch (error) {
            console.error('[CreateAsignatura Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Crea o actualiza la lección de un corte específico (1, 2 o 3) para una asignatura.
     */
    async saveLeccion(req: AuthRequest, res: Response): Promise<void> {
        try {
            const asignatura_id = parseInt(req.params.id as string, 10);
            const {
                corte: corteRaw,
                contenido_lectura,
                video_url,
                tiempo_minimo_segundos,
                pregunta,
                opciones,
                respuesta_correcta,
                explicacion,
                estado
            } = req.body;

            const corte = Math.min(3, Math.max(1, Number(corteRaw) || 1));

            if (!contenido_lectura || !pregunta || !opciones || respuesta_correcta === undefined || !explicacion) {
                res.status(400).json({
                    error: 'Faltan campos obligatorios: contenido_lectura, pregunta, opciones, respuesta_correcta, explicacion'
                });
                return;
            }

            const asigRepo = AppDataSource.getRepository(Asignatura);
            const leccRepo = AppDataSource.getRepository(LeccionEvaluacion);

            const asig = await asigRepo.findOneBy({ id: asignatura_id });
            if (!asig) {
                res.status(404).json({ error: 'Asignatura no encontrada' });
                return;
            }

            if (req.user?.rol_id === 2 && asig.creador_id && asig.creador_id !== req.user.id) {
                res.status(403).json({ error: 'No tienes permiso para editar el contenido de esta asignatura' });
                return;
            }

            let leccion = await leccRepo.findOneBy({ asignatura_id, corte });
            if (leccion) {
                leccion.contenido_lectura = contenido_lectura;
                leccion.video_url = video_url ?? null;
                leccion.tiempo_minimo_segundos = Number(tiempo_minimo_segundos) || 0;
                leccion.pregunta = pregunta;
                leccion.opciones = Array.isArray(opciones) ? opciones : JSON.parse(opciones);
                leccion.respuesta_correcta = Number(respuesta_correcta);
                leccion.explicacion = explicacion;
                leccion.estado = estado === 'borrador' ? 'borrador' : 'publicada';
            } else {
                leccion = leccRepo.create({
                    asignatura_id,
                    corte,
                    contenido_lectura,
                    video_url: video_url ?? null,
                    tiempo_minimo_segundos: Number(tiempo_minimo_segundos) || 0,
                    pregunta,
                    opciones: Array.isArray(opciones) ? opciones : JSON.parse(opciones),
                    respuesta_correcta: Number(respuesta_correcta),
                    explicacion,
                    estado: estado === 'borrador' ? 'borrador' : 'publicada',
                    creado_por_id: req.user?.id ?? null
                });
            }

            const saved = await leccRepo.save(leccion);

            res.status(200).json({
                message: 'Lección guardada exitosamente',
                leccion: saved
            });
        } catch (error) {
            console.error('[SaveLeccion Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Retorna todas las asignaturas / rutas creadas por el docente autenticado.
     */
    async getMisRutas(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            const rol_id = req.user?.rol_id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const asigRepo = AppDataSource.getRepository(Asignatura);
            const whereCondition = rol_id === 1 ? {} : { creador_id: usuario_id };

            const rutas = await asigRepo.find({
                where: whereCondition,
                relations: ['area', 'prerrequisitos', 'lecciones', 'recursos'],
                order: { id: 'DESC' }
            });

            res.status(200).json(rutas);
        } catch (error) {
            console.error('[GetMisRutas Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
