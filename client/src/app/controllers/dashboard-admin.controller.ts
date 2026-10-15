import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MockDataService } from '../services/mock-data.service';
import { ApiService, RecursoItem } from '../services/api.service';
import { Ruta, Usuario } from '../models';
import { Subscription } from 'rxjs';

interface RutaRow {
  ruta: Ruta;
  totalNodos: number;
  nodosCompletados: number;
}

export interface TicketRow {
  id: number;
  descripcion: string;
  usuario_id: number;
  recurso_id: number;
  recurso?: { id: number; titulo: string; enlace: string };
  usuario?: { id: number; nombre: string; email: string };
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-dashboard-admin',
  templateUrl: '../views/dashboard-admin.view.html',
  styleUrls: ['../styles/dashboard-admin.style.css']
})
export class DashboardAdminController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  rows: RutaRow[] = [];
  recursos: RecursoItem[] = [];
  tickets: TicketRow[] = [];
  curacionMensaje: string | null = null;

  activeTab: 'lineas' | 'recursos' | 'tickets' = 'lineas';

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

  setTab(tab: 'lineas' | 'recursos' | 'tickets'): void {
    this.activeTab = tab;
  }

  private loadAllData(): void {
    if (this.api.getToken()) {
      // 1. Cargar pensum y áreas desde el backend
      this.api.getPensum().subscribe({
        next: (pensum) => {
          this.rows = pensum.areas.map(area => {
            const total = area.nodos.length;
            const completados = area.nodos.filter(n => n.estado === 'Completado').length;
            return {
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
              totalNodos: total,
              nodosCompletados: completados
            };
          });
        },
        error: () => this.loadMockRows()
      });

      // 2. Cargar recursos para curaduría
      this.api.getAllResources().subscribe({
        next: (recs) => {
          this.recursos = recs;
        },
        error: () => {}
      });

      // 3. Cargar tickets de soporte
      this.api.getTickets().subscribe({
        next: (tks) => {
          this.tickets = tks as TicketRow[];
        },
        error: () => {}
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
      return {
        ruta,
        totalNodos: ruta.nodos.length,
        nodosCompletados
      };
    });
  }

  get totalNodos(): number {
    return this.rows.reduce((sum, r) => sum + r.totalNodos, 0);
  }

  get recursosPendientesCount(): number {
    return this.recursos.filter(r => r.estado_revision === 'pendiente').length;
  }

  pct(row: RutaRow): number {
    if (!row.totalNodos) return 0;
    return Math.round((row.nodosCompletados / row.totalNodos) * 100);
  }

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

  aprobarRecurso(id: number): void {
    this.api.updateResourceStatus(id, 'aprobado').subscribe({
      next: () => {
        const item = this.recursos.find(r => r.id === id);
        if (item) item.estado_revision = 'aprobado';
        this.curacionMensaje = `Recurso #${id} aprobado exitosamente.`;
      },
      error: () => {
        this.curacionMensaje = `Error al aprobar recurso #${id}.`;
      }
    });
  }

  rechazarRecurso(id: number): void {
    this.api.updateResourceStatus(id, 'rechazado').subscribe({
      next: () => {
        const item = this.recursos.find(r => r.id === id);
        if (item) item.estado_revision = 'rechazado';
        this.curacionMensaje = `Recurso #${id} marcado como rechazado.`;
      },
      error: () => {
        this.curacionMensaje = `Error al rechazar recurso #${id}.`;
      }
    });
  }
}
