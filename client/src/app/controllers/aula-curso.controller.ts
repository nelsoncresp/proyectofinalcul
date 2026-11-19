import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { AlertaService } from '../services/alerta.service';
import { Usuario, CursoCatalogoBackend, ModuloCursoBackend } from '../models';

@Component({
  selector: 'app-aula-curso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: '../views/aula-curso.view.html',
  styleUrls: ['../styles/aula-curso.style.css']
})
export class AulaCursoController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  cursoIdParam = '';
  curso: CursoCatalogoBackend | null = null;

  moduloSeleccionadoIndex = 0;
  modulosVistos: number[] = [];
  estadoInscripcion: 'inscrito' | 'en_progreso' | 'completado' | 'no_inscrito' = 'no_inscrito';

  isLoading = true;
  isError = false;
  isSaving = false;

  videoIniciado = false;

  private userSub?: Subscription;
  private routeSub?: Subscription;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private alertas: AlertaService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userSub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
    });

    this.routeSub = this.route.paramMap.subscribe(params => {
      this.cursoIdParam = params.get('id') ?? '';
      if (this.cursoIdParam) {
        this.cargarCurso();
      } else {
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  cargarCurso(): void {
    this.isLoading = true;
    this.isError = false;

    this.api.getCursoDetalle(this.cursoIdParam).subscribe({
      next: (res) => {
        this.curso = res.curso;
        if (res.inscripcion) {
          this.estadoInscripcion = res.inscripcion.estado;
          this.modulosVistos = res.inscripcion.modulos_vistos || [];
        } else {
          this.estadoInscripcion = 'no_inscrito';
          this.modulosVistos = [];
        }

        // Seleccionar primer módulo pendiente o el primero
        const primerPendiente = this.curso.modulos.findIndex((_, idx) => !this.modulosVistos.includes(idx));
        this.moduloSeleccionadoIndex = primerPendiente >= 0 ? primerPendiente : 0;
        this.videoIniciado = false;
        this.isLoading = false;
      },
      error: () => {
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  get moduloActual(): ModuloCursoBackend | null {
    if (!this.curso || !this.curso.modulos) return null;
    return this.curso.modulos[this.moduloSeleccionadoIndex] ?? null;
  }

  get progresoPct(): number {
    if (!this.curso || !this.curso.modulos.length) return 0;
    return Math.round((this.modulosVistos.length / this.curso.modulos.length) * 100);
  }

  get estaInscrito(): boolean {
    return this.estadoInscripcion !== 'no_inscrito';
  }

  esModuloVisto(index: number): boolean {
    return this.modulosVistos.includes(index);
  }

  seleccionarModulo(index: number): void {
    if (!this.curso || index < 0 || index >= this.curso.modulos.length) return;
    this.moduloSeleccionadoIndex = index;
    this.videoIniciado = false;
  }

  inscribirme(): void {
    if (!this.curso || this.isSaving) return;
    this.isSaving = true;

    this.api.inscribirseCurso(this.curso.id, this.curso.interes).subscribe({
      next: (res) => {
        this.estadoInscripcion = res.inscripcion?.estado || 'inscrito';
        this.modulosVistos = res.inscripcion?.modulos_vistos || [];
        this.isSaving = false;
        this.alertas.exito('Inscripción exitosa', `Ya estás inscrito en ${this.curso?.titulo}.`);
      },
      error: () => {
        this.isSaving = false;
        this.alertas.error('Error al inscribirse', 'No se pudo completar la inscripción en este momento.');
      }
    });
  }

  toggleModuloActual(): void {
    if (!this.curso || this.isSaving) return;

    if (!this.estaInscrito) {
      this.inscribirme();
      return;
    }

    const idx = this.moduloSeleccionadoIndex;
    let nuevosVistos = [...this.modulosVistos];

    if (nuevosVistos.includes(idx)) {
      nuevosVistos = nuevosVistos.filter(i => i !== idx);
    } else {
      nuevosVistos.push(idx);
      nuevosVistos.sort((a, b) => a - b);
    }

    this.isSaving = true;
    this.api.guardarProgresoCurso(this.curso.id, nuevosVistos).subscribe({
      next: (res) => {
        this.modulosVistos = res.modulos_vistos;
        this.estadoInscripcion = res.estado;
        this.isSaving = false;

        if (this.esModuloVisto(idx)) {
          this.alertas.exito('Módulo completado', 'Tu progreso ha sido actualizado.');
          // Avanzar al siguiente módulo si existe y estaba pendiente
          if (idx < (this.curso?.modulos.length ?? 0) - 1) {
            this.seleccionarModulo(idx + 1);
          }
        }
      },
      error: () => {
        this.isSaving = false;
        this.alertas.error('Error al guardar avance', 'No se pudo registrar el progreso.');
      }
    });
  }

  // ── Video Embebido ──────────────────────────────────────────────────────────

  get videoId(): string | null {
    const url = this.moduloActual?.video_url;
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*)/);
    return match && match[1].length === 11 ? match[1] : null;
  }

  get videoEmbedUrl(): SafeResourceUrl | null {
    if (!this.videoId) return null;
    const url = `https://www.youtube-nocookie.com/embed/${this.videoId}?autoplay=1&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  iniciarVideo(): void {
    this.videoIniciado = true;
  }

  volver(): void {
    this.router.navigate(['/dashboard-estudiante']);
  }
}
