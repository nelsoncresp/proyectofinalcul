import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { Area } from '../models/area.model';
import { Asignatura } from '../models/asignatura.model';
import { ProgresoEstudiante } from '../models/progress.model';
import { LeccionEvaluacion } from '../models/leccion.model';
import { RecursoContenido } from '../models/resource.model';
import { Reto } from '../models/reto.model';

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

            // 3. Calcular estado para cada asignatura: 'Completado' | 'Disponible' | 'Bloqueado'
            const asignaturasConEstado = asignaturas.map(asig => {
                let estado: 'Completado' | 'Disponible' | 'Bloqueado' = 'Bloqueado';

                if (completadasSet.has(asig.id)) {
                    estado = 'Completado';
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

            res.status(200).json({
                avanceGlobal,
                totalMaterias,
                totalCompletadas,
                areas: areasAgrupadas,
                semestres
            });
        } catch (error) {
            console.error('[GetPensum Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Retorna la lección educativa interactiva (lectura, video y opciones) junto a sus recursos curados.
     * No envía la respuesta correcta para evitar trampas en inspección de red.
     */
    async getLeccion(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const asigRepo = AppDataSource.getRepository(Asignatura);
            const leccRepo = AppDataSource.getRepository(LeccionEvaluacion);
            const recuRepo = AppDataSource.getRepository(RecursoContenido);

            const asignatura = await asigRepo.findOne({
                where: { id },
                relations: ['area', 'prerrequisitos']
            });

            if (!asignatura) {
                res.status(404).json({ error: 'Asignatura no encontrada' });
                return;
            }

            // Sin lección curada se responde `null`: el frontend muestra el
            // estado "aún no tiene contenido curado" (nunca texto genérico).
            const leccion = await leccRepo.findOneBy({ asignatura_id: id });

            const recursos = await recuRepo.findBy({ asignatura_id: id, estado_revision: 'aprobado' });

            // Reto de código práctico (si la materia tiene uno curado).
            const retoRepo = AppDataSource.getRepository(Reto);
            const reto = await retoRepo.findOneBy({ asignatura_id: id });

            res.status(200).json({
                asignatura: {
                    id: asignatura.id,
                    nombre: asignatura.nombre,
                    semestre: asignatura.semestre,
                    area: asignatura.area
                },
                leccion: leccion
                    ? {
                        id: leccion.id,
                        contenido_lectura: leccion.contenido_lectura,
                        video_url: leccion.video_url,
                        tiempo_minimo_segundos: leccion.tiempo_minimo_segundos,
                        pregunta: leccion.pregunta,
                        opciones: leccion.opciones
                    }
                    : null,
                reto: reto
                    ? {
                        id: reto.id,
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
     * Evalúa la respuesta enviada por el estudiante para la lección de la asignatura.
     */
    async evaluarLeccion(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { respuesta } = req.body;

            if (typeof respuesta !== 'number') {
                res.status(400).json({ error: 'Respuesta inválida. Debe ser un índice numérico.' });
                return;
            }

            const leccRepo = AppDataSource.getRepository(LeccionEvaluacion);
            const leccion = await leccRepo.findOneBy({ asignatura_id: id });

            if (!leccion) {
                // Sin lección curada no hay evaluación: nunca se autogenera.
                res.status(404).json({ error: 'Esta asignatura aún no tiene una evaluación curada' });
                return;
            }

            const esCorrecto = respuesta === leccion.respuesta_correcta;

            res.status(200).json({
                esCorrecto,
                explicacion: esCorrecto ? leccion.explicacion : 'Respuesta incorrecta. Revisa el contenido de la lectura o el video e inténtalo nuevamente.'
            });
        } catch (error) {
            console.error('[EvaluarLeccion Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
