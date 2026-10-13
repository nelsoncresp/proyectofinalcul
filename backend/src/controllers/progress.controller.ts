import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { ProgresoEstudiante } from '../models/progress.model';
import { Asignatura } from '../models/asignatura.model';

export const ProgressController = {
    async updateProgress(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            const { asignatura_id, estado } = req.body;

            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const progressRepository = AppDataSource.getRepository(ProgresoEstudiante);
            const asignaturaRepository = AppDataSource.getRepository(Asignatura);

            // Validar existencia de la materia
            const asignatura = await asignaturaRepository.findOne({ 
                where: { id: asignatura_id },
                relations: ['prerrequisitos'] 
            });

            if (!asignatura) {
                res.status(404).json({ error: 'Asignatura no encontrada' });
                return;
            }

            // Motor de prerrequisitos si el estado es 'completado'
            if (estado === 'completado') {
                if (asignatura.prerrequisitos && asignatura.prerrequisitos.length > 0) {
                    for (const pre of asignatura.prerrequisitos) {
                        const preProgress = await progressRepository.findOneBy({ 
                            usuario_id, 
                            asignatura_id: pre.id 
                        });
                        if (!preProgress || preProgress.estado !== 'completado') {
                            res.status(400).json({ 
                                error: `Error de Regla de Negocio: La asignatura previa "${pre.nombre || pre.id}" no ha sido completada.` 
                            });
                            return;
                        }
                    }
                }
            }

            let progress = await progressRepository.findOneBy({ usuario_id, asignatura_id });
            if (progress) {
                progress.estado = estado;
            } else {
                progress = progressRepository.create({ usuario_id, asignatura_id, estado });
            }
            await progressRepository.save(progress);

            // Calcular qué materias quedaron recién desbloqueadas
            const recienDesbloqueadas: { id: number; nombre: string; semestre: number }[] = [];
            if (estado === 'completado') {
                const todasAsignaturas = await asignaturaRepository.find({ relations: ['prerrequisitos'] });
                const todosProgresos = await progressRepository.findBy({ usuario_id });
                const completadasSet = new Set(todosProgresos.filter(p => p.estado === 'completado').map(p => p.asignatura_id));

                for (const asig of todasAsignaturas) {
                    if (!completadasSet.has(asig.id) && asig.prerrequisitos && asig.prerrequisitos.length > 0) {
                        const dependeDeEsta = asig.prerrequisitos.some(p => p.id === asignatura_id);
                        if (dependeDeEsta) {
                            const todosCumplidos = asig.prerrequisitos.every(p => completadasSet.has(p.id));
                            if (todosCumplidos) {
                                recienDesbloqueadas.push({ id: asig.id, nombre: asig.nombre, semestre: asig.semestre });
                            }
                        }
                    }
                }
            }

            res.status(200).json({ 
                message: 'Progreso actualizado exitosamente',
                asignatura_id,
                estado,
                recienDesbloqueadas
            });
        } catch (error) {
            console.error('[UpdateProgress Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
