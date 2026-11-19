import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { MockDataService } from '../services/mock-data.service';
import { AuthService } from '../services/auth.service';
import { Nodo, Ruta } from '../models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-node-editor',
  templateUrl: '../views/node-editor.view.html',
  styleUrls: ['../styles/node-editor.style.css']
})
export class NodeEditorController implements OnInit {
  rutas: Ruta[] = [];
  selectedRutaId: string | null = null;

  titulo = '';
  descripcion = '';
  // Selección explícita de prerrequisitos: sólo nodos existentes de la ruta.
  selectedPrereqs = new Set<string>();
  msg = '';
  msgType: 'success' | 'error' = 'success';
  loading = false;
  // Edición: id de la asignatura/nodo que se está editando (null = creando).
  editandoId: string | null = null;

  constructor(
    private mock: MockDataService,
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  /** Botón "Volver": regresa al panel de donde se abrió el editor (según rol). */
  volver(): void {
    const rol = this.auth.getCurrentUser()?.rol;
    this.router.navigate([rol === 'Docente' ? '/dashboard-docente' : '/dashboard-admin']);
  }

  ngOnInit(): void {
    this.cargarRutas();
  }

  cargarRutas(): void {
    this.api.getPensum().subscribe({
      next: (pensum) => {
        if (pensum.areas && pensum.areas.length > 0) {
          this.rutas = pensum.areas.map(area => ({
            id: String(area.id),
            titulo: area.nombre,
            descripcion: area.descripcion,
            porcentajeAvance: area.porcentajeAvance || 0,
            nodos: area.nodos.map(n => ({
              id: String(n.id),
              titulo: n.nombre,
              estado: n.estado,
              prerequisitos: n.prerrequisitos.map(p => String(p.id))
            }))
          }));
          if (!this.selectedRutaId && this.rutas.length > 0) {
            this.selectedRutaId = this.rutas[0].id;
          }
        } else {
          this.fallbackMock();
        }
      },
      error: () => {
        this.fallbackMock();
      }
    });
  }

  private fallbackMock(): void {
    this.rutas = this.mock.getRutas();
    if (this.rutas.length && !this.selectedRutaId) {
      this.selectedRutaId = this.rutas[0].id;
    }
  }

  get selectedRuta(): Ruta | null {
    return this.rutas.find(r => r.id === this.selectedRutaId) ?? null;
  }

  // Nodos candidatos a prerrequisito (excluye el nuevo: aún no existe).
  get availablePrereqs(): Nodo[] {
    return this.selectedRuta?.nodos ?? [];
  }

  togglePrereq(nodoId: string): void {
    if (this.selectedPrereqs.has(nodoId)) {
      this.selectedPrereqs.delete(nodoId);
    } else {
      this.selectedPrereqs.add(nodoId);
    }
  }

  isPrereqSelected(nodoId: string): boolean {
    return this.selectedPrereqs.has(nodoId);
  }

  onRutaChange(): void {
    // Los prerrequisitos seleccionados pertenecían a la ruta anterior.
    this.selectedPrereqs.clear();
    this.cancelarEdicion();
    this.msg = '';
  }

  /** Traduce un id de prerrequisito a su título (para mostrar nombres, no IDs). */
  nombrePrereq(id: string): string {
    const nodo = this.selectedRuta?.nodos.find(n => n.id === id);
    return nodo?.titulo ?? `#${id}`;
  }

  /** Carga un nodo existente en el formulario para editarlo. */
  iniciarEdicion(nodo: Nodo): void {
    this.editandoId = nodo.id;
    this.titulo = nodo.titulo;
    this.descripcion = nodo.descripcion ?? '';
    this.selectedPrereqs = new Set(nodo.prerequisitos);
    this.msg = '';
    this.msgType = 'success';
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.titulo = '';
    this.descripcion = '';
    this.selectedPrereqs.clear();
  }

  get editando(): boolean {
    return this.editandoId !== null;
  }

  createNodo(): void {
    if (this.editandoId) {
      this.updateNodo();
      return;
    }
    if (!this.selectedRutaId) {
      this.msgType = 'error';
      this.msg = 'Selecciona una línea de aprendizaje.';
      return;
    }
    if (!this.titulo.trim()) {
      this.msgType = 'error';
      this.msg = 'El título es obligatorio.';
      return;
    }

    const areaId = parseInt(this.selectedRutaId, 10);
    const prereqIds = Array.from(this.selectedPrereqs).map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    this.loading = true;
    this.msg = '';

    if (!isNaN(areaId)) {
      this.api.createAsignatura({
        nombre: this.titulo.trim(),
        area_id: areaId,
        semestre: 1,
        prerrequisitos_ids: prereqIds
      }).subscribe({
        next: (res) => {
          this.loading = false;
          this.msgType = 'success';
          this.msg = `Nodo guardado exitosamente: ${this.titulo.trim()} (ID: ${res.asignatura?.id})`;
          this.titulo = '';
          this.descripcion = '';
          this.selectedPrereqs.clear();
          this.cargarRutas();
        },
        error: (err) => {
          this.loading = false;
          const nodo = this.mock.addNodo(this.selectedRutaId!, {
            titulo: this.titulo.trim(),
            descripcion: this.descripcion.trim(),
            prerequisitos: [...this.selectedPrereqs]
          });
          if (nodo) {
            this.msgType = 'success';
            this.msg = `Nodo creado localmente: ${nodo.titulo}`;
            this.rutas = this.mock.getRutas();
            this.titulo = '';
            this.descripcion = '';
            this.selectedPrereqs.clear();
          } else {
            this.msgType = 'error';
            this.msg = err?.error?.error || 'Error al crear nodo.';
          }
        }
      });
    } else {
      const nodo = this.mock.addNodo(this.selectedRutaId, {
        titulo: this.titulo.trim(),
        descripcion: this.descripcion.trim(),
        prerequisitos: [...this.selectedPrereqs]
      });
      this.loading = false;
      if (nodo) {
        this.msgType = 'success';
        this.msg = `Nodo creado: ${nodo.titulo} (${nodo.id})`;
        this.rutas = this.mock.getRutas();
        this.titulo = '';
        this.descripcion = '';
        this.selectedPrereqs.clear();
      } else {
        this.msgType = 'error';
        this.msg = 'Error al crear nodo.';
      }
    }
  }

  /** Guarda la edición de un nodo: actualiza nombre y prerrequisitos. */
  updateNodo(): void {
    const id = parseInt(this.editandoId ?? '', 10);
    if (isNaN(id)) {
      this.msgType = 'error';
      this.msg = 'Nodo inválido para editar.';
      return;
    }
    if (!this.titulo.trim()) {
      this.msgType = 'error';
      this.msg = 'El título es obligatorio.';
      return;
    }

    const prereqIds = Array.from(this.selectedPrereqs)
      .map(x => parseInt(x, 10))
      .filter(x => !isNaN(x) && x !== id);

    this.loading = true;
    this.msg = '';
    this.api.updateAsignatura(id, {
      nombre: this.titulo.trim(),
      prerrequisitos_ids: prereqIds
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.msgType = 'success';
        this.msg = `Nodo actualizado: ${res.asignatura?.nombre ?? this.titulo.trim()}`;
        this.cancelarEdicion();
        this.cargarRutas();
      },
      error: (err) => {
        this.loading = false;
        this.msgType = 'error';
        this.msg = err?.error?.error || 'Error al actualizar el nodo.';
      }
    });
  }

  /** Elimina un nodo con confirmación explícita del usuario. */
  eliminarNodo(nodo: Nodo): void {
    const ok = confirm(
      `¿Eliminar el nodo "${nodo.titulo}"?\n\nEsta acción no se puede deshacer. ` +
      `Si tiene estudiantes, lecciones o recursos, el servidor bloqueará la eliminación.`
    );
    if (!ok) return;

    const id = parseInt(nodo.id, 10);
    if (isNaN(id)) {
      this.msgType = 'error';
      this.msg = 'Nodo inválido para eliminar.';
      return;
    }

    this.loading = true;
    this.msg = '';
    this.api.deleteAsignatura(id).subscribe({
      next: (res) => {
        this.loading = false;
        this.msgType = 'success';
        this.msg = res.message || 'Nodo eliminado.';
        if (this.editandoId === nodo.id) this.cancelarEdicion();
        this.cargarRutas();
      },
      error: (err) => {
        this.loading = false;
        this.msgType = 'error';
        this.msg = err?.error?.error || 'Error al eliminar el nodo.';
      }
    });
  }
}
