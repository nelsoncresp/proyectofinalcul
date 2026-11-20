import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import progressRoutes from './routes/progress.routes';
import resourceRoutes from './routes/resource.routes';
import ticketRoutes from './routes/ticket.routes';
import asignaturaRoutes from './routes/asignatura.routes';
import auditoriaRoutes from './routes/auditoria.routes';
import userRoutes from './routes/user.routes';
import statsRoutes from './routes/stats.routes';
import cursoExtracurricularRoutes from './routes/curso-extracurricular.routes';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:4200')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origenesPermitidos.includes('*') || origenesPermitidos.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
import { Request, Response, NextFunction } from 'express';
app.use(express.urlencoded({ extended: true }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ error: 'Formato JSON invalido en la peticion' });
        return;
    }
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/asignaturas', asignaturaRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/cursos', cursoExtracurricularRoutes);
app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'sequora-api' });
});

import { AppDataSource } from './config/database';

AppDataSource.initialize().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch(error => console.log(error));
