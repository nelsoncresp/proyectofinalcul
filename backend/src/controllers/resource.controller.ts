import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { RecursoContenido } from '../models/resource.model';

export const ResourceController = {
    async getResources(req: Request, res: Response): Promise<void> {
        try {
            const { asignatura_id } = req.params;
            const resourceRepository = AppDataSource.getRepository(RecursoContenido);

            const resources = await resourceRepository.find({
                where: {
                    asignatura_id: parseInt(asignatura_id as string, 10),
                    estado_revision: 'aprobado'
                }
            });

            res.status(200).json(resources);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
