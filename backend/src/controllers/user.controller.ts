import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { AuditoriaPensum } from '../models/auditoria.model';
import { AuthRequest } from '../middlewares/auth.middleware';

const ROLES_VALIDOS = [1, 2, 3];
const JORNADAS_VALIDAS = ['Diurno', 'Nocturno'];
const GENEROS_VALIDOS = ['Masculino', 'Femenino', 'Otro', 'No especificado'];
const PASSWORD_MINIMO = 6;

/** Representación segura de usuario: nunca expone el hash de contraseña. */
interface UsuarioSeguro {
    id: number;
    nombre: string;
    email: string;
    rol_id: number;
    semestre: number | null;
    jornada: string | null;
    genero: string | null;
    intereses: string[] | null;
}

function aUsuarioSeguro(user: User): UsuarioSeguro {
    return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol_id: user.rol_id,
        semestre: user.semestre,
        jornada: user.jornada,
        genero: user.genero,
        intereses: user.intereses
    };
}

function validarPassword(password: unknown): string | null {
    if (typeof password !== 'string' || password.length < PASSWORD_MINIMO) {
        return `La contraseña debe tener al menos ${PASSWORD_MINIMO} caracteres`;
    }
    return null;
}

async function registrarAuditoria(usuarioId: number, accion: string, detalle: string): Promise<void> {
    try {
        const auditRepo = AppDataSource.getRepository(AuditoriaPensum);
        await auditRepo.save(auditRepo.create({ usuario_id: usuarioId, accion, detalle }));
    } catch (auditErr) {
        console.error('[Auditoria Usuarios Error]:', auditErr);
    }
}

