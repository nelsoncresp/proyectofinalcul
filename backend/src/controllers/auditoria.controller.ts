import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { AuditoriaPensum } from '../models/auditoria.model';

export const AuditoriaController = {
    /**
     * Lista eventos de auditoría con paginación y orden cronológico descendente.
     * Solo accesible por Administradores (rol 1).
     */
    async getAuditoria(req: AuthRequest, res: Response): Promise<void> {
        try {
            const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
            const skip = (page - 1) * limit;

            const auditoriaRepo = AppDataSource.getRepository(AuditoriaPensum);

            const [registros, total] = await auditoriaRepo.findAndCount({
                relations: ['user'],
                order: { fecha: 'DESC' },
                skip,
                take: limit
            });

            const formateados = registros.map(r => ({
                id: r.id,
                usuario_id: r.usuario_id,
                usuario_nombre: r.user?.nombre || `Usuario #${r.usuario_id}`,
                usuario_email: r.user?.email || null,
                accion: r.accion,
                detalle: r.detalle,
                fecha: r.fecha
            }));

            res.status(200).json({
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                registros: formateados
            });
        } catch (error) {
            console.error('[GetAuditoria Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
