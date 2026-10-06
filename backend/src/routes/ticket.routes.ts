import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create', authenticateJWT, TicketController.createTicket);

export default router;
