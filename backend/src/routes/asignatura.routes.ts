import { Router } from 'express';
import { AsignaturaController } from '../controllers/asignatura.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Consulta del pensum estructurado por áreas y semestres con estado del usuario en tiempo real
router.get('/pensum', authenticateJWT, AsignaturaController.getPensum);

// Rutas propias del Docente / Administrador (R-12)
router.get('/mis-rutas', authenticateJWT, requireRole([1, 2]), AsignaturaController.getMisRutas);

// Creación de nueva asignatura o ruta (Docente y Admin) (R-12)
router.post('/', authenticateJWT, requireRole([1, 2]), AsignaturaController.createAsignatura);

// Creación o edición de lección de asignatura (Docente y Admin) (R-12)
router.post('/:id/leccion', authenticateJWT, requireRole([1, 2]), AsignaturaController.saveLeccion);

// Detalle de la lección interactiva de una asignatura
router.get('/:id/leccion', authenticateJWT, AsignaturaController.getLeccion);

// Evaluación del cuestionario de la lección
router.post('/:id/evaluar', authenticateJWT, AsignaturaController.evaluarLeccion);

// Inscripción del estudiante en una materia (pestaña "Para ti")
router.post('/:id/inscribirse', authenticateJWT, requireRole([3]), AsignaturaController.inscribirse);
router.delete('/:id/inscribirse', authenticateJWT, requireRole([3]), AsignaturaController.desinscribirse);

export default router;
