import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Consulta de recursos aprobados por asignatura (para estudiantes y docentes)
router.get('/:asignatura_id', authenticateJWT, ResourceController.getResources);

// Listado de todos los recursos para curaduría (Admin y Docentes)
router.get('/', authenticateJWT, requireRole([1, 2]), ResourceController.getAllResources);

// Propuesta de nuevo recurso (Docente y Admin)
router.post('/', authenticateJWT, requireRole([1, 2]), ResourceController.createResource);

// Aprobación o cambio de estado de recurso (Solo Administrador)
router.patch('/:id/estado', authenticateJWT, requireRole([1]), ResourceController.updateResourceStatus);

export default router;
