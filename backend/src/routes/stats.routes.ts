import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Métricas agregadas del panel de administración (Solo Administrador)
router.get('/admin', authenticateJWT, requireRole([1]), StatsController.getAdminStats);

export default router;
