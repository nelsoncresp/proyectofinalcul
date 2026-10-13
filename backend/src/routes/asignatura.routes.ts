import { Router } from 'express';
import { AsignaturaController } from '../controllers/asignatura.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Consulta del pensum estructurado por áreas y semestres con estado del usuario en tiempo real
router.get('/pensum', authenticateJWT, AsignaturaController.getPensum);

// Detalle de la lección interactiva de una asignatura
router.get('/:id/leccion', authenticateJWT, AsignaturaController.getLeccion);

// Evaluación del cuestionario de la lección
router.post('/:id/evaluar', authenticateJWT, AsignaturaController.evaluarLeccion);

export default router;
