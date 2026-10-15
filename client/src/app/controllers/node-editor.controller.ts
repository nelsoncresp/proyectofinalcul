import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../services/mock-data.service';
import { Nodo, Ruta } from '../models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-node-editor',
  templateUrl: '../views/node-editor.view.html',
  styleUrls: ['../styles/node-editor.style.css']
})
export class NodeEditorController {
  rutas: Ruta[] = [];
  selectedRutaId: string | null = null;

  titulo = '';
  descripcion = '';
  // Selección explícita de prerrequisitos: sólo nodos existentes de la ruta.
  selectedPrereqs = new Set<string>();
  msg = '';
  msgType: 'success' | 'error' = 'success';

  constructor(private mock: MockDataService) {
    this.rutas = this.mock.getRutas();
    if (this.rutas.length) this.selectedRutaId = this.rutas[0].id;
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
      this.msg = 'Selecciona una ruta.';
      return;
    }
    if (!this.titulo.trim()) {
      this.msgType = 'error';
      this.msg = 'El título es obligatorio.';
      return;
    }

    // Ciclo imposible por construcción: sólo se puede elegir como prerrequisito
    // un nodo que ya existe (el nuevo todavía no está en la ruta).
    const nodo = this.mock.addNodo(this.selectedRutaId, {
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      prerequisitos: [...this.selectedPrereqs]
    });

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
