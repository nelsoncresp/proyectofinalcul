/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CARGAR-CONTENIDO · Carga idempotente del contenido curado del pensum CUL
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Uso (desde backend/):
 *    npx tsx cargar-contenido.ts              respalda y escribe
 *    npx tsx cargar-contenido.ts --dry-run    solo reporta, no escribe nada
 *
 * Qué hace:
 *   1. Respalda `lecciones_evaluaciones` y `recursos_contenido` a JSON en
 *      backend/backups/ ANTES de tocar cualquier dato.
 *   2. Resuelve cada materia del contenido por NOMBRE exacto (minúsculas y
 *      sin acentos) contra `asignaturas`. Un nombre inexistente detiene el
 *      proceso con reporte claro (código de salida 1) — nada se escribe.
 *   3. UPSERT de la lección por asignatura_id: actualiza la fila si existe
 *      (cubre las heredadas del seed viejo y las genéricas que el backend
 *      autogenera) o la inserta si no existe.
 *   4. Reemplaza los recursos con estado 'aprobado' de cada materia por la
 *      lista curada (estado 'aprobado'). Los recursos en cola del admin
 *      ('pendiente' / 'rechazado') NO se tocan.
 *   5. Reporte final: cobertura N/59, lecciones y recursos escritos,
 *      materias sin video y ruta del respaldo.
 */
import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { contenidoPorSemestre } from './content';
import type { ContenidoAsignatura } from './content/tipos';

const DRY_RUN = process.argv.includes('--dry-run');
const TOTAL_PENSUM = 59;

/** Normaliza para comparar nombres: sin acentos, minúsculas, sin espacios sobrantes. */
const normalizar = (texto: string): string =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

interface AsignaturaRow {
    id: number;
    nombre: string;
    semestre: number;
}

