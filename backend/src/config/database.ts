import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Asignatura } from '../models/asignatura.model';
import { RecursoContenido } from '../models/resource.model';
import { ProgresoEstudiante } from '../models/progress.model';
import { SoporteTicket } from '../models/ticket.model';
import { AuditoriaPensum } from '../models/auditoria.model';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [
        Role,
        User,
        Asignatura,
        RecursoContenido,
        ProgresoEstudiante,
        SoporteTicket,
        AuditoriaPensum
    ]
});
