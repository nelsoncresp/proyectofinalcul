import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Asignatura } from '../models/asignatura.model';
import { RecursoContenido } from '../models/resource.model';
import { ProgresoEstudiante } from '../models/progress.model';
import { SoporteTicket } from '../models/ticket.model';
import { AuditoriaPensum } from '../models/auditoria.model';

import { Area } from '../models/area.model';
import { LeccionEvaluacion } from '../models/leccion.model';
import { Reto } from '../models/reto.model';
import { CorteAprobado } from '../models/corte-aprobado.model';
import { InscripcionCurso } from '../models/inscripcion-curso.model';
import { CursoExtracurricular } from '../models/curso-extracurricular.model';
import { ModuloCurso } from '../models/modulo-curso.model';
import { ProgresoModuloCurso } from '../models/progreso-modulo-curso.model';

dotenv.config();

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Aiven exige TLS. El certificado CA viaja en el repo (backend/ca.pem),
 * así que no hay que pegarlo en ninguna variable de entorno.
 * Solo se necesita DB_SSL=true.
 */
function sslMysql() {
    if ((process.env.DB_SSL || '').toLowerCase() !== 'true') return undefined;

    const ca = process.env.DB_CA;
    const ruta = process.env.DB_CA_PATH;
    const porDefecto = path.resolve(process.cwd(), 'ca.pem');

    if (ca) return { ca, rejectUnauthorized: true };
    if (ruta) return { ca: readFileSync(path.resolve(process.cwd(), ruta)), rejectUnauthorized: true };
    if (existsSync(porDefecto)) return { ca: readFileSync(porDefecto), rejectUnauthorized: true };

    return { rejectUnauthorized: false };
}

const ssl = sslMysql();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...(ssl ? { ssl } : {}),
    synchronize: false,
    logging: false,
    entities: [
        Role,
        User,
        Area,
        Asignatura,
        LeccionEvaluacion,
        Reto,
        RecursoContenido,
        ProgresoEstudiante,
        SoporteTicket,
        AuditoriaPensum,
        CorteAprobado,
        InscripcionCurso,
        CursoExtracurricular,
        ModuloCurso,
        ProgresoModuloCurso
    ]
});
