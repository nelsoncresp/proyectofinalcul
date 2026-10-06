import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:asignatura_id', authenticateJWT, ResourceController.getResources);

export default router;
