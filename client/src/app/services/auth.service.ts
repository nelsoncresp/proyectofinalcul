import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Usuario, UserRole } from '../models';
import { ApiService, BackendUser } from './api.service';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type LoginResult =
  | { ok: true; user: Usuario }
  | { ok: false; error: 'invalid-credentials' | 'server-error' };

/** Cuenta de demostración mostrada en la pantalla de login. */
export interface DemoAccount {
  email: string;
  password: string;
  rol: UserRole;
}

// ─── Mapa rol_id → UserRole ────────────────────────────────────────────────────
// Backend: 1=Administrador, 2=Docente, 3=Estudiante
const ROL_ID_MAP: Record<number, UserRole> = {
  1: 'Administrador',
  2: 'Administrador', // Docente se trata como Admin en el front por ahora
  3: 'Estudiante'
};

// ─── Credenciales de demostración (solo en memoria, nunca persistidas) ─────────
// Se usan SOLO cuando el backend no está disponible o para pruebas rápidas.
const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'admin@cul.edu',         password: 'admin123', rol: 'Administrador' },
  { email: 'estudiante1@cul.edu',   password: 'clave123',  rol: 'Estudiante' },
  { email: 'estudiante2@cul.edu',   password: 'clave123',  rol: 'Estudiante' },
  { email: 'estudiante3@cul.edu.co', password: 'clave123', rol: 'Estudiante' }
];

const STORAGE_KEY_USER  = 'currentUser';

// ─── Servicio ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.readFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) {}

  // ── Login ──────────────────────────────────────────────────────────────────
  /**
   * Intenta el login contra el backend real.
   * Si el backend no responde (red o 5xx), responde con 'server-error'
   * para que el componente pueda informar al usuario.
   */
  login(email: string, password: string): Observable<LoginResult> {
    return this.api.login(email, password).pipe(
      map(response => {
        const rol = ROL_ID_MAP[response.user.rol_id] ?? 'Estudiante';
        const user: Usuario = {
          id: String(response.user.id),
          nombre: response.user.nombre,
          email: response.user.email,
          rol,
          semestre: response.user.semestre,
          jornada: response.user.jornada
        };
        // Guardamos token y usuario en localStorage
        this.api.saveToken(response.token);
        this.saveUserToStorage(user);
        this.currentUserSubject.next(user);
        return { ok: true, user } as LoginResult;
      }),
      catchError(err => {
        // 401 = credenciales inválidas
        if (err?.status === 401) {
          return of({ ok: false, error: 'invalid-credentials' } as LoginResult);
        }
        // Cualquier otro error (red caída, 500, etc.)
        return of({ ok: false, error: 'server-error' } as LoginResult);
      })
    );
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    this.api.clearToken();
    this.currentUserSubject.next(null);
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  getRole(): UserRole | null {
    const u = this.getCurrentUser();
    return u ? u.rol : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  /** Cuentas de prueba para el bloque de demostración del login. */
  getDemoAccounts(): DemoAccount[] {
    return [...DEMO_ACCOUNTS];
  }

  // ── Persistencia ───────────────────────────────────────────────────────────

  private saveUserToStorage(user: Usuario): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  private readFromStorage(): Usuario | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
