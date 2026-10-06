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

            if (estado === 'completado') {
                const asignatura = await asignaturaRepository.findOne({ 
                    where: { id: asignatura_id },
                    relations: ['prerrequisitos'] 
                });
                
                if (asignatura && asignatura.prerrequisitos) {
                    for (const pre of asignatura.prerrequisitos) {
                        const preProgress = await progressRepository.findOneBy({ 
                            usuario_id, 
                            asignatura_id: pre.id 
                        });
                        if (!preProgress || preProgress.estado !== 'completado') {
                            res.status(400).json({ error: `Business Logic Error: Prerequisite ${pre.id} not completed` });
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

            res.status(200).json({ message: 'Progress updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
