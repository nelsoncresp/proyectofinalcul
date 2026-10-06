import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';

export const AuthController = {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { nombre, email, password, rol_id, semestre, jornada } = req.body;
            const userRepository = AppDataSource.getRepository(User);
            
            const existingUser = await userRepository.findOneBy({ email });
            if (existingUser) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const newUser = userRepository.create({
                nombre,
                email,
                password: hashedPassword,
                rol_id,
                semestre: semestre ?? null,
                jornada: jornada ?? null
            });
            const savedUser = await userRepository.save(newUser);
            
            res.status(201).json({
                id: savedUser.id,
                nombre,
                email,
                rol_id,
                semestre: savedUser.semestre,
                jornada: savedUser.jornada
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
                { id: user.id, rol_id: user.rol_id },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );
            res.status(200).json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol_id: user.rol_id } });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
