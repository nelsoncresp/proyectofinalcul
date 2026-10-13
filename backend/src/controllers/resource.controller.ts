import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { RecursoContenido } from '../models/resource.model';

export const ResourceController = {
    /**
     * Obtiene los recursos aprobados para una asignatura específica (estudiantes y público general autenticado).
     */
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
            console.error('[GetResources Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Lista todos los recursos (incluidos pendientes) para revisión por parte de Docentes y Administradores.
     */
    async getAllResources(req: AuthRequest, res: Response): Promise<void> {
        try {
            const resourceRepository = AppDataSource.getRepository(RecursoContenido);
            const resources = await resourceRepository.find({
                relations: ['asignatura'],
                order: { id: 'DESC' }
            });
            res.status(200).json(resources);
        } catch (error) {
            console.error('[GetAllResources Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Permite a un Docente o Administrador proponer un nuevo recurso.
     * Si lo crea un Admin (rol 1), queda automáticamente 'aprobado'; si es Docente (rol 2), queda 'pendiente'.
     */
    async createResource(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { asignatura_id, titulo, tipo_recurso, enlace } = req.body;
            if (!asignatura_id || !titulo || !tipo_recurso || !enlace) {
                res.status(400).json({ error: 'Faltan campos requeridos (asignatura_id, titulo, tipo_recurso, enlace)' });
                return;
            }

            const rol_id = req.user?.rol_id;
            const estado_revision = rol_id === 1 ? 'aprobado' : 'pendiente';

            const resourceRepository = AppDataSource.getRepository(RecursoContenido);
            const nuevoRecurso = resourceRepository.create({
                asignatura_id,
                titulo,
                tipo_recurso,
                enlace,
                estado_revision
            });
            await resourceRepository.save(nuevoRecurso);

            res.status(201).json({
                message: 'Recurso registrado exitosamente',
                recurso: nuevoRecurso
            });
        } catch (error) {
            console.error('[CreateResource Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Permite a un Administrador aprobar o rechazar un recurso en curaduría.
     */
    async updateResourceStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { estado_revision } = req.body;

            if (!['aprobado', 'rechazado', 'pendiente'].includes(estado_revision)) {
                res.status(400).json({ error: 'Estado inválido. Opciones: aprobado, rechazado, pendiente' });
                return;
            }

            const resourceRepository = AppDataSource.getRepository(RecursoContenido);
            const recurso = await resourceRepository.findOneBy({ id });
            if (!recurso) {
                res.status(404).json({ error: 'Recurso no encontrado' });
                return;
            }

            recurso.estado_revision = estado_revision;
            await resourceRepository.save(recurso);

            res.status(200).json({
                message: `Recurso actualizado a estado ${estado_revision}`,
                recurso
            });
        } catch (error) {
            console.error('[UpdateResourceStatus Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
