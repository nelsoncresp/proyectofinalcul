import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.post('/update', authenticateJWT, requireRole([3]), ProgressController.updateProgress);

export default router;
