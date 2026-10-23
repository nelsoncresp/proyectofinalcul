import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';

/**
 * Métricas agregadas del panel de administración (R-17/R-18).
 * Todas las consultas son de solo lectura sobre agregados; ninguna expone
 * contraseñas ni datos sensibles a nivel de fila.
 */

interface ConteoRol {
    rol_id: number;
    total: number;
}

interface AvanceArea {
    area_id: number;
    nombre: string;
    color: string;
    icono: string;
    total_materias: number;
    avance_promedio: number;
}

/** Usuarios totales y desglosados por rol. */
async function obtenerUsuariosPorRol(): Promise<{ total: number; por_rol: ConteoRol[] }> {
    const filas: ConteoRol[] = await AppDataSource.query(
        'SELECT rol_id, COUNT(*) AS total FROM usuarios GROUP BY rol_id ORDER BY rol_id'
    );
    const total = filas.reduce((suma, fila) => suma + Number(fila.total), 0);
    return { total, por_rol: filas };
}

/**
 * Avance promedio de los estudiantes por área.
 * Regla idéntica a la del pensum: una materia cuenta como completada si el
 * estudiante tiene progreso explícito O si su semestre es anterior al suyo.
 */
async function obtenerAvancePorArea(): Promise<AvanceArea[]> {
    return AppDataSource.query(`
        SELECT
            ar.id AS area_id,
            ar.nombre,
            ar.color,
            ar.icono,
            COUNT(DISTINCT a.id) AS total_materias,
            COALESCE(ROUND(AVG(
                CASE WHEN p.asignatura_id IS NOT NULL OR a.semestre < COALESCE(u.semestre, 1)
                     THEN 100 ELSE 0 END
            )), 0) AS avance_promedio
        FROM areas_conocimiento ar
        JOIN asignaturas a ON a.area_id = ar.id
        CROSS JOIN (SELECT id, semestre FROM usuarios WHERE rol_id = 3) u
        LEFT JOIN progreso_estudiante p
               ON p.usuario_id = u.id AND p.asignatura_id = a.id AND p.estado = 'completado'
        GROUP BY ar.id, ar.nombre, ar.color, ar.icono
        ORDER BY ar.id
    `);
}

/** Recursos de contenido agrupados por estado de curaduría. */
async function obtenerRecursosPorEstado(): Promise<Record<string, number>> {
    const filas: { estado_revision: string; total: number }[] = await AppDataSource.query(
        'SELECT estado_revision, COUNT(*) AS total FROM recursos_contenido GROUP BY estado_revision'
    );
    const porEstado: Record<string, number> = { aprobado: 0, pendiente: 0, rechazado: 0 };
    filas.forEach(fila => (porEstado[fila.estado_revision] = Number(fila.total)));
    return porEstado;
}

/** Resumen de tickets de soporte por estado. */
async function obtenerTickets(): Promise<{ total: number; abiertos: number; resueltos: number }> {
    const filas: { estado: string; total: number }[] = await AppDataSource.query(
        'SELECT estado, COUNT(*) AS total FROM soporte_tickets GROUP BY estado'
    );
    let total = 0;
    let abiertos = 0;
    let resueltos = 0;
    filas.forEach(fila => {
        const cantidad = Number(fila.total);
        total += cantidad;
        if (fila.estado === 'abierto') abiertos = cantidad;
        if (fila.estado === 'resuelto') resueltos = cantidad;
    });
    return { total, abiertos, resueltos };
}

/** Cobertura de contenido curado: materias con lección publicada o reto. */
async function obtenerCoberturaContenido(): Promise<{
    total_materias: number;
    con_leccion: number;
    con_reto: number;
}> {
    const filas: { total_materias: number; con_leccion: number; con_reto: number }[] =
        await AppDataSource.query(`
            SELECT
                (SELECT COUNT(*) FROM asignaturas) AS total_materias,
                (SELECT COUNT(*) FROM lecciones_evaluaciones WHERE estado = 'publicada') AS con_leccion,
                (SELECT COUNT(*) FROM retos) AS con_reto
        `);
    const fila = filas[0];
    return {
        total_materias: Number(fila.total_materias),
        con_leccion: Number(fila.con_leccion),
        con_reto: Number(fila.con_reto)
    };
}

/** Inicios de sesión por día (últimos 30 días) desde la auditoría. */
async function obtenerLoginsPorDia(): Promise<{ fecha: string; total: number }[]> {
    const filas: { fecha: string; total: number }[] = await AppDataSource.query(`
        SELECT DATE(fecha) AS fecha, COUNT(*) AS total
        FROM auditoria_pensum
        WHERE accion = 'LOGIN' AND fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(fecha)
        ORDER BY fecha ASC
    `);
    return filas.map(fila => ({ fecha: String(fila.fecha), total: Number(fila.total) }));
}

export const StatsController = {
    /**
     * Panel completo de métricas para el Administrador.
     */
    async getAdminStats(_req: AuthRequest, res: Response): Promise<void> {
        try {
            const [usuarios, avance, recursos, tickets, cobertura, logins] = await Promise.all([
                obtenerUsuariosPorRol(),
                obtenerAvancePorArea(),
                obtenerRecursosPorEstado(),
                obtenerTickets(),
                obtenerCoberturaContenido(),
                obtenerLoginsPorDia()
            ]);

            res.status(200).json({
                usuarios,
                avancePorArea: avance,
                recursos,
                tickets,
                cobertura,
                loginsPorDia: logins
            });
        } catch (error) {
            console.error('[GetAdminStats Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
