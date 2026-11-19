import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { InscripcionCurso } from '../models/inscripcion-curso.model';
import { CursoExtracurricular } from '../models/curso-extracurricular.model';
import { ModuloCurso } from '../models/modulo-curso.model';
import { ProgresoModuloCurso } from '../models/progreso-modulo-curso.model';

function indicesValidos(valor: unknown): number[] | null {
    if (!Array.isArray(valor)) return null;
    const indices = [...new Set(valor.map(Number))]
        .filter(indice => Number.isInteger(indice) && indice >= 0);
    if (indices.length !== valor.length) return null;
    return indices.sort((a, b) => a - b);
}

async function crearRespuestaInscripcion(inscripcion: InscripcionCurso): Promise<Record<string, unknown>> {
    const cursoRepo = AppDataSource.getRepository(CursoExtracurricular);
    const curso = await cursoRepo.findOne({
        where: { id: inscripcion.curso_id },
        relations: ['modulos']
    });
    if (!curso) return (inscripcion as unknown as Record<string, unknown>);

    const progresoRepo = AppDataSource.getRepository(ProgresoModuloCurso);
    const progresos = await progresoRepo.find({
        where: { inscripcion_id: inscripcion.id }
    });
    const moduloIdsCompletados = new Set(progresos.map(progreso => progreso.modulo_id));
    const modulos = curso.modulos
        .filter(modulo => modulo.activo === 1)
        .sort((a, b) => a.orden - b.orden);

    const modulosVistos = modulos
        .map((modulo, indice) => moduloIdsCompletados.has(modulo.id) ? indice : -1)
        .filter(indice => indice >= 0);

    return {
        id: inscripcion.id,
        usuario_id: inscripcion.usuario_id,
        curso_id: curso.codigo,
        interes: curso.interes,
        modulos_vistos: modulosVistos,
        estado: inscripcion.estado,
        fecha: inscripcion.fecha,
        curso: {
            id: curso.id,
            codigo: curso.codigo,
            titulo: curso.titulo,
            nivel: curso.nivel,
            interes: curso.interes
        }
    };
}

