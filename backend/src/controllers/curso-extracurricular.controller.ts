import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { InscripcionCurso } from '../models/inscripcion-curso.model';
import { INTERESES_PERMITIDOS } from './auth.controller';

/** ID del catálogo: letras, números, guion y guion bajo, máx. 50. */
const CURSO_ID_RE = /^[A-Za-z0-9_-]{1,50}$/;
const MAX_MODULOS = 50;

function validarModulosVistos(valor: unknown): number[] | null {
    if (!Array.isArray(valor)) return null;
    const indices = valor.map(Number);
    const invalido = indices.some(n => !Number.isInteger(n) || n < 0 || n >= MAX_MODULOS);
    if (invalido) return null;
    return [...new Set(indices)].sort((a, b) => a - b);
}

/**
 * Inscripciones del estudiante en cursos extracurriculares por interés.
 * Todo es propio del usuario autenticado (la lista solo retorna lo suyo).
 */
export const CursoExtracurricularController = {
    /** Inscripciones propias del estudiante. */
    async getMisInscripciones(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const repo = AppDataSource.getRepository(InscripcionCurso);
            const inscripciones = await repo.find({
                where: { usuario_id },
                order: { id: 'ASC' }
            });
            res.status(200).json(inscripciones);
        } catch (error) {
            console.error('[GetMisInscripciones Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /** Se inscribe en un curso del catálogo (idempotente). */
    async inscribirse(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const curso_id = String(req.params.cursoId ?? '');
            const { interes } = req.body;

            if (!CURSO_ID_RE.test(curso_id)) {
                res.status(400).json({ error: 'Identificador de curso inválido' });
                return;
            }
            if (typeof interes !== 'string' || !INTERESES_PERMITIDOS.includes(interes)) {
                res.status(400).json({ error: 'Interés inválido para el curso' });
                return;
            }

            const repo = AppDataSource.getRepository(InscripcionCurso);
            let inscripcion = await repo.findOneBy({ usuario_id, curso_id });

            if (!inscripcion) {
                inscripcion = repo.create({ usuario_id, curso_id, interes, modulos_vistos: [] });
            } else {
                inscripcion.interes = interes;
            }
            const guardada = await repo.save(inscripcion);

            res.status(200).json({
                message: 'Inscripción confirmada',
                inscripcion: guardada
            });
        } catch (error) {
            console.error('[InscribirseCurso Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /** Se da de baja del curso. */
    async desinscribirse(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const curso_id = String(req.params.cursoId ?? '');
            const repo = AppDataSource.getRepository(InscripcionCurso);
            const inscripcion = await repo.findOneBy({ usuario_id, curso_id });

            if (!inscripcion) {
                res.status(404).json({ error: 'No estás inscrito en este curso' });
                return;
            }

            await repo.remove(inscripcion);
            res.status(200).json({ message: 'Inscripción cancelada' });
        } catch (error) {
            console.error('[DesinscribirseCurso Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /** Guarda los módulos del temario marcados como vistos. */
    async guardarProgreso(req: AuthRequest, res: Response): Promise<void> {
        try {
            const usuario_id = req.user?.id;
            if (!usuario_id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const curso_id = String(req.params.cursoId ?? '');
            const modulos_vistos = validarModulosVistos(req.body?.modulos_vistos);
            if (!modulos_vistos) {
                res.status(400).json({ error: 'modulos_vistos debe ser una lista de índices válida' });
                return;
            }

            const repo = AppDataSource.getRepository(InscripcionCurso);
            const inscripcion = await repo.findOneBy({ usuario_id, curso_id });
            if (!inscripcion) {
                res.status(404).json({ error: 'No estás inscrito en este curso' });
                return;
            }

            inscripcion.modulos_vistos = modulos_vistos;
            const guardada = await repo.save(inscripcion);

            res.status(200).json({
                message: 'Progreso guardado',
                modulos_vistos: guardada.modulos_vistos
            });
        } catch (error) {
            console.error('[GuardarProgresoCurso Error]:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