export const UserController = {
    /**
     * Lista usuarios con filtro opcional por rol (?rol=2) y búsqueda por
     * nombre o correo (?q=texto). Solo Administradores.
     */
    async getUsers(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);

            const qb = userRepository.createQueryBuilder('u');
            const rol = Number(req.query.rol);
            if (!isNaN(rol) && ROLES_VALIDOS.includes(rol)) {
                qb.andWhere('u.rol_id = :rol', { rol });
            }
            const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
            if (q) {
                qb.andWhere('(u.nombre LIKE :q OR u.email LIKE :q)', { q: `%${q}%` });
            }

            const users = await qb.orderBy('u.id', 'ASC').getMany();
            res.status(200).json(users.map(aUsuarioSeguro));
        } catch (error) {
            console.error('[GetUsers Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Crea un usuario con rol específico (Docente, Administrador o Alumno).
     * Solo Administradores. La contraseña se hashea con bcrypt.
     */
    async createUser(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { nombre, email, password, rol_id, semestre, jornada, genero, intereses } = req.body;

            if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
                res.status(400).json({ error: 'El nombre es obligatorio' });
                return;
            }
            if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                res.status(400).json({ error: 'El correo electrónico no es válido' });
                return;
            }
            const errorPassword = validarPassword(password);
            if (errorPassword) {
                res.status(400).json({ error: errorPassword });
                return;
            }
            const rolNum = Number(rol_id);
            if (!ROLES_VALIDOS.includes(rolNum)) {
                res.status(400).json({ error: 'rol_id debe ser 1 (Administrador), 2 (Docente) o 3 (Estudiante)' });
                return;
            }
            if (jornada !== undefined && jornada !== null && !JORNADAS_VALIDAS.includes(jornada)) {
                res.status(400).json({ error: "jornada debe ser 'Diurno' o 'Nocturno'" });
                return;
            }
            if (genero !== undefined && genero !== null && !GENEROS_VALIDOS.includes(genero)) {
                res.status(400).json({ error: 'genero debe ser Masculino, Femenino, Otro o No especificado' });
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const emailNormalizado = email.trim().toLowerCase();

            const existing = await userRepository.findOneBy({ email: emailNormalizado });
            if (existing) {
                res.status(400).json({ error: 'El correo ya está registrado' });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = userRepository.create({
                nombre: nombre.trim(),
                email: emailNormalizado,
                password: hashedPassword,
                rol_id: rolNum,
                semestre: rolNum === 3 && semestre !== undefined && semestre !== null ? Number(semestre) : null,
                jornada: jornada ?? null,
                genero: genero ?? null,
                intereses: Array.isArray(intereses) ? intereses : null
            });
            const saved = await userRepository.save(newUser);

            await registrarAuditoria(
                req.user?.id ?? saved.id,
                'CREAR_USUARIO',
                `Usuario creado por el administrador: ${saved.email} (rol_id=${rolNum})`
            );

            res.status(201).json({ message: 'Usuario creado exitosamente', usuario: aUsuarioSeguro(saved) });
        } catch (error) {
            console.error('[CreateUser Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Restablece la contraseña de un usuario. Solo Administradores.
     */
    async resetPassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { password } = req.body;

            const errorPassword = validarPassword(password);
            if (errorPassword) {
                res.status(400).json({ error: errorPassword });
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id });
            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await userRepository.save(user);

            await registrarAuditoria(
                req.user?.id ?? user.id,
                'RESTABLECER_PASSWORD',
                `Contraseña restablecida por el administrador para ${user.email}`
            );

            res.status(200).json({ message: `Contraseña de ${user.email} restablecida exitosamente` });
        } catch (error) {
            console.error('[ResetPassword Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Perfil del usuario autenticado (cualquier rol).
     */
    async getMe(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: req.user?.id ?? 0 });
            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }
            res.status(200).json(aUsuarioSeguro(user));
        } catch (error) {
            console.error('[GetMe Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Actualiza el propio perfil: nombre, género, jornada, semestre e intereses.
     * El correo, el rol y la contraseña no se tocan aquí (la contraseña tiene su
     * propio endpoint para exigir la actual).
     */
    async updateMe(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: req.user?.id ?? 0 });
            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }

            const { nombre, genero, jornada, semestre, intereses } = req.body;

            if (nombre !== undefined) {
                if (typeof nombre !== 'string' || !nombre.trim()) {
                    res.status(400).json({ error: 'El nombre no puede estar vacío' });
                    return;
                }
                user.nombre = nombre.trim();
            }
            if (genero !== undefined) {
                if (genero !== null && !GENEROS_VALIDOS.includes(genero)) {
                    res.status(400).json({ error: 'genero inválido' });
                    return;
                }
                user.genero = genero;
            }
            if (jornada !== undefined) {
                if (jornada !== null && !JORNADAS_VALIDAS.includes(jornada)) {
                    res.status(400).json({ error: "jornada debe ser 'Diurno' o 'Nocturno'" });
                    return;
                }
                user.jornada = jornada;
            }
            if (semestre !== undefined && user.rol_id === 3) {
                const sem = Number(semestre);
                if (semestre !== null && (isNaN(sem) || sem < 1 || sem > 10)) {
                    res.status(400).json({ error: 'El semestre debe estar entre 1 y 10' });
                    return;
                }
                user.semestre = semestre === null ? null : sem;
            }
            if (intereses !== undefined) {
                if (intereses !== null && !Array.isArray(intereses)) {
                    res.status(400).json({ error: 'intereses debe ser una lista' });
                    return;
                }
                user.intereses = Array.isArray(intereses) && intereses.length > 0 ? intereses : null;
            }

            const saved = await userRepository.save(user);

            await registrarAuditoria(
                saved.id,
                'ACTUALIZAR_PERFIL',
                `Perfil actualizado por el propio usuario: ${saved.email}`
            );

            res.status(200).json({ message: 'Perfil actualizado exitosamente', usuario: aUsuarioSeguro(saved) });
        } catch (error) {
            console.error('[UpdateMe Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Cambio de contraseña propio: exige la contraseña actual (seguridad).
     */
    async changeMyPassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { actual, nueva } = req.body;

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: req.user?.id ?? 0 });
            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }

            const coincide = await bcrypt.compare(String(actual ?? ''), user.password);
            if (!coincide) {
                res.status(401).json({ error: 'La contraseña actual es incorrecta' });
                return;
            }

            const errorPassword = validarPassword(nueva);
            if (errorPassword) {
                res.status(400).json({ error: errorPassword });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(nueva, salt);
            await userRepository.save(user);

            await registrarAuditoria(
                user.id,
                'CAMBIAR_PASSWORD',
                `Contraseña cambiada por el propio usuario: ${user.email}`
            );

            res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            console.error('[ChangeMyPassword Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
