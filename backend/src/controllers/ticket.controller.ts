import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { SoporteTicket } from '../models/ticket.model';

export const TicketController = {
    async createTicket(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            const { recurso_id, descripcion } = req.body;

            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const ticketRepository = AppDataSource.getRepository(SoporteTicket);
            const newTicket = ticketRepository.create({
                usuario_id,
                recurso_id,
                descripcion
            });
            await ticketRepository.save(newTicket);

            res.status(201).json({ message: 'Ticket created successfully' });
        } catch (error) {
            console.error('[Ticket Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
