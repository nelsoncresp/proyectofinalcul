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

/** Recursos de contenido agrupados por estado de revisión. */
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

/** Distribución de estudiantes por semestre matriculado. */
async function obtenerDistribucionSemestres(): Promise<{ semestre: number; total: number }[]> {
    const filas: { semestre: number; total: number }[] = await AppDataSource.query(`
        SELECT semestre, COUNT(*) AS total
        FROM usuarios
        WHERE rol_id = 3 AND semestre IS NOT NULL
        GROUP BY semestre
        ORDER BY semestre ASC
    `);
    return filas.map(f => ({ semestre: Number(f.semestre), total: Number(f.total) }));
}

/** Distribución de estudiantes por jornada. */
async function obtenerDistribucionJornada(): Promise<{ jornada: string; total: number }[]> {
    const filas: { jornada: string; total: number }[] = await AppDataSource.query(`
        SELECT COALESCE(jornada, 'Sin definir') AS jornada, COUNT(*) AS total
        FROM usuarios
        WHERE rol_id = 3
        GROUP BY jornada
        ORDER BY total DESC
    `);
    return filas.map(f => ({ jornada: String(f.jornada), total: Number(f.total) }));
}

/** Estudiantes activos en los últimos 30 días (al menos un login). */
async function obtenerEstudiantesActivos(): Promise<number> {
    const filas: { activos: number }[] = await AppDataSource.query(`
        SELECT COUNT(DISTINCT ap.usuario_id) AS activos
        FROM auditoria_pensum ap
        JOIN usuarios u ON u.id = ap.usuario_id
        WHERE ap.accion = 'LOGIN'
          AND ap.fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND u.rol_id = 3
    `);
    return Number(filas[0]?.activos ?? 0);
}

/** Top 10 asignaturas con más registros de progreso (más accedidas). */
async function obtenerMateriasMasAccedidas(): Promise<
    { asignatura_id: number; nombre: string; area: string; color: string; total: number }[]
> {
    const filas = await AppDataSource.query(`
        SELECT
            a.id AS asignatura_id,
            a.nombre,
            ar.nombre AS area,
            ar.color,
            COUNT(p.id) AS total
        FROM progreso_estudiante p
        JOIN asignaturas a ON a.id = p.asignatura_id
        JOIN areas_conocimiento ar ON ar.id = a.area_id
        GROUP BY a.id, a.nombre, ar.nombre, ar.color
        ORDER BY total DESC
        LIMIT 10
    `);
    return filas.map((f: { asignatura_id: number; nombre: string; area: string; color: string; total: number }) => ({
        asignatura_id: Number(f.asignatura_id),
        nombre: f.nombre,
        area: f.area,
        color: f.color,
        total: Number(f.total)
    }));
}

async function obtenerEstadisticasCursos(): Promise<{
    porInteres: { interes: string; estudiantes: number }[];
    porEstado: { estado: string; total: number }[];
    porCurso: { curso_id: number; codigo: string; titulo: string; inscritos: number; en_progreso: number; completados: number }[];
}> {
    const porInteres = await AppDataSource.query(`
        SELECT jt.interes, COUNT(DISTINCT u.id) AS estudiantes
        FROM usuarios u
        JOIN JSON_TABLE(u.intereses, '$[*]' COLUMNS (interes VARCHAR(80) PATH '$')) jt
        WHERE u.rol_id = 3 AND u.intereses IS NOT NULL
        GROUP BY jt.interes
        ORDER BY estudiantes DESC, jt.interes ASC
    `);

    const porEstado = await AppDataSource.query(`
        SELECT estado, COUNT(*) AS total
        FROM inscripciones_cursos
        GROUP BY estado
        ORDER BY estado
    `);

    const porCurso = await AppDataSource.query(`
        SELECT c.id AS curso_id,
               c.codigo,
               c.titulo,
               COUNT(i.id) AS inscritos,
               SUM(CASE WHEN i.estado = 'en_progreso' THEN 1 ELSE 0 END) AS en_progreso,
               SUM(CASE WHEN i.estado = 'completado' THEN 1 ELSE 0 END) AS completados
        FROM cursos_extracurriculares c
        LEFT JOIN inscripciones_cursos i ON i.curso_id = c.id
        WHERE c.activo = 1
        GROUP BY c.id, c.codigo, c.titulo
        ORDER BY inscritos DESC, c.titulo ASC
    `);

    return {
        porInteres: porInteres.map((fila: { interes: string; estudiantes: number }) => ({
            interes: fila.interes,
            estudiantes: Number(fila.estudiantes)
        })),
        porEstado: porEstado.map((fila: { estado: string; total: number }) => ({
            estado: fila.estado,
            total: Number(fila.total)
        })),
        porCurso: porCurso.map((fila: {
            curso_id: number;
            codigo: string;
            titulo: string;
            inscritos: number;
            en_progreso: number;
            completados: number;
        }) => ({
            curso_id: Number(fila.curso_id),
            codigo: fila.codigo,
            titulo: fila.titulo,
            inscritos: Number(fila.inscritos),
            en_progreso: Number(fila.en_progreso),
            completados: Number(fila.completados)
        }))
    };
}

export const StatsController = {
    /**
     * Panel completo de métricas para el Administrador.
     */
    async getAdminStats(_req: AuthRequest, res: Response): Promise<void> {
        try {
            const [
                usuarios,
                avance,
                recursos,
                tickets,
                cobertura,
                logins,
                cursos,
                distribucionSemestres,
                distribucionJornada,
                estudiantesActivos,
                materiasMasAccedidas
            ] = await Promise.all([
                obtenerUsuariosPorRol(),
                obtenerAvancePorArea(),
                obtenerRecursosPorEstado(),
                obtenerTickets(),
                obtenerCoberturaContenido(),
                obtenerLoginsPorDia(),
                obtenerEstadisticasCursos(),
                obtenerDistribucionSemestres(),
                obtenerDistribucionJornada(),
                obtenerEstudiantesActivos(),
                obtenerMateriasMasAccedidas()
            ]);

            res.status(200).json({
                usuarios,
                avancePorArea: avance,
                recursos,
                tickets,
                cobertura,
                loginsPorDia: logins,
                cursos,
                distribucionSemestres,
                distribucionJornada,
                estudiantesActivos,
                materiasMasAccedidas
            });
        } catch (error) {
            console.error('[GetAdminStats Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
