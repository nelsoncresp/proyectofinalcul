import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService, PensumResponse, LeccionResponse, AsignaturaNodo, RetoData } from '../services/api.service';
import { AlertaService } from '../services/alerta.service';
import { resaltarJs } from '../utils/resaltar-js';
import { Usuario } from '../models';
import { Subscription } from 'rxjs';

interface ResultadoCaso {
  ok: boolean;
  obtenido?: unknown;
  esperado: unknown;
  error?: string;
}

/** Estado de una fila de la lista de casos de prueba (tanda progresiva). */
type EstadoCaso = 'ok' | 'error' | 'corriendo' | 'pendiente' | 'omitido';

interface FilaCaso {
  numero: number;
  estado: EstadoCaso;
  resultado: ResultadoCaso | null;
}

type ClavePaso = 'lectura' | 'video' | 'recursos' | 'reto' | 'evaluacion';

/**
 * Página del aula: la lección como ruta propia (/aula/:id), con un camino
 * animado de pasos (lectura → video → recursos → reto → evaluación) y
 * verificación de retos de código en el navegador (Web Worker).
 */
@Component({
  selector: 'app-aula-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: '../views/aula-estudiante.view.html',
  styleUrls: ['../styles/aula-estudiante.style.css']
})
export class AulaEstudianteController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  pensumData: PensumResponse | null = null;
  asigId: number | null = null;

  selectedLeccionBackend: LeccionResponse | null = null;
  isLeccionLoading = false;
  leccionError = false;

  // Flujo de estudio
  readingComplete = false;
  readingConfirmed = false;
  exerciseAnswer: number | null = null;
  exerciseFeedback = '';
  exercisePassed = false;

  // Reto de código
  reto: RetoData | null = null;
  codigo = '';
  codigoHtml!: SafeHtml;
  retoResultados: ResultadoCaso[] | null = null;
  retoErrorRuntime: string | null = null;
  retoPasado = false;
  retoCorriendo = false;

  @ViewChild('codigoHighlight') private codigoHighlightRef?: ElementRef<HTMLElement>;

  // Video embebido bajo demanda
  videoIniciado = false;
  miniaturaVisible = true;

  // Progreso visual del camino
  videoVisto = false;
  recursosVistos = false;
  seccionActual: ClavePaso = 'lectura';

  isCompleting = false;

  private userSub?: Subscription;
  private routeSub?: Subscription;
  private lecturaObserver?: IntersectionObserver;
  private seccionesObserver?: IntersectionObserver;
  private retoWorker?: Worker;
  private retoWorkerTimer?: number;
  /** Pausa entre caso y caso de la tanda y código congelado durante la corrida. */
  private retoSecuenciaTimer?: number;
  private retoCodigoCorrida = '';

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private alertas: AlertaService,
    private sanitizer: DomSanitizer
  ) {
    this.actualizarResaltado();
  }

  ngOnInit(): void {
    this.userSub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
    });
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (Number.isFinite(id) && id > 0) {
        this.asigId = id;
        this.cargarMateria();
      } else {
        this.volver();
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.lecturaObserver?.disconnect();
    this.seccionesObserver?.disconnect();
    this.cancelarSecuencia();
    this.terminarWorker();
  }

  // ── Datos ──────────────────────────────────────────────────────────────────

  private cargarMateria(): void {
    this.selectedLeccionBackend = null;
    this.leccionError = false;
    // Corta cualquier tanda de casos que estuviera corriendo en la materia anterior.
    this.cancelarSecuencia();
    this.terminarWorker();
    this.retoCorriendo = false;
    this.reto = null;
    this.retoResultados = null;
    this.retoErrorRuntime = null;
    this.retoPasado = false;
    this.videoIniciado = false;
    this.videoVisto = false;
    this.recursosVistos = false;
    this.seccionActual = 'lectura';
    this.readingComplete = false;
    this.readingConfirmed = false;
    this.exerciseAnswer = null;
    this.exerciseFeedback = '';
    this.exercisePassed = false;
    this.isCompleting = false;

    this.api.getPensum().subscribe({
      next: (res) => {
        this.pensumData = res;
        this.restaurarEstado();
        this.cargarLeccion();
      },
      error: () => {
        // Sin pensum no hay metadatos: se intenta igual solo con la lección.
        this.cargarLeccion();
      }
    });
  }

  private cargarLeccion(): void {
    if (!this.asigId) return;
    if (!this.api.getToken()) {
      this.leccionError = true;
      return;
    }
    const requestedId = this.asigId;
    this.isLeccionLoading = true;
    this.api.getLeccion(requestedId).subscribe({
      next: (res) => {
        if (this.asigId !== requestedId) return;
        if (res.asignatura?.id !== requestedId) {
          this.leccionError = true;
          this.isLeccionLoading = false;
          return;
        }
        this.selectedLeccionBackend = res;
        this.reto = res.reto ?? null;
        if (this.reto) {
          this.codigo = this.cargarCodigoGuardado() ?? this.reto.plantilla;
        }
        this.actualizarResaltado();
        this.isLeccionLoading = false;
        // La vista ya tiene las secciones: conecta los observadores del camino.
        window.setTimeout(() => this.conectarObservadores(), 0);
      },
      error: () => {
        if (this.asigId !== requestedId) return;
        this.leccionError = true;
        this.isLeccionLoading = false;
      }
    });
  }

  retryLeccion(): void {
    this.cargarLeccion();
  }

  get asig(): AsignaturaNodo | null {
    if (!this.pensumData || !this.asigId) return null;
    for (const sem of this.pensumData.semestres) {
      const found = sem.materias.find(m => m.id === this.asigId);
      if (found) return found;
    }
    return null;
  }

  get leccion() {
    return this.selectedLeccionBackend?.leccion ?? null;
  }

  get recursos() {
    return this.selectedLeccionBackend?.recursos ?? [];
  }

  // ── Camino de pasos ────────────────────────────────────────────────────────

  get pasos(): { key: ClavePaso; label: string; hecho: boolean; numero: number }[] {
    const lista: { key: ClavePaso; label: string; hecho: boolean; numero: number }[] = [
      { key: 'lectura', label: 'Lectura', hecho: this.readingConfirmed, numero: 1 },
      { key: 'video', label: 'Video', hecho: this.videoVisto, numero: 2 },
      { key: 'recursos', label: 'Recursos', hecho: this.recursosVistos, numero: 3 }
    ];
    if (this.reto) {
      lista.push({ key: 'reto', label: 'Reto de código', hecho: this.retoPasado, numero: lista.length + 1 });
    }
    lista.push({ key: 'evaluacion', label: 'Evaluación', hecho: this.exercisePassed, numero: lista.length + 1 });
    return lista;
  }

  /** % de pasos completados del camino (barra de avance del header). */
  get avancePasosPct(): number {
    const total = this.pasos.length;
    if (!total) return 0;
    return Math.round((this.pasos.filter(p => p.hecho).length / total) * 100);
  }

  irA(paso: ClavePaso): void {
    document.getElementById(`paso-${paso}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Acción principal del footer pegajoso: guía al siguiente paso pendiente. */
  get accionPrincipal(): { label: string; accion: 'lectura' | 'scroll-reto' | 'scroll-quiz' | 'aprobar' | 'ninguna'; hecho: boolean } {
    if (!this.readingConfirmed) {
      return { label: this.readingComplete ? 'Confirmar lectura' : 'Desliza hasta el final de la lectura', accion: 'lectura', hecho: false };
    }
    if (this.reto && !this.retoPasado) {
      return { label: 'Ir al reto de código', accion: 'scroll-reto', hecho: false };
    }
    if (!this.exercisePassed) {
      return { label: 'Ir a la evaluación', accion: 'scroll-quiz', hecho: false };
    }
    if (this.asig?.estado === 'Completado') {
      return { label: 'Asignatura aprobada', accion: 'ninguna', hecho: true };
    }
    return { label: 'Aprobar y desbloquear la siguiente', accion: 'aprobar', hecho: false };
  }

  ejecutarAccionPrincipal(): void {
    const { accion } = this.accionPrincipal;
    if (accion === 'lectura') this.confirmarLectura();
    else if (accion === 'scroll-reto') this.irA('reto');
    else if (accion === 'scroll-quiz') this.irA('evaluacion');
    else if (accion === 'aprobar') this.completarAsignatura();
  }

  confirmarLectura(): void {
    if (!this.readingComplete || this.readingConfirmed) return;
    this.readingConfirmed = true;
    this.guardarEstado();
    // Camino vivo: el aula te lleva al siguiente paso.
    window.setTimeout(() => this.irA('video'), 350);
  }

  // ── Observadores del camino ────────────────────────────────────────────────

  private conectarObservadores(): void {
    this.lecturaObserver?.disconnect();
    this.seccionesObserver?.disconnect();

    const finLectura = document.getElementById('fin-lectura');
    if (finLectura) {
      this.lecturaObserver = new IntersectionObserver(
        entradas => {
          for (const entrada of entradas) {
            if (entrada.isIntersecting) {
              this.readingComplete = true;
              this.lecturaObserver?.disconnect();
            }
          }
        },
        { rootMargin: '0px 0px -15% 0px' }
      );
      this.lecturaObserver.observe(finLectura);
    }

    const secciones = document.querySelectorAll<HTMLElement>('[data-paso]');
    // Entrada suave por sección: se marcan al entrar en pantalla (con red de
    // seguridad para que nunca queden invisibles si el observer falla).
    secciones.forEach(seccion => seccion.classList.add('pre-reveal'));
    window.setTimeout(() => {
      secciones.forEach(seccion => seccion.classList.add('is-visible'));
    }, 4000);
    this.seccionesObserver = new IntersectionObserver(
      entradas => {
        for (const entrada of entradas) {
          entrada.target.classList.add('is-visible');
          if (!entrada.isIntersecting) continue;
          const clave = (entrada.target as HTMLElement).dataset['paso'] as ClavePaso | undefined;
          if (!clave) continue;
          this.seccionActual = clave;
          if (clave === 'video') this.videoVisto = true;
          if (clave === 'recursos') this.recursosVistos = true;
        }
      },
      { rootMargin: '-35% 0px -45% 0px' }
    );
    secciones.forEach(seccion => this.seccionesObserver?.observe(seccion));
  }

  // ── Video embebido ─────────────────────────────────────────────────────────

  get videoId(): string | null {
    const url = this.leccion?.video_url;
    if (!url) return null;
    const match = url.match(/[?&]v=([\w-]{11})/);
    return match ? match[1] : null;
  }

  get videoEmbedUrl(): SafeResourceUrl | null {
    if (!this.videoId) return null;
    const url = `https://www.youtube-nocookie.com/embed/${this.videoId}?autoplay=1&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  iniciarVideo(): void {
    if (!this.videoId) return;
    this.videoIniciado = true;
    this.videoVisto = true;
  }

  // ── Reto de código (verificación en el navegador) ──────────────────────────

  reiniciarCodigo(): void {
    if (!this.reto) return;
    this.cancelarSecuencia();
    this.terminarWorker();
    this.retoCorriendo = false;
    this.codigo = this.reto.plantilla;
    this.actualizarResaltado();
    this.retoResultados = null;
    this.retoErrorRuntime = null;
  }

  private actualizarResaltado(): void {
    // HTML generado por nosotros (con escape de <, > y &): confiable.
    this.codigoHtml = this.sanitizer.bypassSecurityTrustHtml(resaltarJs(this.codigo));
  }

  /** El bloque resaltado va detrás del textarea: su scroll debe seguir al cursor. */
  sincronizarScroll(evento: Event): void {
    const area = evento.target as HTMLElement;
    const pre = this.codigoHighlightRef?.nativeElement;
    if (!pre) return;
    pre.scrollTop = area.scrollTop;
    pre.scrollLeft = area.scrollLeft;
  }

  /** Casos ya resueltos en la tanda actual. */
  get retoAprobados(): number {
    return this.retoResultados?.length ?? 0;
  }

  get retoTotalCasos(): number {
    return this.reto?.casos.length ?? 0;
  }

  /** % de la tanda completado (barra del panel y del botón de ejecución). */
  get retoProgresoPct(): number {
    const total = this.retoTotalCasos;
    if (!total) return 0;
    return Math.round((this.retoAprobados / total) * 100);
  }

  /**
   * Filas de la lista de casos: el resultado ya obtenido o, si aún no toca,
   * el estado de carga (ejecutando / pendiente / omitido).
   */
  get filasCasos(): FilaCaso[] {
    const reto = this.reto;
    const resultados = this.retoResultados;
    if (!reto || !resultados) return [];
    return reto.casos.map((_, i): FilaCaso => {
      if (i < resultados.length) {
        const r = resultados[i];
        return { numero: i + 1, estado: r.ok ? 'ok' : 'error', resultado: r };
      }
      if (this.retoCorriendo) {
        return { numero: i + 1, estado: i === resultados.length ? 'corriendo' : 'pendiente', resultado: null };
      }
      return { numero: i + 1, estado: 'omitido', resultado: null };
    });
  }

  /**
   * Ejecuta la tanda de casos uno a uno (estilo "test runner"): si pasa el
   * caso 1 se carga el 2, si pasa el 2 el 3, etc., mostrando el % de avance.
   * La tanda se detiene en el primer caso fallido.
   */
  correrReto(): void {
    if (!this.reto || this.retoCorriendo) return;
    this.cancelarSecuencia();
    this.retoCorriendo = true;
    this.retoResultados = [];
    this.retoErrorRuntime = null;
    this.retoPasado = false;
    // Código congelado durante la corrida: todos los casos ven lo mismo.
    this.retoCodigoCorrida = this.codigo;
    this.ejecutarCaso(0);
  }

  /** Evalúa un único caso en un worker aislado y encadena el siguiente. */
  private ejecutarCaso(indice: number): void {
    const reto = this.reto;
    if (!reto) return;

    // Worker que evalua el codigo del estudiante en un sandbox aislado.
    // Intercepta console.log para que funciones que imprimen en lugar de
    // retornar tambien sean evaluadas correctamente.
    const workerScript = `
self.onmessage = function (e) {
  try {
    var _logs = [];
    var _fakeConsole = {
      log: function () { _logs.push(Array.from(arguments).join(' ')); },
      warn: function () {},
      error: function () {},
      info: function () {}
    };
    var fn = new Function('console',
      e.data.codigo +
      '\\nreturn typeof ' + e.data.nombre +
      ' === "function" ? ' + e.data.nombre + ' : null;'
    )(_fakeConsole);

    if (typeof fn !== 'function') {
      self.postMessage({ error: 'No se encontro la funcion ' + e.data.nombre + '(). Revisa el nombre y la sintaxis.' });
      return;
    }

    var resultados = [];
    for (var i = 0; i < e.data.casos.length; i++) {
      var c = e.data.casos[i];
      try {
        _logs = [];
        var obtenido = fn.apply(null, c.entrada);
        // Si la funcion no retorna nada pero si imprimio algo,
        // usar el ultimo valor logueado como resultado.
        if (obtenido === undefined && _logs.length > 0) {
          var raw = _logs[_logs.length - 1];
          try { obtenido = JSON.parse(raw); } catch (_e) { obtenido = raw; }
        }
        resultados.push({
          ok: JSON.stringify(obtenido) === JSON.stringify(c.esperado),
          obtenido: obtenido,
          esperado: c.esperado
        });
      } catch (err) {
        resultados.push({ ok: false, error: String(err), esperado: c.esperado });
      }
    }
    self.postMessage({ resultados: resultados });
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
};`;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    this.retoWorker = worker;

    worker.onmessage = (e: MessageEvent) => {
      this.terminarWorker();
      if (e.data.error) {
        // Error de evaluación (sintaxis, función ausente…): no hay caso que mostrar.
        this.retoErrorRuntime = e.data.error;
        this.retoCorriendo = false;
        if (this.retoResultados && this.retoResultados.length === 0) {
          this.retoResultados = null;
        }
        return;
      }

      const resultado = (e.data.resultados as ResultadoCaso[])[0];
      this.retoResultados = [...(this.retoResultados ?? []), resultado];

      if (!resultado.ok) {
        // Se detiene en el primer fallo: los demás casos quedan sin ejecutar.
        this.retoCorriendo = false;
        return;
      }

      if (this.retoResultados.length >= reto.casos.length) {
        this.retoCorriendo = false;
        this.retoPasado = true;
        this.alertas.exito('!Reto resuelto!', `Todos los casos de "${reto.nombre_funcion}()" pasaron.`);
        this.guardarEstado();
        return;
      }

      // Pausa breve y arranca el siguiente caso: la lista se va cargando de a poco.
      this.retoSecuenciaTimer = window.setTimeout(() => {
        this.retoSecuenciaTimer = undefined;
        this.ejecutarCaso(this.retoResultados?.length ?? 0);
      }, 450);
    };
    worker.onerror = () => {
      this.retoCorriendo = false;
      this.retoErrorRuntime = 'Error de sintaxis en tu codigo. Revisa la consola del editor.';
      if (this.retoResultados && this.retoResultados.length === 0) {
        this.retoResultados = null;
      }
      this.terminarWorker();
    };
    worker.postMessage({
      codigo: this.retoCodigoCorrida,
      nombre: reto.nombre_funcion,
      casos: [reto.casos[indice]]
    });

    // Red de seguridad: el worker no puede colgar la pagina.
    this.retoWorkerTimer = window.setTimeout(() => {
      this.retoCorriendo = false;
      this.retoErrorRuntime = 'El codigo tardo demasiado (posible bucle infinito).';
      if (this.retoResultados && this.retoResultados.length === 0) {
        this.retoResultados = null;
      }
      this.terminarWorker();
    }, 4000);
  }

  private terminarWorker(): void {
    if (this.retoWorkerTimer) {
      window.clearTimeout(this.retoWorkerTimer);
      this.retoWorkerTimer = undefined;
    }
    this.retoWorker?.terminate();
    this.retoWorker = undefined;
  }

  /** Detiene el encadenamiento de la tanda (reinicio, salida de la página…). */
  private cancelarSecuencia(): void {
    if (this.retoSecuenciaTimer !== undefined) {
      window.clearTimeout(this.retoSecuenciaTimer);
      this.retoSecuenciaTimer = undefined;
    }
  }

  private cargarCodigoGuardado(): string | null {
    if (!this.user || !this.asigId) return null;
    try {
      return localStorage.getItem(`cul_reto_${this.user.id}_${this.asigId}`);
    } catch {
      return null;
    }
  }

  // ── Evaluación ─────────────────────────────────────────────────────────────

  onSelectAnswer(index: number): void {
    if (this.exercisePassed) return;
    this.exerciseAnswer = index;
    this.exerciseFeedback = '';
    this.guardarEstado();
  }

  checkExercise(): void {
    if (!this.asigId || this.exerciseAnswer === null || this.exercisePassed) return;
    this.api.evaluarLeccion(this.asigId, this.exerciseAnswer).subscribe({
      next: (res) => {
        this.exercisePassed = res.esCorrecto;
        this.exerciseFeedback = res.explicacion;
        if (res.esCorrecto) {
          this.alertas.exito('Evaluación superada', 'Tu respuesta es correcta.');
        }
        this.guardarEstado();
      },
      error: () => {
        this.alertas.error('No se pudo evaluar', 'Revisa tu conexión e inténtalo de nuevo.');
      }
    });
  }

  // ── Aprobación ─────────────────────────────────────────────────────────────

  get canComplete(): boolean {
    return this.asig?.estado === 'Disponible' && this.readingConfirmed && this.exercisePassed && !this.isCompleting;
  }

  completarAsignatura(): void {
    if (!this.asigId || !this.canComplete) return;
    this.isCompleting = true;
    this.api.updateProgress({ asignatura_id: this.asigId, estado: 'completado' }).subscribe({
      next: (res) => {
        const desbloqueadas = (res.recienDesbloqueadas ?? []).map(d => d.nombre);
        const titulo = `¡${this.asig?.nombre} aprobada!`;
        const detalle = desbloqueadas.length > 0
          ? `Desbloqueaste: ${desbloqueadas.join(', ')}.`
          : 'Tu avance en la ruta se actualizó.';
        this.alertas.exito(titulo, detalle);
        // La felicitación vive en la alerta; el aula devuelve a la ruta sola.
        window.setTimeout(() => this.router.navigate(['/dashboard-estudiante']), 1100);
      },
      error: () => {
        this.isCompleting = false;
        this.alertas.error('No se pudo registrar el avance', 'Revisa tu conexión e inténtalo de nuevo.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard-estudiante']);
  }

  // ── Estado local (por estudiante y materia) ────────────────────────────────

  private restaurarEstado(): void {
    if (!this.user || !this.asigId) return;
    try {
      const raw = localStorage.getItem(`cul_quiz_state_${this.user.id}`);
      const cache = raw ? JSON.parse(raw) : {};
      const guardado = cache?.[this.asigId];
      if (guardado) {
        this.readingConfirmed = !!guardado.readingConfirmed;
        this.readingComplete = this.readingConfirmed;
        this.exerciseAnswer = typeof guardado.exerciseAnswer === 'number' ? guardado.exerciseAnswer : null;
        this.exerciseFeedback = guardado.exerciseFeedback ?? '';
        this.exercisePassed = !!guardado.exercisePassed;
        return;
      }
    } catch {}
    if (this.asig?.estado === 'Completado') {
      this.readingConfirmed = true;
      this.readingComplete = true;
      this.exercisePassed = true;
      this.exerciseAnswer = 0;
      this.exerciseFeedback = '¡Asignatura superada con éxito!';
    }
  }

  private guardarEstado(): void {
    if (!this.user || !this.asigId) return;
    try {
      const raw = localStorage.getItem(`cul_quiz_state_${this.user.id}`);
      const cache = raw ? JSON.parse(raw) : {};
      cache[this.asigId] = {
        exerciseAnswer: this.exerciseAnswer,
        exerciseFeedback: this.exerciseFeedback,
        readingConfirmed: this.readingConfirmed,
        exercisePassed: this.exercisePassed
      };
      localStorage.setItem(`cul_quiz_state_${this.user.id}`, JSON.stringify(cache));
      if (this.reto) {
        localStorage.setItem(`cul_reto_${this.user.id}_${this.asigId}`, this.codigo);
      }
    } catch {}
  }

  onCodigoChange(): void {
    this.actualizarResaltado();
    if (!this.user || !this.asigId) return;
    try {
      localStorage.setItem(`cul_reto_${this.user.id}_${this.asigId}`, this.codigo);
    } catch {}
  }
}