async function main(): Promise<void> {
    const conn = await createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'plataforma_academica',
    });

    try {
        console.log(`\n== CARGAR-CONTENIDO ${DRY_RUN ? '(dry-run: nada se escribe)' : ''}==\n`);

        // ── 1. Respaldo de las tablas que se van a modificar ────────────────
        const [filasLecciones] = await conn.query('SELECT * FROM lecciones_evaluaciones');
        const [filasRecursos] = await conn.query('SELECT * FROM recursos_contenido');

        const carpetaBackups = path.join(__dirname, 'backups');
        const sello = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
        const rutaBackup = path.join(carpetaBackups, `contenido-${sello}.json`);

        if (!DRY_RUN) {
            await mkdir(carpetaBackups, { recursive: true });
            await writeFile(
                rutaBackup,
                JSON.stringify(
                    { generado_en: new Date().toISOString(), lecciones_evaluaciones: filasLecciones, recursos_contenido: filasRecursos },
                    null,
                    2,
                ),
                'utf-8',
            );
        }
        console.log(
            `Respaldo: ${filasLecciones.length} lecciones y ${filasRecursos.length} recursos -> ${DRY_RUN ? '(se haria en ' + rutaBackup + ')' : rutaBackup}`,
        );

        // Tabla de retos de código (idempotente; no existe en el seed original).
        await conn.query(
            'CREATE TABLE IF NOT EXISTS retos (' +
                'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
                'asignatura_id INT NOT NULL,' +
                'enunciado TEXT NOT NULL,' +
                'plantilla TEXT NOT NULL,' +
                'nombre_funcion VARCHAR(100) NOT NULL,' +
                'casos TEXT NOT NULL,' +
                'UNIQUE KEY UQ_retos_asignatura (asignatura_id),' +
                'CONSTRAINT FK_retos_asignatura FOREIGN KEY (asignatura_id) REFERENCES asignaturas (id) ON DELETE CASCADE' +
                ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
        );

        // ── 2. Índice de asignaturas por nombre normalizado ─────────────────
        const [asignaturas] = await conn.query<AsignaturaRow[]>(
            'SELECT id, nombre, semestre FROM asignaturas ORDER BY semestre, id',
        );
        const porNombre = new Map<string, AsignaturaRow>();
        for (const asig of asignaturas) {
            porNombre.set(normalizar(asig.nombre), asig);
        }

        // ── 3. Aplanar el contenido y validar ───────────────────────────────
        const entradas: ContenidoAsignatura[] = [];
        for (const [semestre, lista] of Object.entries(contenidoPorSemestre)) {
            for (const entrada of lista) {
                entradas.push(entrada);
                if (entrada.preguntas.length === 0) {
                    fallar(`La materia "${entrada.nombre}" (semestre ${semestre}) no tiene preguntas.`);
                }
            }
        }

        const vistas = new Set<string>();
        for (const entrada of entradas) {
            const clave = normalizar(entrada.nombre);
            if (vistas.has(clave)) {
                fallar(`Materia duplicada en el contenido: "${entrada.nombre}".`);
            }
            vistas.add(clave);
            if (entrada.recursos.length === 0) {
                fallar(`La materia "${entrada.nombre}" no tiene recursos.`);
            }
            for (const pregunta of entrada.preguntas) {
                if (pregunta.opciones.length !== 4) {
                    fallar(`"${entrada.nombre}": la pregunta "${pregunta.pregunta.slice(0, 40)}..." no tiene 4 opciones.`);
                }
                if (pregunta.respuesta_correcta < 0 || pregunta.respuesta_correcta > 3) {
                    fallar(`"${entrada.nombre}": respuesta_correcta fuera de rango (0-3).`);
                }
            }
        }

        const noEncontradas = entradas
            .filter((entrada) => !porNombre.has(normalizar(entrada.nombre)))
            .map((entrada) => entrada.nombre);
        if (noEncontradas.length > 0) {
            fallar(
                `${noEncontradas.length} nombre(s) del contenido NO existen en asignaturas:\n` +
                    noEncontradas.map((n) => `   - "${n}"`).join('\n') +
                    '\nCorrige el nombre en backend/content/ para que coincida exactamente con la BD.',
            );
        }

        const pendientes = asignaturas.filter((asig) => !vistas.has(normalizar(asig.nombre)));
        const cobertura = `${entradas.length}/${TOTAL_PENSUM}`;

        // Recursos referenciados por tickets de soporte: no se borran (FK).
        const [filasTickets] = await conn.query(
            'SELECT DISTINCT recurso_id FROM soporte_tickets WHERE recurso_id IS NOT NULL',
        );
        const protegidos = new Set(
            (filasTickets as { recurso_id: number }[]).map((fila) => fila.recurso_id),
        );

        // Recursos históricos que quedaron en la materia equivocada tras la
        // migración del pensum: se reubican en su materia real (los tickets
        // que los referencian conservan su vínculo).
        const REUBICACIONES: { id: number; destino: string }[] = [
            { id: 2, destino: 'Fundamentos de programacion' },
            { id: 3, destino: 'Programacion orientada a objetivos' },
        ];
        let reubicados = 0;
        for (const movimiento of REUBICACIONES) {
            const destino = porNombre.get(normalizar(movimiento.destino));
            if (!destino) {
                fallar(`Reubicación: el destino "${movimiento.destino}" no existe en asignaturas.`);
            }
            if (!DRY_RUN) {
                const [upd] = await conn.query(
                    'UPDATE recursos_contenido SET asignatura_id = ? WHERE id = ? AND asignatura_id <> ?',
                    [destino.id, movimiento.id, destino.id],
                );
                reubicados += (upd as { affectedRows: number }).affectedRows;
            }
        }

        // ── 4. Escritura (UPSERT lección + reemplazo de recursos) ───────────
        let leccionesActualizadas = 0;
        let leccionesInsertadas = 0;
        let recursosInsertados = 0;
        let recursosReemplazados = 0;
        let retosEscritos = 0;
        const sinVideo: string[] = [];

        for (const entrada of entradas) {
            const asig = porNombre.get(normalizar(entrada.nombre))!;
            const pregunta = entrada.preguntas[0];

            if (!entrada.video_url) {
                sinVideo.push(entrada.nombre);
            }

            if (!DRY_RUN) {
                const [existe] = await conn.query(
                    'SELECT id FROM lecciones_evaluaciones WHERE asignatura_id = ?',
                    [asig.id],
                );
                const campos = [
                    entrada.contenido_lectura,
                    entrada.video_url,
                    entrada.tiempo_minimo_segundos,
                    pregunta.pregunta,
                    JSON.stringify(pregunta.opciones),
                    pregunta.respuesta_correcta,
                    pregunta.explicacion,
                ];
                if ((existe as unknown[]).length > 0) {
                    await conn.query(
                        'UPDATE lecciones_evaluaciones SET contenido_lectura = ?, video_url = ?, ' +
                            'tiempo_minimo_segundos = ?, pregunta = ?, opciones = ?, respuesta_correcta = ?, explicacion = ? ' +
                            'WHERE asignatura_id = ?',
                        [...campos, asig.id],
                    );
                    leccionesActualizadas += 1;
                } else {
                    await conn.query(
                        'INSERT INTO lecciones_evaluaciones ' +
                            '(asignatura_id, contenido_lectura, video_url, tiempo_minimo_segundos, pregunta, opciones, respuesta_correcta, explicacion) ' +
                            'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [asig.id, ...campos],
                    );
                    leccionesInsertadas += 1;
                }

                // Reto de código práctico (opcional): upsert por asignatura.
                if (entrada.reto) {
                    retosEscritos += 1;
                    const camposReto = [
                        entrada.reto.enunciado,
                        entrada.reto.plantilla,
                        entrada.reto.nombre_funcion,
                        JSON.stringify(entrada.reto.casos),
                    ];
                    const [existeReto] = await conn.query('SELECT id FROM retos WHERE asignatura_id = ?', [asig.id]);
                    if ((existeReto as unknown[]).length > 0) {
                        await conn.query(
                            'UPDATE retos SET enunciado = ?, plantilla = ?, nombre_funcion = ?, casos = ? WHERE asignatura_id = ?',
                            [...camposReto, asig.id],
                        );
                    } else {
                        await conn.query(
                            'INSERT INTO retos (asignatura_id, enunciado, plantilla, nombre_funcion, casos) VALUES (?, ?, ?, ?, ?)',
                            [asig.id, ...camposReto],
                        );
                    }
                }

                // Recursos curados: reemplaza solo los ya aprobados de esta
                // materia, sin tocar los que tienen tickets de soporte (FK).
                const condProtegidos =
                    protegidos.size > 0 ? ` AND id NOT IN (${[...protegidos].join(',')})` : '';
                const [borrados] = await conn.query(
                    `DELETE FROM recursos_contenido WHERE asignatura_id = ? AND estado_revision = 'aprobado'${condProtegidos}`,
                    [asig.id],
                );
                recursosReemplazados += (borrados as { affectedRows: number }).affectedRows;
                for (const recurso of entrada.recursos) {
                    await conn.query(
                        "INSERT INTO recursos_contenido (asignatura_id, titulo, tipo_recurso, enlace, estado_revision) VALUES (?, ?, ?, ?, 'aprobado')",
                        [asig.id, recurso.titulo, recurso.tipo, recurso.enlace],
                    );
                    recursosInsertados += 1;
                }
            } else {
                leccionesActualizadas += (await existeLeccion(conn, asig.id)) ? 1 : 0;
                leccionesInsertadas += (await existeLeccion(conn, asig.id)) ? 0 : 1;
            }
        }

        // ── 5. Reporte final ────────────────────────────────────────────────
        console.log(`\nCobertura del pensum: ${cobertura} materias con contenido curado`);
        if (DRY_RUN) {
            console.log(
                `Plan: ${leccionesActualizadas} leccion(es) a actualizar, ${leccionesInsertadas} a insertar, ${entradas.reduce((n, e) => n + e.recursos.length, 0)} recursos a escribir.`,
            );
        } else {
            console.log(
                `Lecciones: ${leccionesActualizadas} actualizadas, ${leccionesInsertadas} insertadas`,
            );
            console.log(
                `Recursos: ${recursosInsertados} escritos (${recursosReemplazados} previos 'aprobado' reemplazados)`,
            );
            if (reubicados > 0) {
                console.log(`Recursos reubicados a su materia real: ${reubicados}`);
            }
            if (retosEscritos > 0) {
                console.log(`Retos de código escritos: ${retosEscritos}`);
            }
        }
        if (sinVideo.length > 0) {
            console.log(`\nAdvertencia: ${sinVideo.length} materia(s) quedaron SIN video (video_url = null):`);
            for (const nombre of sinVideo) {
                console.log(`   - ${nombre}`);
            }
        }
        if (pendientes.length > 0) {
            console.log(`\nPendientes de curar (${pendientes.length}):`);
            for (const asig of pendientes) {
                console.log(`   - sem ${asig.semestre} | ${asig.nombre}`);
            }
        }
        console.log(`\n${DRY_RUN ? 'Dry-run terminado.' : 'Contenido cargado.'} ✓\n`);
    } finally {
        await conn.end();
    }
}

async function existeLeccion(conn: Awaited<ReturnType<typeof createConnection>>, asignaturaId: number): Promise<boolean> {
    const [filas] = await conn.query('SELECT id FROM lecciones_evaluaciones WHERE asignatura_id = ?', [asignaturaId]);
    return (filas as unknown[]).length > 0;
}

function fallar(mensaje: string): never {
    console.error(`\n[ERROR] ${mensaje}\n`);
    process.exit(1);
}

main().catch((error) => {
    console.error('\nFallo inesperado al cargar contenido:', error);
    process.exit(1);
});