export const CursoExtracurricularController = {
    async getCatalogo(_req: AuthRequest, res: Response): Promise<void> {
        try {
            const repo = AppDataSource.getRepository(CursoExtracurricular);
            const cursos = await repo.find({
                where: { activo: 1 },
                relations: ['modulos'],
                order: { id: 'ASC', modulos: { orden: 'ASC' } }
            });

            res.status(200).json(cursos.map(curso => ({
                id: curso.codigo,
                codigo: curso.codigo,
                interes: curso.interes,
                titulo: curso.titulo,
                subtitulo: curso.subtitulo,
                nivel: curso.nivel,
                duracion: curso.duracion,
                color: curso.color,
                descripcion: curso.descripcion,
                tags: curso.tags ?? [],
                modulos: curso.modulos
                    .filter(modulo => modulo.activo === 1)
                    .sort((a, b) => a.orden - b.orden)
                    .map(modulo => ({
                        id: modulo.id,
                        orden: modulo.orden,
                        titulo: modulo.titulo,
                        descripcion: modulo.descripcion,
                        contenido: modulo.contenido ?? null,
                        video_url: modulo.video_url ?? null,
                        duracion_minutos: modulo.duracion_minutos ?? 30
                    }))
            })));
        } catch (error) {
            console.error('[GetCatalogoCursos Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getCursoDetalle(req: AuthRequest, res: Response): Promise<void> {
        try {
            const param = String(req.params.cursoId ?? '').trim();
            const repo = AppDataSource.getRepository(CursoExtracurricular);

            const curso = isNaN(Number(param))
                ? await repo.findOne({ where: { codigo: param, activo: 1 }, relations: ['modulos'] })
                : await repo.findOne({ where: [{ id: Number(param), activo: 1 }, { codigo: param, activo: 1 }], relations: ['modulos'] });

            if (!curso) {
                res.status(404).json({ error: 'Curso extracurricular no encontrado' });
                return;
            }

            let inscripcionData = null;
            const usuario_id = req.user?.id;
            if (usuario_id) {
                const inscripcionRepo = AppDataSource.getRepository(InscripcionCurso);
                const inscripcion = await inscripcionRepo.findOneBy({ usuario_id, curso_id: curso.id });
                if (inscripcion) {
                    inscripcionData = {
                        id: inscripcion.id,
                        estado: inscripcion.estado,
                        modulos_vistos: inscripcion.modulos_vistos ?? []
                    };
                }
            }

            res.status(200).json({
                curso: {
                    id: curso.codigo,
                    codigo: curso.codigo,
                    interes: curso.interes,
                    titulo: curso.titulo,
                    subtitulo: curso.subtitulo,
                    nivel: curso.nivel,
                    duracion: curso.duracion,
                    color: curso.color,
                    descripcion: curso.descripcion,
                    tags: curso.tags ?? [],
                    modulos: curso.modulos
                        .filter(m => m.activo === 1)
                        .sort((a, b) => a.orden - b.orden)
                        .map(m => ({
                            id: m.id,
                            orden: m.orden,
                            titulo: m.titulo,
                            descripcion: m.descripcion,
                            contenido: m.contenido ?? null,
                            video_url: m.video_url ?? null,
                            duracion_minutos: m.duracion_minutos ?? 30
                        }))
                },
                inscripcion: inscripcionData
            });
        } catch (error) {
            console.error('[GetCursoDetalle Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMisInscripciones(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const repo = AppDataSource.getRepository(InscripcionCurso);
            const inscripciones = await repo.find({
                where: { usuario_id },
                relations: ['curso'],
                order: { fecha: 'DESC' }
            });

            const resultado = await Promise.all(
                inscripciones.map(inscripcion => crearRespuestaInscripcion(inscripcion))
            );
            res.status(200).json(resultado);
        } catch (error) {
            console.error('[GetMisInscripciones Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async inscribirse(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const codigo = String(req.params.cursoId ?? '');
            const cursoRepo = AppDataSource.getRepository(CursoExtracurricular);
            const curso = await cursoRepo.findOneBy({ codigo, activo: 1 });
            if (!curso) {
                res.status(404).json({ error: 'Curso extracurricular no encontrado' });
                return;
            }

            const interes = typeof req.body?.interes === 'string'
                ? req.body.interes
                : curso.interes;
            if (interes !== curso.interes) {
                res.status(400).json({ error: 'El curso no corresponde al interés seleccionado' });
                return;
            }

            const repo = AppDataSource.getRepository(InscripcionCurso);
            let inscripcion = await repo.findOneBy({ usuario_id, curso_id: curso.id });
            if (!inscripcion) {
                inscripcion = repo.create({
                    usuario_id,
                    curso_id: curso.id,
                    interes: curso.interes,
                    modulos_vistos: [],
                    estado: 'inscrito'
                });
                inscripcion = await repo.save(inscripcion);
            }

            res.status(200).json({
                message: 'Inscripción confirmada',
                inscripcion: await crearRespuestaInscripcion(inscripcion)
            });
        } catch (error) {
            console.error('[InscribirseCurso Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async desinscribirse(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const codigo = String(req.params.cursoId ?? '');
            const curso = await AppDataSource.getRepository(CursoExtracurricular).findOneBy({ codigo, activo: 1 });
            if (!curso) {
                res.status(404).json({ error: 'Curso extracurricular no encontrado' });
                return;
            }

            const repo = AppDataSource.getRepository(InscripcionCurso);
            const inscripcion = await repo.findOneBy({ usuario_id, curso_id: curso.id });
            if (!inscripcion) {
                res.status(404).json({ error: 'No estás inscrito en este curso' });
                return;
            }

            await repo.remove(inscripcion);
            res.status(200).json({ message: 'Inscripción cancelada' });
        } catch (error) {
            console.error('[DesinscribirseCurso Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async guardarProgreso(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const codigo = String(req.params.cursoId ?? '');
            const curso = await AppDataSource.getRepository(CursoExtracurricular).findOne({
                where: { codigo, activo: 1 },
                relations: ['modulos']
            });
            if (!curso) {
                res.status(404).json({ error: 'Curso extracurricular no encontrado' });
                return;
            }

            const indices = indicesValidos(req.body?.modulos_vistos);
            if (indices === null) {
                res.status(400).json({ error: 'modulos_vistos debe ser una lista válida de índices' });
                return;
            }

            const modulos = curso.modulos
                .filter(modulo => modulo.activo === 1)
                .sort((a, b) => a.orden - b.orden);
            if (indices.some(indice => indice >= modulos.length)) {
                res.status(400).json({ error: 'El módulo indicado no existe en este curso' });
                return;
            }

            const inscripcionRepo = AppDataSource.getRepository(InscripcionCurso);
            const inscripcion = await inscripcionRepo.findOneBy({ usuario_id, curso_id: curso.id });
            if (!inscripcion) {
                res.status(404).json({ error: 'No estás inscrito en este curso' });
                return;
            }

            await AppDataSource.transaction(async manager => {
                const progresoRepo = manager.getRepository(ProgresoModuloCurso);
                await progresoRepo.delete({ inscripcion_id: inscripcion.id });

                for (const indice of indices) {
                    await progresoRepo.save(progresoRepo.create({
                        inscripcion_id: inscripcion.id,
                        modulo_id: modulos[indice].id,
                        fecha_completado: new Date()
                    }));
                }

                if (indices.length === 0) {
                    inscripcion.estado = 'inscrito';
                } else if (indices.length === modulos.length) {
                    inscripcion.estado = 'completado';
                } else {
                    inscripcion.estado = 'en_progreso';
                }
                inscripcion.modulos_vistos = indices;
                await manager.getRepository(InscripcionCurso).save(inscripcion);
            });

            res.status(200).json({
                message: 'Progreso guardado',
                modulos_vistos: indices,
                estado: inscripcion.estado
            });
        } catch (error) {
            console.error('[GuardarProgresoCurso Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
