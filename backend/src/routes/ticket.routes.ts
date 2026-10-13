import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Creación de ticket de soporte para recurso caído (Estudiantes, Docentes, Admins)
router.post('/create', authenticateJWT, TicketController.createTicket);

// Listado de tickets para resolución técnica (Docentes y Admins)
router.get('/', authenticateJWT, requireRole([1, 2]), TicketController.getTickets);

export default router;
