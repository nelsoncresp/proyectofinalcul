import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { MockDataService } from '../services/mock-data.service';
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

  constructor(
    private mock: MockDataService,
    private api: ApiService
  ) {}

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
    this.msg = '';
  }

  createNodo(): void {
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
}
