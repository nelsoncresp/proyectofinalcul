import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Listado de usuarios con filtros (Solo Administrador)
router.get('/', authenticateJWT, requireRole([1]), UserController.getUsers);

// Perfil del usuario autenticado (cualquier rol)
router.get('/me', authenticateJWT, UserController.getMe);
router.patch('/me', authenticateJWT, UserController.updateMe);
router.patch('/me/password', authenticateJWT, UserController.changeMyPassword);

// Alta de docentes, administradores y alumnos (Solo Administrador)
router.post('/', authenticateJWT, requireRole([1]), UserController.createUser);

// Restablecimiento de contraseña (Solo Administrador)
router.patch('/:id/reset-password', authenticateJWT, requireRole([1]), UserController.resetPassword);

export default router;
