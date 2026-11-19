export interface BackendUser {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  semestre?: number | null;
  jornada?: 'Diurno' | 'Nocturno' | null;
  genero?: 'Masculino' | 'Femenino' | 'Otro' | 'No especificado' | null;
  intereses?: string[] | null;
}

export interface LoginResponse {
  token: string;
  user: BackendUser;
}

export interface RegisterResponse {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  semestre: number | null;
  jornada: 'Diurno' | 'Nocturno' | null;
  intereses?: string[] | null;
}

export interface AsignaturaNodo {
  id: number;
  nombre: string;
  semestre: number;
  area_id: number;
  areaNombre: string;
  areaColor: string;
  areaIcono: string;
  estado: 'Completado' | 'Disponible' | 'Bloqueado';
  inscrito?: boolean;
  prerrequisitos: { id: number; nombre: string; completado: boolean }[];
}

export interface AreaGroup {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  porcentajeAvance: number;
  nodos: AsignaturaNodo[];
}

export interface SemestreGroup {
  semestre: number;
  total: number;
  completadas: number;
  porcentaje: number;
  materias: AsignaturaNodo[];
}

export interface PensumResponse {
  avanceGlobal: number;
  totalMaterias: number;
  totalCompletadas: number;
  areas: AreaGroup[];
  semestres: SemestreGroup[];
  practica_libre?: AsignaturaNodo[];
}

export interface LeccionData {
  id: number;
  corte: number;
  contenido_lectura: string;
  video_url: string | null;
  tiempo_minimo_segundos: number;
  pregunta: string;
  opciones: string[];
}

export interface CorteInfo {
  corte: number;
  estado: 'aprobada' | 'publicada' | 'borrador' | 'pendiente';
  aprobado: boolean;
}

export interface RetoData {
  id: number;
  enunciado: string;
  plantilla: string;
  nombre_funcion: string;
  casos: { entrada: unknown[]; esperado: unknown }[];
}

export interface RecursoItem {
  id: number;
  asignatura_id: number;
  titulo: string;
  tipo_recurso: string;
  enlace: string;
  estado_revision: string;
  asignatura?: { id: number; nombre: string };
}

export interface LeccionResponse {
  asignatura: {
    id: number;
    nombre: string;
    semestre: number;
    area: { id: number; nombre: string; color: string; icono: string };
  };
  corte: number;
  cortes: CorteInfo[];
  leccion: LeccionData | null;
  reto: RetoData | null;
  recursos: RecursoItem[];
}

export interface EvaluarResponse {
  esCorrecto: boolean;
  explicacion: string;
  corteAprobado: boolean;
  materiaCompletada: boolean;
}

export interface ProgressUpdateBody {
  asignatura_id: number;
  estado: 'en_progreso' | 'completado';
}

export interface ProgressResponse {
  message: string;
  asignatura_id: number;
  estado: string;
  recienDesbloqueadas: { id: number; nombre: string; semestre: number }[];
}

export interface TicketCreateBody {
  asunto: string;
  recurso_id?: number | null;
  descripcion: string;
}

export interface TicketItem {
  id: number;
  asunto: string;
  descripcion: string;
  usuario_id: number;
  recurso_id: number | null;
  estado?: string;
  fecha_creacion?: string;
  recurso?: { id: number; titulo: string; enlace: string } | null;
  usuario?: { id: number; nombre: string; email: string };
}

export interface InscripcionCurso {
  id: number;
  usuario_id: number;
  curso_id: string;
  interes: string;
  modulos_vistos: number[] | null;
  fecha?: string;
  estado?: 'inscrito' | 'en_progreso' | 'completado';
}

export interface ModuloCursoBackend {
  id: number;
  orden: number;
  titulo: string;
  descripcion: string | null;
  contenido: string | null;
  video_url: string | null;
  duracion_minutos: number;
}

export interface CursoCatalogoBackend {
  id: string;
  codigo: string;
  interes: string;
  titulo: string;
  subtitulo: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  duracion: string;
  color: string;
  descripcion: string;
  tags: string[];
  modulos: ModuloCursoBackend[];
}

export interface NuevoUsuarioBody {
  nombre: string;
  email: string;
  password: string;
  rol_id: 1 | 2 | 3;
  semestre?: number | null;
  jornada?: 'Diurno' | 'Nocturno' | null;
  genero?: 'Masculino' | 'Femenino' | 'Otro' | 'No especificado' | null;
}

export interface AdminStats {
  usuarios: { total: number; por_rol: { rol_id: number; total: number }[] };
  avancePorArea: {
    area_id: number;
    nombre: string;
    color: string;
    icono: string;
    total_materias: number;
    avance_promedio: number;
  }[];
  recursos: { aprobado: number; pendiente: number; rechazado: number };
  tickets: { total: number; abiertos: number; resueltos: number };
  cobertura: { total_materias: number; con_leccion: number; con_reto: number };
  loginsPorDia: { fecha: string; total: number }[];
  cursos: {
    porInteres: { interes: string; estudiantes: number }[];
    porEstado: { estado: string; total: number }[];
    porCurso: { curso_id: number; codigo: string; titulo: string; inscritos: number; en_progreso: number; completados: number }[];
  };
  distribucionSemestres: { semestre: number; total: number }[];
  distribucionJornada: { jornada: string; total: number }[];
  estudiantesActivos: number;
  materiasMasAccedidas: { asignatura_id: number; nombre: string; area: string; color: string; total: number }[];
}
