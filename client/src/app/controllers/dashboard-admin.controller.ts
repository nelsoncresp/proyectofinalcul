import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MockDataService } from '../services/mock-data.service';
import { ApiService } from '../services/api.service';
import { Ruta, Usuario, AdminStats, BackendUser, RecursoItem, RutaRow, TicketRow } from '../models';
import { Subscription } from 'rxjs';

type AdminTab = 'lineas' | 'usuarios' | 'metricas' | 'recursos' | 'tickets' | 'auditoria';

const NOMBRES_ROL: Record<number, string> = {
  1: 'Administrador',
  2: 'Docente',
  3: 'Estudiante'
};

const LIMITE_AUDITORIA = 20;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-dashboard-admin',
  templateUrl: '../views/dashboard-admin.view.html',
  styleUrls: ['../styles/dashboard-admin.style.css']
})
export class DashboardAdminController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  rows: RutaRow[] = [];
  recursos: RecursoItem[] = [];
  tickets: TicketRow[] = [];
  auditoria: any[] = [];
  stats: AdminStats | null = null;
  statsError = false;
  mensaje: string | null = null;

  activeTab: AdminTab = 'lineas';

  // ── Gestión de usuarios (R-17) ──
  usuarios: BackendUser[] = [];
  filtroRol = 0; // 0 = todos
  busqueda = '';
  mostrarFormUsuario = false;
  formNombre = '';
  formEmail = '';
  formPassword = '';
  formRol = 3;
  formSemestre = 1;
  formJornada = '';
  formGenero = 'No especificado';

  // ── Restablecer contraseña ──
  resetId: number | null = null;
  resetEmail = '';
  resetPassword = '';

  // ── Auditoría paginada ──
  auditoriaPage = 1;
  auditoriaTotalPages = 1;

  private userSub?: Subscription;

  constructor(
    private auth: AuthService,
    private mock: MockDataService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.userSub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
      this.loadAllData();
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.mensaje = null;
  }

  private loadAllData(): void {
    if (this.api.getToken()) {
      // 1. Pensum y áreas (estructura de la malla)
      this.api.getPensum().subscribe({
        next: (pensum) => {
          this.rows = pensum.areas.map(area => ({
            ruta: {
              id: String(area.id),
              titulo: area.nombre,
              descripcion: area.descripcion,
              nodos: area.nodos.map(n => ({
                id: String(n.id),
                titulo: n.nombre,
                estado: n.estado,
                prerequisitos: []
              })),
              porcentajeAvance: area.porcentajeAvance,
              actualizadoEn: new Date().toISOString()
            },
            totalNodos: area.nodos.length,
            nodosCompletados: 0
          }));
        },
        error: () => this.loadMockRows()
      });

      // 2. Recursos para revisión
      this.api.getAllResources().subscribe({
        next: (recs) => { this.recursos = recs; },
        error: () => {}
      });

      // 3. Tickets de soporte
      this.api.getTickets().subscribe({
        next: (tks) => { this.tickets = tks as TicketRow[]; },
        error: () => {}
      });

      // 4. Auditoría del sistema (R-14), primera página
      this.cargarAuditoria(1);

      // 5. Usuarios (R-17) y métricas agregadas
      this.api.getUsers().subscribe({
        next: (users) => { this.usuarios = users; },
        error: () => {}
      });
      this.api.getAdminStats().subscribe({
        next: (s) => { this.stats = s; this.statsError = false; },
        error: () => { this.statsError = true; }
      });
    } else {
      this.loadMockRows();
    }
  }

  private loadMockRows(): void {
    const progreso = this.mock.getProgreso();
    this.rows = this.mock.getRutas().map(ruta => {
      const nodosCompletados = ruta.nodos.filter(nodo =>
        progreso.some(p => p.nodoId === nodo.id && p.completado)
      ).length;
      return { ruta, totalNodos: ruta.nodos.length, nodosCompletados };
    });
  }

  // ── Métricas ────────────────────────────────────────────────────────────────

  get totalNodos(): number {
    return this.rows.reduce((sum, r) => sum + r.totalNodos, 0);
  }

  get recursosPendientesCount(): number {
    return this.recursos.filter(r => r.estado_revision === 'pendiente').length;
  }

  /** Avance promedio REAL de estudiantes en el área de la fila (no del admin). */
  pctArea(row: RutaRow): number {
    const areaId = Number(row.ruta.id);
    const dato = this.stats?.avancePorArea.find(a => a.area_id === areaId);
    return dato ? Number(dato.avance_promedio) : 0;
  }

  get promedioGlobal(): number {
    if (!this.stats || this.stats.avancePorArea.length === 0) return 0;
    let materias = 0;
    let suma = 0;
    this.stats.avancePorArea.forEach(a => {
      materias += Number(a.total_materias);
      suma += Number(a.avance_promedio) * Number(a.total_materias);
    });
    return materias > 0 ? Math.round(suma / materias) : 0;
  }

  contarUsuarios(rol: number): number {
    return Number(this.stats?.usuarios.por_rol.find(r => r.rol_id === rol)?.total ?? 0);
  }

  get loginsTotales(): number {
    return this.stats?.loginsPorDia.reduce((sum, d) => sum + Number(d.total), 0) ?? 0;
  }

  get maxLoginsDiarios(): number {
    if (!this.stats || this.stats.loginsPorDia.length === 0) return 1;
    return Math.max(...this.stats.loginsPorDia.map(d => Number(d.total)), 1);
  }

  get maxInteresEstudiantes(): number {
    if (!this.stats?.cursos.porInteres.length) return 1;
    return Math.max(...this.stats.cursos.porInteres.map(i => i.estudiantes), 1);
  }

  get maxSemestreEstudiantes(): number {
    if (!this.stats?.distribucionSemestres?.length) return 1;
    return Math.max(...this.stats.distribucionSemestres.map(s => s.total), 1);
  }

  get maxJornadaEstudiantes(): number {
    if (!this.stats?.distribucionJornada?.length) return 1;
    return Math.max(...this.stats.distribucionJornada.map(j => j.total), 1);
  }

  get coberturaLeccionPct(): number {
    if (!this.stats) return 0;
    const { con_leccion, total_materias } = this.stats.cobertura;
    return total_materias > 0 ? Math.round((con_leccion / total_materias) * 100) : 0;
  }

  get totalInscripcionesCursos(): number {
    return this.stats?.cursos.porEstado.reduce((s, e) => s + Number(e.total), 0) ?? 0;
  }

  // ── Gestión de usuarios (R-17) ─────────────────────────────────────────────

  get usuariosFiltrados(): BackendUser[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.usuarios.filter(u => {
      const cumpleRol = this.filtroRol === 0 || u.rol_id === this.filtroRol;
      const cumpleTexto = !texto ||
        u.nombre.toLowerCase().includes(texto) ||
        u.email.toLowerCase().includes(texto);
      return cumpleRol && cumpleTexto;
    });
  }

  nombreRol(rolId: number): string {
    return NOMBRES_ROL[rolId] ?? `Rol ${rolId}`;
  }

  alternarFormUsuario(): void {
    this.mostrarFormUsuario = !this.mostrarFormUsuario;
    this.mensaje = null;
    // Al abrir, reinicia el formulario a sus valores por defecto
    // (evita que queden datos de un intento anterior).
    if (this.mostrarFormUsuario) {
      this.formNombre = '';
      this.formEmail = '';
      this.formPassword = '';
      this.formRol = 3;
      this.formSemestre = 1;
      this.formJornada = '';
      this.formGenero = 'No especificado';
    }
  }

  crearUsuario(): void {
    this.mensaje = null;
    if (!this.formNombre.trim()) {
      this.mensaje = 'El nombre es obligatorio.';
      return;
    }
    if (!this.formEmail.trim()) {
      this.mensaje = 'El correo es obligatorio.';
      return;
    }
    if (this.formPassword.length < 6) {
      this.mensaje = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    // Campos requeridos para estudiantes (semestre y jornada obligatorios).
    if (this.formRol === 3) {
      const semestre = Number(this.formSemestre);
      if (!Number.isInteger(semestre) || semestre < 1 || semestre > 10) {
        this.mensaje = 'El semestre es obligatorio (número entero entre 1 y 10).';
        return;
      }
      if (!this.formJornada) {
        this.mensaje = 'La jornada es obligatoria (Diurno o Nocturno).';
        return;
      }
    }

    this.api.createUser({
      nombre: this.formNombre.trim(),
      email: this.formEmail.trim(),
      password: this.formPassword,
      rol_id: this.formRol as 1 | 2 | 3,
      semestre: this.formRol === 3 ? this.formSemestre : null,
      jornada: this.formJornada ? (this.formJornada as 'Diurno' | 'Nocturno') : null,
      genero: (this.formGenero || null) as 'Masculino' | 'Femenino' | 'Otro' | 'No especificado' | null
    }).subscribe({
      next: (res) => {
        this.mensaje = res.message;
        this.mostrarFormUsuario = false;
        this.formNombre = '';
        this.formEmail = '';
        this.formPassword = '';
        this.formRol = 3;
        this.formSemestre = 1;
        this.formJornada = '';
        this.formGenero = 'No especificado';
        this.api.getUsers().subscribe({ next: users => (this.usuarios = users) });
      },
      error: (err) => {
        this.mensaje = err?.error?.error || 'Error al crear el usuario.';
      }
    });
  }

  abrirReset(u: BackendUser): void {
    this.resetId = u.id;
    this.resetEmail = u.email;
    this.resetPassword = '';
    this.mensaje = null;
  }

  cancelarReset(): void {
    this.resetId = null;
    this.resetEmail = '';
    this.resetPassword = '';
  }

  guardarReset(): void {
    if (this.resetId === null) return;
    if (this.resetPassword.length < 6) {
      this.mensaje = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    this.api.resetPassword(this.resetId, this.resetPassword).subscribe({
      next: (res) => {
        this.mensaje = res.message;
        this.cancelarReset();
      },
      error: (err) => {
        this.mensaje = err?.error?.error || 'Error al restablecer la contraseña.';
      }
    });
  }

  // ── Gestión de recursos ───────────────────────────────────────────────────

  aprobarRecurso(id: number): void {
    this.api.updateResourceStatus(id, 'aprobado').subscribe({
      next: () => {
        const item = this.recursos.find(r => r.id === id);
        if (item) item.estado_revision = 'aprobado';
        this.mensaje = `Recurso #${id} aprobado exitosamente.`;
      },
      error: () => { this.mensaje = `Error al aprobar recurso #${id}.`; }
    });
  }

  rechazarRecurso(id: number): void {
    this.api.updateResourceStatus(id, 'rechazado').subscribe({
      next: () => {
        const item = this.recursos.find(r => r.id === id);
        if (item) item.estado_revision = 'rechazado';
        this.mensaje = `Recurso #${id} marcado como rechazado.`;
      },
      error: () => { this.mensaje = `Error al rechazar recurso #${id}.`; }
    });
  }

  // ── Tickets de soporte ──────────────────────────────────────────────────────

  cambiarEstadoTicket(ticket: TicketRow, estado: 'abierto' | 'resuelto'): void {
    this.api.updateTicketEstado(ticket.id, estado).subscribe({
      next: () => {
        ticket.estado = estado;
        this.mensaje = `Ticket #${ticket.id} marcado como ${estado}.`;
      },
      error: () => { this.mensaje = `Error al actualizar el ticket #${ticket.id}.`; }
    });
  }

  // ── Auditoría paginada ──────────────────────────────────────────────────────

  cargarAuditoria(page: number): void {
    this.api.getAuditoria(page, LIMITE_AUDITORIA).subscribe({
      next: (res) => {
        this.auditoria = res.registros;
        this.auditoriaPage = res.page;
        this.auditoriaTotalPages = Math.max(1, res.totalPages);
      },
      error: () => {}
    });
  }

  paginaAnterior(): void {
    if (this.auditoriaPage > 1) this.cargarAuditoria(this.auditoriaPage - 1);
  }

  paginaSiguiente(): void {
    if (this.auditoriaPage < this.auditoriaTotalPages) this.cargarAuditoria(this.auditoriaPage + 1);
  }

  // ── Utilidades ──────────────────────────────────────────────────────────────

  formatDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
