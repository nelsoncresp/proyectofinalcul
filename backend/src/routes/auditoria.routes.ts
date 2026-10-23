import { Router } from 'express';
import { AuditoriaController } from '../controllers/auditoria.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Consulta de auditoría del sistema (Solo Administrador)
router.get('/', authenticateJWT, requireRole([1]), AuditoriaController.getAuditoria);

export default router;
