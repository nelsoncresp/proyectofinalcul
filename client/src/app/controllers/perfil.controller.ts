import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiService, AdminStats } from '../services/api.service';
import { Usuario } from '../models';
import { INTERESES_DISPONIBLES } from '../utils/intereses';

type Genero = 'Masculino' | 'Femenino' | 'Otro' | 'No especificado';

/**
 * Perfil del usuario autenticado (los 3 roles): datos personales,
 * contraseña, intereses (estudiantes) y resumen según el rol.
 */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-perfil',
  templateUrl: '../views/perfil.view.html',
  styleUrls: ['../styles/perfil.style.css']
})
export class PerfilController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  readonly interesesDisponibles = INTERESES_DISPONIBLES;
  readonly generos: Genero[] = ['Masculino', 'Femenino', 'Otro', 'No especificado'];

  // ── Datos personales ──
  nombre = '';
  genero: Genero | '' = '';
  jornada: 'Diurno' | 'Nocturno' | '' = '';
  semestre: number | null = null;
  intereses: string[] = [];

  mensajePersonal = '';
  errorPersonal = '';

  // ── Contraseña ──
  passActual = '';
  passNueva = '';
  passRepetir = '';
  mensajePass = '';
  errorPass = '';

  // ── Intereses ──
  mensajeIntereses = '';

  // ── Resumen por rol ──
  resumen: { valor: number | string; etiqueta: string; detalle: string }[] = [];
  cargandoResumen = false;
  statsAdmin: AdminStats | null = null;

  private userSub?: Subscription;

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.userSub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
      this.cargarDesdeUsuario(u);
      this.cargarResumen();
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  private cargarDesdeUsuario(u: Usuario | null): void {
    this.nombre = u?.nombre ?? '';
    this.genero = (u?.genero as Genero) ?? '';
    this.jornada = u?.jornada ?? '';
    this.semestre = u?.semestre ?? null;
    this.intereses = u?.intereses ? [...u.intereses] : [];
  }

  private cargarResumen(): void {
    if (!this.api.getToken() || !this.user) return;
    this.cargandoResumen = true;

    if (this.user.rol === 'Estudiante') {
      this.api.getPensum().subscribe({
        next: p => {
          this.resumen = [
            { valor: `${p.avanceGlobal}%`, etiqueta: 'Avance global', detalle: 'sobre el pensum completo' },
            { valor: `${p.totalCompletadas}/${p.totalMaterias}`, etiqueta: 'Materias aprobadas', detalle: 'del plan de estudios' },
            { valor: this.user?.semestre ?? '—', etiqueta: 'Semestre actual', detalle: this.user?.jornada ?? '' }
          ];
          this.cargandoResumen = false;
        },
        error: () => (this.cargandoResumen = false)
      });
    } else if (this.user.rol === 'Docente') {
      // Rutas propias + bandeja de tickets (docente y admin pueden verlos).
      let rutas = 0;
      let tickets = 0;
      this.api.getMisRutas().subscribe({
        next: r => {
          rutas = r.length;
          this.api.getTickets().subscribe({
            next: t => {
              tickets = t.length;
              this.resumen = [
                { valor: rutas, etiqueta: 'Líneas creadas', detalle: 'como autor' },
                { valor: tickets, etiqueta: 'Tickets de soporte', detalle: 'en la bandeja' },
                { valor: this.user?.jornada ?? '—', etiqueta: 'Vinculación', detalle: 'CUL' }
              ];
              this.cargandoResumen = false;
            },
            error: () => (this.cargandoResumen = false)
          });
        },
        error: () => (this.cargandoResumen = false)
      });
    } else {
      this.api.getAdminStats().subscribe({
        next: s => {
          this.statsAdmin = s;
          this.resumen = [
            { valor: s.usuarios.total, etiqueta: 'Usuarios', detalle: 'registrados en la plataforma' },
            { valor: s.tickets.abiertos, etiqueta: 'Tickets abiertos', detalle: `${s.tickets.resueltos} resueltos` },
            { valor: s.recursos.pendiente, etiqueta: 'Recursos pendientes', detalle: 'por curar' }
          ];
          this.cargandoResumen = false;
        },
        error: () => (this.cargandoResumen = false)
      });
    }
  }

  // ── Getters de presentación ────────────────────────────────────────────────

  get esEstudiante(): boolean {
    return this.user?.rol === 'Estudiante';
  }

  get iniciales(): string {
    if (!this.nombre) return 'US';
    const partes = this.nombre.trim().split(/\s+/);
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : partes[0].slice(0, 2).toUpperCase();
  }

  get nombreRol(): string {
    return this.user?.rol ?? '';
  }

  // ── Datos personales ───────────────────────────────────────────────────────

  guardarPersonal(): void {
    this.mensajePersonal = '';
    this.errorPersonal = '';
    if (!this.nombre.trim()) {
      this.errorPersonal = 'El nombre no puede estar vacío.';
      return;
    }

    this.api.updateMe({
      nombre: this.nombre.trim(),
      genero: (this.genero || null) as Genero | null,
      jornada: this.esEstudiante ? ((this.jornada || null) as 'Diurno' | 'Nocturno' | null) : undefined,
      semestre: this.esEstudiante ? this.semestre : undefined
    }).subscribe({
      next: res => {
        this.mensajePersonal = res.message;
        this.auth.refreshUser().subscribe();
      },
      error: err => {
        this.errorPersonal = err?.error?.error || 'No se pudo actualizar el perfil.';
      }
    });
  }

  // ── Intereses ──────────────────────────────────────────────────────────────

  toggleInteres(interes: string): void {
    const idx = this.intereses.indexOf(interes);
    if (idx >= 0) this.intereses.splice(idx, 1);
    else this.intereses.push(interes);
  }

  isInteresSelected(interes: string): boolean {
    return this.intereses.includes(interes);
  }

  guardarIntereses(): void {
    this.mensajeIntereses = '';
    this.api.updateMe({ intereses: this.intereses.length > 0 ? this.intereses : null }).subscribe({
      next: () => {
        this.mensajeIntereses = 'Intereses guardados. Tus recomendaciones se actualizaron.';
        this.auth.refreshUser().subscribe();
      },
      error: () => {
        this.mensajeIntereses = 'No se pudieron guardar los intereses.';
      }
    });
  }

  // ── Contraseña ─────────────────────────────────────────────────────────────

  cambiarPassword(): void {
    this.mensajePass = '';
    this.errorPass = '';
    if (this.passNueva.length < 6) {
      this.errorPass = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.passNueva !== this.passRepetir) {
      this.errorPass = 'La confirmación no coincide con la nueva contraseña.';
      return;
    }
    this.api.changeMyPassword(this.passActual, this.passNueva).subscribe({
      next: res => {
        this.mensajePass = res.message;
        this.passActual = '';
        this.passNueva = '';
        this.passRepetir = '';
      },
      error: err => {
        this.errorPass = err?.error?.error || 'No se pudo cambiar la contraseña.';
      }
    });
  }
}
