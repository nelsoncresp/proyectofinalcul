import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { AuditoriaPensum } from '../models/auditoria.model';
import { validarIntereses } from '../config/intereses';

export const AuthController = {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { nombre, email, password, semestre, jornada, genero, intereses } = req.body;
            // El registro público SIEMPRE crea Estudiantes (rol 3). Los roles
            // 1 y 2 solo se asignan desde el panel de administración (R-17).
            const rol_id = 3;
            const GENEROS_VALIDOS = ['Masculino', 'Femenino', 'Otro', 'No especificado'];
            const userRepository = AppDataSource.getRepository(User);
            
            const existingUser = await userRepository.findOneBy({ email });
            if (existingUser) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            if (genero !== undefined && genero !== null && !GENEROS_VALIDOS.includes(genero)) {
                res.status(400).json({ error: 'Género inválido' });
                return;
            }

            let validatedIntereses: string[] | null = null;
            if (intereses !== undefined && intereses !== null) {
                const interesesValidados = validarIntereses(intereses);
                if (interesesValidados === null) {
                    res.status(400).json({ error: 'Uno o más intereses no son válidos' });
                    return;
                }
                validatedIntereses = interesesValidados;
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const newUser = userRepository.create({
                nombre,
                email,
                password: hashedPassword,
                rol_id,
                semestre: semestre ?? null,
                jornada: jornada ?? null,
                genero: genero ?? null,
                intereses: validatedIntereses
            });
            const savedUser = await userRepository.save(newUser);
            
            res.status(201).json({
                id: savedUser.id,
                nombre,
                email,
                rol_id,
                semestre: savedUser.semestre,
                jornada: savedUser.jornada,
                genero: savedUser.genero,
                intereses: savedUser.intereses
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const userRepository = AppDataSource.getRepository(User);
            
            const user = await userRepository.findOneBy({ email });
            if (!user || !user.password) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            
            const token = jwt.sign(
                { id: user.id, rol_id: user.rol_id, semestre: user.semestre },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );

            // Registrar auditoría de inicio de sesión (R-14)
            try {
                const auditRepo = AppDataSource.getRepository(AuditoriaPensum);
                const audit = auditRepo.create({
                    usuario_id: user.id,
                    accion: 'LOGIN',
                    detalle: `Inicio de sesión exitoso (${user.email})`
                });
                await auditRepo.save(audit);
            } catch (auditErr) {
                console.error('[Auditoria Login Error]:', auditErr);
            }
            res.status(200).json({ 
                token, 
                user: { 
                    id: user.id, 
                    nombre: user.nombre, 
                    email: user.email, 
                    rol_id: user.rol_id,
                    semestre: user.semestre,
                    jornada: user.jornada,
                    genero: user.genero,
                    intereses: user.intereses
                } 
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
