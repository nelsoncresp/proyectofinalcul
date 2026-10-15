import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MockDataService } from '../services/mock-data.service';
import { ApiService, PensumResponse, AsignaturaNodo, SemestreGroup, AreaGroup } from '../services/api.service';
import { Usuario } from '../models';
import { Subscription } from 'rxjs';

/**
 * Ruta de aprendizaje del estudiante. El contenido de cada materia vive en
 * la página propia del aula (/aula/:id); aquí solo se navega hacia ella.
 */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-dashboard-estudiante',
  templateUrl: '../views/dashboard-estudiante.view.html',
  styleUrls: ['../styles/dashboard-estudiante.style.css']
})
export class DashboardEstudianteController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  pensumData: PensumResponse | null = null;

  // Navegación principal del mapa: 'roadmap' (Grafo por semestre) | 'areas' (Líneas de especialidad)
  activeTab: 'roadmap' | 'areas' = 'roadmap';

  // Filtro de estado para la vista de materias
  statusFilter: 'all' | 'Disponible' | 'Completado' | 'Bloqueado' = 'all';

  // Semestre seleccionado para la ruta guiada
  selectedSemestre: number = 1;

  // Mascota guía (robot "Byte")
  isMascotOpen: boolean = true;

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

  setTab(tab: 'roadmap' | 'areas'): void {
    this.activeTab = tab;
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

  toggleMascot(): void {
    this.isMascotOpen = !this.isMascotOpen;
  }

  /** Estado animado de la mascota: mood + mensaje contextual. */
  get mascot(): { mood: 'happy' | 'ready' | 'think' | 'idle'; message: string } {
    const sem = this.semestreActualData;
    const disponibles = this.materiasDelSemestre.filter(m => m.estado === 'Disponible').length;

    if (this.statusFilter !== 'all' && this.materiasDelSemestre.length === 0) {
      return { mood: 'think', message: 'Ninguna materia coincide con ese filtro. Prueba con "Todas".' };
    }
    if (sem && sem.total > 0 && sem.completadas === sem.total) {
      return { mood: 'happy', message: `¡Semestre ${sem.semestre} completado al 100% Eres imparable.` };
    }
    if (disponibles > 0) {
      const noun = disponibles === 1 ? 'materia lista' : 'materias listas';
      return { mood: 'ready', message: `Tienes ${disponibles} ${noun} para cursar en el Semestre ${this.selectedSemestre}.` };
    }
    if (this.avanceGlobal === 0) {
      const nombre = this.user?.nombre?.split(' ')[0] || 'estudiante';
      return { mood: 'idle', message: `¡Hola, ${nombre}! Elige una materia con el estado "Disponible" para empezar tu ruta.` };
    }
    return { mood: 'think', message: 'Aprueba los prerrequisitos pendientes para desbloquear más materias.' };
  }

  loadData(): void {
    if (this.api.getToken()) {
      this.api.getPensum().subscribe({
        next: (res: PensumResponse) => {
          this.pensumData = res;
        },
        error: () => {}
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
