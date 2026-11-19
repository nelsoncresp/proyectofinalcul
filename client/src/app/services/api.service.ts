import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  AdminStats,
  BackendUser,
  EvaluarResponse,
  InscripcionCurso,
  CursoCatalogoBackend,
  LeccionResponse,
  LoginResponse,
  NuevoUsuarioBody,
  PensumResponse,
  ProgressResponse,
  ProgressUpdateBody,
  RegisterResponse,
  RecursoItem,
  TicketCreateBody,
  TicketItem
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE_URL = 'http://localhost:3000';
  private readonly TOKEN_KEY = 'authToken';

  constructor(private http: HttpClient) {}

  // ── Token y Headers ──────────────────────────────────────────────────────────

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // ── Autenticación ────────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.BASE_URL}/api/auth/login`,
      { email, password }
    );
  }

  register(
    nombre: string,
    email: string,
    password: string,
    rol_id: number,
    semestre?: number | null,
    jornada?: 'Diurno' | 'Nocturno' | null,
    intereses?: string[] | null,
    genero?: 'Masculino' | 'Femenino' | 'Otro' | 'No especificado' | null
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.BASE_URL}/api/auth/register`,
      {
        nombre,
        email,
        password,
        rol_id,
        semestre: semestre ?? null,
        jornada: jornada ?? null,
        genero: genero ?? null,
        intereses: intereses ?? null
      }
    );
  }

  // ── Perfil del usuario autenticado ──────────────────────────────────────────

  getMe(): Observable<BackendUser> {
    return this.http.get<BackendUser>(
      `${this.BASE_URL}/api/users/me`,
      { headers: this.authHeaders() }
    );
  }

  updateMe(body: {
    nombre?: string;
    genero?: 'Masculino' | 'Femenino' | 'Otro' | 'No especificado' | null;
    jornada?: 'Diurno' | 'Nocturno' | null;
    semestre?: number | null;
    intereses?: string[] | null;
  }): Observable<{ message: string; usuario: BackendUser }> {
    return this.http.patch<{ message: string; usuario: BackendUser }>(
      `${this.BASE_URL}/api/users/me`,
      body,
      { headers: this.authHeaders() }
    );
  }

  changeMyPassword(actual: string, nueva: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.BASE_URL}/api/users/me/password`,
      { actual, nueva },
      { headers: this.authHeaders() }
    );
  }

  // ── Pensum y Asignaturas ────────────────────────────────────────────────────

  getPensum(): Observable<PensumResponse> {
    return this.http.get<PensumResponse>(
      `${this.BASE_URL}/api/asignaturas/pensum`,
      { headers: this.authHeaders() }
    );
  }

  /** Se inscribe en una materia del pensum (progreso 'inscrito'). */
  inscribirse(asignaturaId: number): Observable<{ message: string; inscrito: boolean }> {
    return this.http.post<{ message: string; inscrito: boolean }>(
      `${this.BASE_URL}/api/asignaturas/${asignaturaId}/inscribirse`,
      {},
      { headers: this.authHeaders() }
    );
  }

  /** Cancela la inscripción en una materia del pensum. */
  desinscribirse(asignaturaId: number): Observable<{ message: string; inscrito: boolean }> {
    return this.http.delete<{ message: string; inscrito: boolean }>(
      `${this.BASE_URL}/api/asignaturas/${asignaturaId}/inscribirse`,
      { headers: this.authHeaders() }
    );
  }

  getLeccion(asignaturaId: number, corte = 1): Observable<LeccionResponse> {
    return this.http.get<LeccionResponse>(
      `${this.BASE_URL}/api/asignaturas/${asignaturaId}/leccion?corte=${corte}`,
      { headers: this.authHeaders() }
    );
  }

  evaluarLeccion(asignaturaId: number, respuesta: number, corte = 1): Observable<EvaluarResponse> {
    return this.http.post<EvaluarResponse>(
      `${this.BASE_URL}/api/asignaturas/${asignaturaId}/evaluar`,
      { respuesta, corte },
      { headers: this.authHeaders() }
    );
  }

  // ── Progreso de Aprendizaje ─────────────────────────────────────────────────

  updateProgress(body: ProgressUpdateBody): Observable<ProgressResponse> {
    return this.http.post<ProgressResponse>(
      `${this.BASE_URL}/api/progress/update`,
      body,
      { headers: this.authHeaders() }
    );
  }

  // ── Recursos y gestión ──────────────────────────────────────────────────────

  getResources(asignaturaId: number): Observable<RecursoItem[]> {
    return this.http.get<RecursoItem[]>(
      `${this.BASE_URL}/api/resources/${asignaturaId}`,
      { headers: this.authHeaders() }
    );
  }

  getAllResources(): Observable<RecursoItem[]> {
    return this.http.get<RecursoItem[]>(
      `${this.BASE_URL}/api/resources`,
      { headers: this.authHeaders() }
    );
  }

  createResource(body: { asignatura_id: number; titulo: string; tipo_recurso: string; enlace: string }): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.BASE_URL}/api/resources`,
      body,
      { headers: this.authHeaders() }
    );
  }

  updateResourceStatus(id: number, estado_revision: string): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.BASE_URL}/api/resources/${id}/estado`,
      { estado_revision },
      { headers: this.authHeaders() }
    );
  }

  // ── Tickets de Soporte ──────────────────────────────────────────────────────

  createTicket(body: TicketCreateBody): Observable<{ message: string; ticket: TicketItem }> {
    return this.http.post<{ message: string; ticket: TicketItem }>(
      `${this.BASE_URL}/api/tickets/create`,
      body,
      { headers: this.authHeaders() }
    );
  }

  getTickets(): Observable<unknown[]> {
    return this.http.get<unknown[]>(
      `${this.BASE_URL}/api/tickets`,
      { headers: this.authHeaders() }
    );
  }

  /** Tickets creados por el usuario autenticado ("Mis reportes"). */
  getMisTickets(): Observable<TicketItem[]> {
    return this.http.get<TicketItem[]>(
      `${this.BASE_URL}/api/tickets/mis-tickets`,
      { headers: this.authHeaders() }
    );
  }

  // ── Inscripciones a cursos extracurriculares (pestaña "Para ti") ────────────

  getCatalogoCursos(): Observable<CursoCatalogoBackend[]> {
    return this.http.get<CursoCatalogoBackend[]>(
      `${this.BASE_URL}/api/cursos/catalogo`,
      { headers: this.authHeaders() }
    );
  }

  /** Detalle de un curso extracurricular con sus módulos y estado de inscripción. */
  getCursoDetalle(cursoId: string): Observable<{
    curso: CursoCatalogoBackend;
    inscripcion: { id: number; estado: 'inscrito' | 'en_progreso' | 'completado'; modulos_vistos: number[] } | null;
  }> {
    return this.http.get<{
      curso: CursoCatalogoBackend;
      inscripcion: { id: number; estado: 'inscrito' | 'en_progreso' | 'completado'; modulos_vistos: number[] } | null;
    }>(
      `${this.BASE_URL}/api/cursos/${cursoId}`,
      { headers: this.authHeaders() }
    );
  }

  /** Inscripciones propias del estudiante en cursos extracurriculares. */
  getMisInscripcionesCursos(): Observable<InscripcionCurso[]> {
    return this.http.get<InscripcionCurso[]>(
      `${this.BASE_URL}/api/cursos/inscripciones`,
      { headers: this.authHeaders() }
    );
  }

  /** Se inscribe en un curso del catálogo (idempotente). */
  inscribirseCurso(cursoId: string, interes: string): Observable<{ message: string; inscripcion: InscripcionCurso }> {
    return this.http.post<{ message: string; inscripcion: InscripcionCurso }>(
      `${this.BASE_URL}/api/cursos/${cursoId}/inscribirse`,
      { interes },
      { headers: this.authHeaders() }
    );
  }

  /** Se da de baja de un curso extracurricular. */
  desinscribirseCurso(cursoId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.BASE_URL}/api/cursos/${cursoId}/inscribirse`,
      { headers: this.authHeaders() }
    );
  }

  /** Guarda los módulos del temario marcados como vistos. */
  guardarProgresoCurso(
    cursoId: string,
    modulos_vistos: number[]
  ): Observable<{ message: string; modulos_vistos: number[]; estado: 'inscrito' | 'en_progreso' | 'completado' }> {
    return this.http.patch<{ message: string; modulos_vistos: number[]; estado: 'inscrito' | 'en_progreso' | 'completado' }>(
      `${this.BASE_URL}/api/cursos/${cursoId}/progreso`,
      { modulos_vistos },
      { headers: this.authHeaders() }
    );
  }

  // ── Rutas y Asignaturas Docente / Admin (R-12) ──────────────────────────────

  getMisRutas(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.BASE_URL}/api/asignaturas/mis-rutas`,
      { headers: this.authHeaders() }
    );
  }

  createAsignatura(body: {
    nombre: string;
    semestre?: number;
    area_id: number;
    prerrequisitos_ids?: number[];
  }): Observable<{ message: string; asignatura: any }> {
    return this.http.post<{ message: string; asignatura: any }>(
      `${this.BASE_URL}/api/asignaturas`,
      body,
      { headers: this.authHeaders() }
    );
  }

  /** Actualiza nombre y/o prerrequisitos de una asignatura (editar nodo). */
  updateAsignatura(
    id: number,
    body: { nombre?: string; prerrequisitos_ids?: number[] }
  ): Observable<{ message: string; asignatura: any }> {
    return this.http.put<{ message: string; asignatura: any }>(
      `${this.BASE_URL}/api/asignaturas/${id}`,
      body,
      { headers: this.authHeaders() }
    );
  }

  /** Elimina una asignatura sin dependencias (eliminar nodo). */
  deleteAsignatura(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.BASE_URL}/api/asignaturas/${id}`,
      { headers: this.authHeaders() }
    );
  }

  saveLeccion(asignatura_id: number, data: {
    corte: number;
    contenido_lectura: string;
    video_url?: string | null;
    tiempo_minimo_segundos?: number;
    pregunta: string;
    opciones: string[];
    respuesta_correcta: number;
    explicacion: string;
    estado?: 'borrador' | 'publicada';
  }): Observable<{ message: string; leccion: any }> {
    return this.http.post<{ message: string; leccion: any }>(
      `${this.BASE_URL}/api/asignaturas/${asignatura_id}/leccion`,
      data,
      { headers: this.authHeaders() }
    );
  }

  // ── Auditoría del Sistema (R-14) ───────────────────────────────────────────

  getAuditoria(page = 1, limit = 20): Observable<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    registros: any[];
  }> {
    return this.http.get<any>(
      `${this.BASE_URL}/api/auditoria?page=${page}&limit=${limit}`,
      { headers: this.authHeaders() }
    );
  }

  // ── Gestión de Usuarios (R-17/R-18, Solo Administrador) ────────────────────

  getUsers(rol?: number, q?: string): Observable<BackendUser[]> {
    const params: string[] = [];
    if (rol) params.push(`rol=${rol}`);
    if (q && q.trim()) params.push(`q=${encodeURIComponent(q.trim())}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http.get<BackendUser[]>(
      `${this.BASE_URL}/api/users${qs}`,
      { headers: this.authHeaders() }
    );
  }

  createUser(body: NuevoUsuarioBody): Observable<{ message: string; usuario: BackendUser }> {
    return this.http.post<{ message: string; usuario: BackendUser }>(
      `${this.BASE_URL}/api/users`,
      body,
      { headers: this.authHeaders() }
    );
  }

  resetPassword(id: number, password: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.BASE_URL}/api/users/${id}/reset-password`,
      { password },
      { headers: this.authHeaders() }
    );
  }

  // ── Métricas del Administrador ─────────────────────────────────────────────

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(
      `${this.BASE_URL}/api/stats/admin`,
      { headers: this.authHeaders() }
    );
  }

  // ── Ciclo de vida de tickets ───────────────────────────────────────────────

  updateTicketEstado(id: number, estado: 'abierto' | 'resuelto'): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.BASE_URL}/api/tickets/${id}/estado`,
      { estado },
      { headers: this.authHeaders() }
    );
  }
}
