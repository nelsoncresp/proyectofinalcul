import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ─── Tipos de respuesta del backend ────────────────────────────────────────────

export interface BackendUser {
  id: number;
  nombre: string;
  email: string;
  rol_id: number; // 1=Admin, 2=Docente, 3=Estudiante
  semestre?: number | null;
  jornada?: 'Diurno' | 'Nocturno' | null;
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
}

export interface LeccionData {
  id: number;
  contenido_lectura: string;
  video_url: string | null;
  tiempo_minimo_segundos: number;
  pregunta: string;
  opciones: string[];
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
  leccion: LeccionData | null;
  reto: RetoData | null;
  recursos: RecursoItem[];
}

export interface EvaluarResponse {
  esCorrecto: boolean;
  explicacion: string;
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
  recurso_id: number;
  descripcion: string;
}

// ─── Servicio API ──────────────────────────────────────────────────────────────

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
    jornada?: 'Diurno' | 'Nocturno' | null
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.BASE_URL}/api/auth/register`,
      { nombre, email, password, rol_id, semestre: semestre ?? null, jornada: jornada ?? null }
    );
  }

  // ── Pensum y Asignaturas ────────────────────────────────────────────────────

  getPensum(): Observable<PensumResponse> {
    return this.http.get<PensumResponse>(
      `${this.BASE_URL}/api/asignaturas/pensum`,
      { headers: this.authHeaders() }
    );
  }

  getLeccion(asignaturaId: number): Observable<LeccionResponse> {
    return this.http.get<LeccionResponse>(
      `${this.BASE_URL}/api/asignaturas/${asignaturaId}/leccion`,
      { headers: this.authHeaders() }
    );
  }

  evaluarLeccion(asignaturaId: number, respuesta: number): Observable<EvaluarResponse> {
    return this.http.post<EvaluarResponse>(
      `${this.BASE_URL}/api/asignaturas/${asignaturaId}/evaluar`,
      { respuesta },
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

  // ── Recursos y Curaduría ────────────────────────────────────────────────────

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

  createTicket(body: TicketCreateBody): Observable<unknown> {
    return this.http.post<unknown>(
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
}
