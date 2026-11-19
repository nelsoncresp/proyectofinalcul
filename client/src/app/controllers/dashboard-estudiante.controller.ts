import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MockDataService } from '../services/mock-data.service';
import { ApiService } from '../services/api.service';
import { Usuario, PensumResponse, AsignaturaNodo, SemestreGroup, AreaGroup, TicketItem, InscripcionCurso, CursoCatalogoBackend, ModuloCursoBackend } from '../models';
import {
  areasRecomendadas,
  CursoInteres,
  INTERES_AREAS,
  CATALOGO_CURSOS_INTERES
} from '../utils/scripts/intereses';
import { Subscription } from 'rxjs';

/**
 * Ruta de aprendizaje del estudiante. El contenido de cada materia vive en
 * la página propia del aula (/aula/:id); aquí solo se navega hacia ella.
 */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-dashboard-estudiante',
  templateUrl: '../views/dashboard-estudiante.view.html',
  styleUrls: [
    '../styles/dashboard-estudiante.style.css',
    '../styles/dashboard-estudiante-cursos.style.css'
  ]
})
export class DashboardEstudianteController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  pensumData: PensumResponse | null = null;

  // Navegación principal del mapa: grafo por semestre | líneas | recomendaciones
  activeTab: 'roadmap' | 'areas' | 'para-ti' = 'roadmap';

  // Filtro de estado para la vista de materias
  statusFilter: 'all' | 'Disponible' | 'Completado' | 'Bloqueado' = 'all';

  // Semestre seleccionado para la ruta guiada
  selectedSemestre: number = 1;

  // Activa el trazado animado del anillo de progreso tras el primer render
  ringReady: boolean = false;

  private userSub?: Subscription;
  private ringReadyTimer?: number;

  constructor(
    private auth: AuthService,
    private mock: MockDataService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u?.semestre) {
        this.selectedSemestre = Number(u.semestre);
      }
      this.loadData();
    });
    // Tras el primer render, habilita el trazado: el cambio de stroke-dashoffset
    // dispara la transición y el anillo se "dibuja" con animación.
    this.ringReadyTimer = window.setTimeout(() => {
      this.ringReady = true;
    }, 180);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    if (this.ringReadyTimer) window.clearTimeout(this.ringReadyTimer);
  }

  /** Navega a la página del aula de una materia. */
  irAlAula(asigId: number): void {
    this.router.navigate(['/aula', asigId]);
  }

  setTab(tab: 'roadmap' | 'areas' | 'para-ti'): void {
    this.activeTab = tab;
  }

  // ── Recomendaciones por intereses (Fase 2) ──────────────────────────────────

  get interesesUsuario(): string[] {
    return this.user?.intereses ?? [];
  }

  get idsAreasRecomendadas(): number[] {
    return areasRecomendadas(this.user?.intereses);
  }

  get hayRecomendacion(): boolean {
    return this.idsAreasRecomendadas.length > 0;
  }

  esRecomendada(areaId: number): boolean {
    return this.idsAreasRecomendadas.includes(areaId);
  }

  /** Líneas de formación ordenadas: las recomendadas primero. */
  get areasOrdenadas(): AreaGroup[] {
    const ids = this.idsAreasRecomendadas;
    if (ids.length === 0) return this.areasList;
    return [...this.areasList].sort((a, b) => Number(this.esRecomendada(b.id)) - Number(this.esRecomendada(a.id)));
  }

  /** Cursos extracurriculares independientes recomendados según los intereses del estudiante. */
  get cursosRecomendados(): CursoInteres[] {
    const intereses = new Set(this.user?.intereses ?? []);
    return this.catalogoCursos.filter(curso => intereses.has(curso.interes));
  }

  abrirDetalleCurso(curso: CursoInteres): void {
    this.router.navigate(['/curso', curso.id]);
  }

  /** Solo las líneas recomendadas (pestaña "Para ti"). */
  get areasParaTi(): AreaGroup[] {
    const ids = this.idsAreasRecomendadas;
    return this.areasList.filter(a => ids.includes(a.id));
  }

  /** Todas las materias listas para cursar; las de tus áreas recomendadas van primero. */
  get materiasParaTi(): AsignaturaNodo[] {
    return (this.pensumData?.semestres ?? [])
      .flatMap(s => s.materias)
      .filter(m => m.estado === 'Disponible')
      .sort((a, b) =>
        Number(this.esRecomendada(b.area_id)) - Number(this.esRecomendada(a.area_id)) ||
        a.semestre - b.semestre
      );
  }

  /** Motivo visible: intereses del usuario que apuntan al área de la materia. */
  razonRecomendacion(m: AsignaturaNodo): string {
    const vinculados = this.interesesUsuario.filter(i => (INTERES_AREAS[i] ?? []).includes(m.area_id));
    if (vinculados.length === 1) return `Por tu interés en ${vinculados[0]}`;
    if (vinculados.length > 1) {
      return `Por tus intereses en ${vinculados.slice(0, -1).join(', ')} y ${vinculados[vinculados.length - 1]}`;
    }
    return 'Lista para cursar ahora mismo';
  }

  // ── Cabecera visual de tarjetas de curso (íconos devicon CDN) ─────────────

  private readonly ICONOS_CURSO: Record<string, string[]> = {
    'web-101': ['html5', 'css3', 'javascript'],
    'web-102': ['css3', 'tailwindcss', 'bootstrap'],
    'web-103': ['javascript', 'typescript'],
    'web-104': ['react', 'angular', 'vuejs'],
    'web-105': ['nodejs', 'mysql'],
    'ai-101': ['python', 'pandas', 'scikitlearn'],
    'ai-102': ['python', 'jupyter'],
    'sec-101': ['linux', 'python'],
    'sec-102': ['linux', 'debian'],
    'mob-101': ['flutter', 'dart', 'android'],
    'db-101': ['mongodb', 'redis'],
    'net-101': ['linux', 'nginx'],
    'devops-101': ['docker', 'jenkins', 'githubactions'],
    'eng-101': ['git', 'java'],
    'game-101': ['csharp', 'unity'],
    'mgt-101': ['jira', 'trello']
  };

  /** URLs completas de los íconos de un curso (todas verificadas con respuesta 200). */
  iconosCurso(curso: CursoInteres): string[] {
    return (this.ICONOS_CURSO[curso.id] || []).map(
      n => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${n}/${n}-original.svg`
    );
  }

  /** El ícono de Unity es gris oscuro: se invierte para verse sobre la cabecera oscura. */
  iconoInvertido(src: string): boolean {
    return src.includes('/unity/');
  }

  /** Sin red, el ícono no carga: se oculta en vez de dejar una imagen rota. */
  ocultarIcono(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }

  // ── Inscripciones: materias del pensum y cursos extracurriculares ──────────

  inscripcionesCursos: InscripcionCurso[] = [];
  errorInscripcion = '';
  avisoInscripcion = '';
  inscribiendoCursoId: string | null = null;

  /** Materias del pensum inscritas y aún no aprobadas. */
  get materiasInscritas(): AsignaturaNodo[] {
    return (this.pensumData?.semestres ?? [])
      .flatMap(s => s.materias)
      .filter(m => m.inscrito && m.estado !== 'Completado');
  }

  /** Catálogo completo (todas las ramas de interés) para resolver inscripciones. */
  private get catalogoCursos(): CursoInteres[] {
    return Object.values(CATALOGO_CURSOS_INTERES).flat();
  }

  /** Cursos extracurriculares en los que está inscrito (aunque haya cambiado sus intereses). */
  get cursosInscritos(): CursoInteres[] {
    return this.inscripcionesCursos
      .map(ins => this.catalogoCursos.find(c => c.id === ins.curso_id))
      .filter((c): c is CursoInteres => !!c);
  }

  get statsListos(): number {
    return this.materiasParaTi.length + this.cursosRecomendados.length;
  }

  get statsEnCurso(): number {
    return this.materiasInscritas.length + this.inscripcionesCursos.length;
  }

  estaInscritoCurso(cursoId: string): boolean {
    return this.inscripcionesCursos.some(i => i.curso_id === cursoId);
  }

  modulosVistos(cursoId: string): number[] {
    return this.inscripcionesCursos.find(i => i.curso_id === cursoId)?.modulos_vistos ?? [];
  }

  estaVisto(cursoId: string, idx: number): boolean {
    return this.modulosVistos(cursoId).indexOf(idx) >= 0;
  }

  avanceCurso(curso: CursoInteres): number {
    if (curso.modulos.length === 0) return 0;
    const vistos = this.modulosVistos(curso.id).filter(idx => idx < curso.modulos.length).length;
    return Math.round((vistos * 100) / curso.modulos.length);
  }

  /** Se inscribe en una materia del pensum y navega directo a su aula. */
  inscribirMateria(m: AsignaturaNodo): void {
    this.errorInscripcion = '';
    this.avisoInscripcion = '';
    this.api.inscribirse(m.id).subscribe({
      next: () => {
        m.inscrito = true;
        this.irAlAula(m.id);
      },
      error: err => {
        this.errorInscripcion = err?.error?.error || 'No se pudo completar la inscripción.';
      }
    });
  }

  /** Cancela la inscripción de una materia del pensum. */
  salirMateria(m: AsignaturaNodo): void {
    this.errorInscripcion = '';
    this.api.desinscribirse(m.id).subscribe({
      next: () => {
        m.inscrito = false;
        this.avisoInscripcion = `Inscripción cancelada en ${m.nombre}.`;
      },
      error: err => {
        this.errorInscripcion = err?.error?.error || 'No se pudo cancelar la inscripción.';
      }
    });
  }

  /** Se inscribe en un curso extracurricular del catálogo. */
  inscribirExtracurricular(curso: CursoInteres): void {
    if (this.inscribiendoCursoId) return;
    this.errorInscripcion = '';
    this.inscribiendoCursoId = curso.id;
    this.api.inscribirseCurso(curso.id, curso.interes).subscribe({
      next: res => {
        const i = this.inscripcionesCursos.findIndex(x => x.curso_id === curso.id);
        if (i >= 0) this.inscripcionesCursos[i] = res.inscripcion;
        else this.inscripcionesCursos = [...this.inscripcionesCursos, res.inscripcion];
        this.inscribiendoCursoId = null;
        this.avisoInscripcion = `Inscripción confirmada en ${curso.titulo}. Marca cada módulo al terminarlo.`;
      },
      error: err => {
        this.inscribiendoCursoId = null;
        this.errorInscripcion = err?.error?.error || 'No se pudo completar la inscripción.';
      }
    });
  }

  /** Se da de baja de un curso extracurricular. */
  salirExtracurricular(curso: CursoInteres): void {
    this.errorInscripcion = '';
    this.api.desinscribirseCurso(curso.id).subscribe({
      next: () => {
        this.inscripcionesCursos = this.inscripcionesCursos.filter(x => x.curso_id !== curso.id);
        this.avisoInscripcion = `Diste de baja en ${curso.titulo}.`;
      },
      error: err => {
        this.errorInscripcion = err?.error?.error || 'No se pudo cancelar la inscripción.';
      }
    });
  }

  /** Limpia avisos y errores de inscripción. */
  limpiarAvisos(): void {
    this.errorInscripcion = '';
    this.avisoInscripcion = '';
  }

  /** Carga las inscripciones propias a cursos extracurriculares. */
  private cargarInscripcionesCursos(): void {
    this.api.getMisInscripcionesCursos().subscribe({
      next: filas => {
        this.inscripcionesCursos = filas;
      },
      error: () => {
        this.inscripcionesCursos = [];
      }
    });
  }

  // ── Soporte: reportar un problema y "Mis reportes" (Fase 3) ─────────────────

  mostrarSoporte = false;
  soporteTab: 'nuevo' | 'mis-tickets' = 'nuevo';

  ticketAsunto = '';
  ticketDescripcion = '';
  mensajeTicket = '';
  errorTicket = '';

  misTickets: TicketItem[] = [];
  cargandoTickets = false;
  ticketsCargados = false;

  /** Abre el panel de soporte. `nuevo` muestra el formulario; `mis-tickets` el historial. */
  abrirSoporte(tab: 'nuevo' | 'mis-tickets' = 'nuevo'): void {
    this.mostrarSoporte = true;
    this.soporteTab = tab;
    if (tab === 'mis-tickets' && !this.ticketsCargados) {
      this.cargarMisTickets();
    }
  }

  cerrarSoporte(): void {
    this.mostrarSoporte = false;
  }

  /** Escape cierra el panel de soporte. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mostrarSoporte) this.cerrarSoporte();
  }

  cambiarSoporteTab(tab: 'nuevo' | 'mis-tickets'): void {
    this.soporteTab = tab;
    if (tab === 'mis-tickets' && !this.ticketsCargados) {
      this.cargarMisTickets();
    }
  }

  cargarMisTickets(): void {
    this.cargandoTickets = true;
    this.api.getMisTickets().subscribe({
      next: tickets => {
        this.misTickets = tickets;
        this.cargandoTickets = false;
        this.ticketsCargados = true;
      },
      error: () => {
        this.cargandoTickets = false;
        this.ticketsCargados = true;
      }
    });
  }

  enviarTicket(): void {
    this.mensajeTicket = '';
    this.errorTicket = '';

    const asunto = this.ticketAsunto.trim();
    const descripcion = this.ticketDescripcion.trim();

    if (!asunto) {
      this.errorTicket = 'Escribe un asunto para el reporte.';
      return;
    }
    if (descripcion.length < 10) {
      this.errorTicket = 'Describe el problema con al menos 10 caracteres.';
      return;
    }

    this.api.createTicket({ asunto, descripcion, recurso_id: null }).subscribe({
      next: res => {
        this.mensajeTicket = res.message;
        this.ticketAsunto = '';
        this.ticketDescripcion = '';
        this.ticketsCargados = false;
        this.cargarMisTickets();
      },
      error: err => {
        this.errorTicket = err?.error?.error || 'No se pudo enviar el reporte.';
      }
    });
  }

  trackTicket(_: number, t: TicketItem): number {
    return t.id;
  }

  setStatusFilter(filter: 'all' | 'Disponible' | 'Completado' | 'Bloqueado'): void {
    this.statusFilter = filter;
  }

  selectSemestre(sem: number): void {
    if (sem < 1 || sem > this.semestresList.length) return;
    this.selectedSemestre = sem;
    this.scrollActivePillIntoView();
  }

  get canPrevSemestre(): boolean {
    return this.selectedSemestre > 1;
  }

  get canNextSemestre(): boolean {
    return this.selectedSemestre < this.semestresList.length;
  }

  prevSemestre(): void {
    this.selectSemestre(this.selectedSemestre - 1);
  }

  nextSemestre(): void {
    this.selectSemestre(this.selectedSemestre + 1);
  }

  /** Centra la pestaña del semestre activo dentro de la barra desplazable. */
  private scrollActivePillIntoView(): void {
    // Espera a que Angular pinte el cambio antes de medir/scroll.
    window.setTimeout(() => {
      const pill = document.querySelector('.sem-pill.is-selected') as HTMLElement | null;
      pill?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 0);
  }

  loadData(): void {
    if (this.api.getToken()) {
      this.cargarInscripcionesCursos();
      this.api.getPensum().subscribe({
        next: (res: PensumResponse) => {
          this.pensumData = res;
        },
        error: (err) => {
          console.error('[DashboardEstudiante] Error cargando pensum:', err);
        }
      });
    }
  }

  get semestresList(): SemestreGroup[] {
    return this.pensumData?.semestres ?? [];
  }

  get areasList(): AreaGroup[] {
    return this.pensumData?.areas ?? [];
  }

  get semestreActualData(): SemestreGroup | null {
    if (!this.pensumData) return null;
    return this.pensumData?.semestres.find(s => s.semestre === this.selectedSemestre) ?? null;
  }

  get materiasDelSemestre(): AsignaturaNodo[] {
    const list = this.semestreActualData?.materias ?? [];
    if (this.statusFilter === 'all') return list;
    return list.filter(m => m.estado === this.statusFilter);
  }

  get userInitials(): string {
    if (!this.user?.nombre) return 'ES';
    const parts = this.user.nombre.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  get avanceGlobal(): number {
    return this.pensumData?.avanceGlobal ?? 0;
  }

  get totalMaterias(): number {
    return this.pensumData?.totalMaterias ?? 0;
  }

  get totalCompletadas(): number {
    return this.pensumData?.totalCompletadas ?? 0;
  }

  /** Circunferencia del anillo de progreso (r = 52 en el SVG). */
  get ringCircumference(): number {
    return 2 * Math.PI * 52;
  }

  /** Offset del stroke para dibujar el % de avance global. */
  get ringOffset(): number {
    if (!this.ringReady) return this.ringCircumference;
    const pct = Math.min(100, Math.max(0, this.avanceGlobal));
    return this.ringCircumference * (1 - pct / 100);
  }
}
