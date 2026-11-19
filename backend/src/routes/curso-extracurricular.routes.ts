import { Router } from 'express';
import { CursoExtracurricularController } from '../controllers/curso-extracurricular.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Todo el flujo de cursos extracurriculares es de Estudiante (rol 3).
router.get('/catalogo', authenticateJWT, CursoExtracurricularController.getCatalogo);
router.get('/inscripciones', authenticateJWT, requireRole([3]), CursoExtracurricularController.getMisInscripciones);
router.get('/:cursoId', authenticateJWT, CursoExtracurricularController.getCursoDetalle);
router.post('/:cursoId/inscribirse', authenticateJWT, requireRole([3]), CursoExtracurricularController.inscribirse);
router.delete('/:cursoId/inscribirse', authenticateJWT, requireRole([3]), CursoExtracurricularController.desinscribirse);
router.patch('/:cursoId/progreso', authenticateJWT, requireRole([3]), CursoExtracurricularController.guardarProgreso);

export default router;
