import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import progressRoutes from './routes/progress.routes';
import resourceRoutes from './routes/resource.routes';
import ticketRoutes from './routes/ticket.routes';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

app.use(cors());
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
app.use('/prueba', (req, res) => {
    console.log('HOLA'); res.send('HOLA, culo con cara <br> uaa');
}
);

import { AppDataSource } from './config/database';

AppDataSource.initialize().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch(error => console.log(error));
