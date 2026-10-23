import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { SoporteTicket } from '../models/ticket.model';

export const TicketController = {
    async createTicket(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            const { asunto, recurso_id, descripcion } = req.body;

            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (!asunto || typeof asunto !== 'string' || !asunto.trim()) {
                res.status(400).json({ error: 'El asunto del reporte es obligatorio' });
                return;
            }
            if (asunto.trim().length > 150) {
                res.status(400).json({ error: 'El asunto no puede superar 150 caracteres' });
                return;
            }
            if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 10) {
                res.status(400).json({ error: 'Describe el problema con al menos 10 caracteres' });
                return;
            }

            const recursoNum = recurso_id === undefined || recurso_id === null || recurso_id === ''
                ? null
                : Number(recurso_id);
            if (recursoNum !== null && (isNaN(recursoNum) || recursoNum <= 0)) {
                res.status(400).json({ error: 'recurso_id inválido' });
                return;
            }

            const ticketRepository = AppDataSource.getRepository(SoporteTicket);
            const newTicket = ticketRepository.create({
                usuario_id,
                asunto: asunto.trim(),
                recurso_id: recursoNum,
                descripcion: descripcion.trim()
            });
            await ticketRepository.save(newTicket);

            res.status(201).json({ message: 'Reporte enviado. El equipo docente lo revisará pronto.', ticket: newTicket });
        } catch (error) {
            console.error('[Ticket Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getTickets(req: AuthRequest, res: Response): Promise<void> {
        try {
            const ticketRepository = AppDataSource.getRepository(SoporteTicket);
            const tickets = await ticketRepository.find({
                relations: ['recurso', 'usuario'],
                order: { id: 'DESC' }
            });
            res.status(200).json(tickets);
        } catch (error) {
            console.error('[GetTickets Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Tickets propios del usuario autenticado (cualquier rol).
     * Es lo que consume el estudiante en su sección "Mis reportes".
     */
    async getMisTickets(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const ticketRepository = AppDataSource.getRepository(SoporteTicket);
            const tickets = await ticketRepository.find({
                where: { usuario_id },
                relations: ['recurso'],
                order: { id: 'DESC' }
            });
            res.status(200).json(tickets);
        } catch (error) {
            console.error('[GetMisTickets Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Marca un ticket como 'resuelto' o lo reabre como 'abierto'.
     * Acción disponible para Docentes y Administradores.
     */
    async updateTicketEstado(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { estado } = req.body;

            if (estado !== 'abierto' && estado !== 'resuelto') {
                res.status(400).json({ error: "estado debe ser 'abierto' o 'resuelto'" });
                return;
            }

            const ticketRepository = AppDataSource.getRepository(SoporteTicket);
            const ticket = await ticketRepository.findOneBy({ id });
            if (!ticket) {
                res.status(404).json({ error: 'Ticket no encontrado' });
                return;
            }

            ticket.estado = estado;
            await ticketRepository.save(ticket);

            res.status(200).json({ message: `Ticket #${id} marcado como ${estado}`, ticket });
        } catch (error) {
            console.error('[UpdateTicket Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
