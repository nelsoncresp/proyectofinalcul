import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService, RecursoItem } from '../services/api.service';
import { Usuario } from '../models';
import { Subscription } from 'rxjs';

export interface TicketDocenteRow {
  id: number;
  descripcion: string;
  asunto?: string;
  usuario_id: number;
  recurso_id: number | null;
  estado?: string;
  recurso?: { id: number; titulo: string; enlace: string } | null;
  usuario?: { id: number; nombre: string; email: string };
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-dashboard-docente',
  templateUrl: '../views/dashboard-docente.view.html',
  styleUrls: ['../styles/dashboard-docente.style.css']
})
export class DashboardDocenteController implements OnInit, OnDestroy {
  user: Usuario | null = null;
  activeTab: 'rutas' | 'recursos' | 'tickets' = 'rutas';

  rutas: any[] = [];
  recursos: RecursoItem[] = [];
  tickets: TicketDocenteRow[] = [];
  asignaturasParaRecurso: { id: number; nombre: string }[] = [];

  loadingRutas = false;
  loadingRecursos = false;
  loadingTickets = false;

  // Formulario proponer recurso
  showModalProponer = false;
  nuevoRecurso = {
    asignatura_id: 1,
    titulo: '',
    tipo_recurso: 'Documento',
    enlace: ''
  };
  mensajeRecurso = '';
  errorRecurso = '';
  submittingRecurso = false;

  // Mensaje de la bandeja de tickets
  mensajeTicket = '';

  private userSub?: Subscription;

  constructor(
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.userSub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
      this.loadAll();
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  setTab(tab: 'rutas' | 'recursos' | 'tickets'): void {
    this.activeTab = tab;
  }

  loadAll(): void {
    this.loadMisRutas();
    this.loadRecursos();
    this.loadTickets();
  }

  loadMisRutas(): void {
    this.loadingRutas = true;
    this.api.getMisRutas().subscribe({
      next: data => {
        this.rutas = data;
        this.loadingRutas = false;
      },
      error: () => {
        this.loadingRutas = false;
      }
    });

    // Cargar materias para el selector de proponer recurso
    this.api.getPensum().subscribe({
      next: pensum => {
        const list: { id: number; nombre: string }[] = [];
        pensum.areas?.forEach(a => {
          a.nodos?.forEach(n => list.push({ id: n.id, nombre: n.nombre }));
        });
        this.asignaturasParaRecurso = list;
        if (list.length > 0 && !this.nuevoRecurso.asignatura_id) {
          this.nuevoRecurso.asignatura_id = list[0].id;
        }
      }
    });
  }

  loadRecursos(): void {
    this.loadingRecursos = true;
    this.api.getAllResources().subscribe({
      next: data => {
        this.recursos = data;
        this.loadingRecursos = false;
      },
      error: () => {
        this.loadingRecursos = false;
      }
    });
  }

  loadTickets(): void {
    this.loadingTickets = true;
    this.api.getTickets().subscribe({
      next: data => {
        this.tickets = data as TicketDocenteRow[];
        this.loadingTickets = false;
      },
      error: () => {
        this.loadingTickets = false;
      }
    });
  }

  cambiarEstadoTicket(ticket: TicketDocenteRow, estado: 'abierto' | 'resuelto'): void {
    this.api.updateTicketEstado(ticket.id, estado).subscribe({
      next: () => {
        ticket.estado = estado;
        this.mensajeTicket = `Ticket #${ticket.id} marcado como ${estado}.`;
      },
      error: () => {
        this.mensajeTicket = `Error al actualizar el ticket #${ticket.id}.`;
      }
    });
  }

  abrirModalProponer(): void {
    this.showModalProponer = true;
    this.mensajeRecurso = '';
    this.errorRecurso = '';
  }

  cerrarModalProponer(): void {
    this.showModalProponer = false;
    this.nuevoRecurso.titulo = '';
    this.nuevoRecurso.enlace = '';
    this.mensajeRecurso = '';
    this.errorRecurso = '';
  }

  proponerRecurso(): void {
    if (!this.nuevoRecurso.titulo.trim() || !this.nuevoRecurso.enlace.trim()) {
      this.errorRecurso = 'Título y enlace son obligatorios.';
      return;
    }

    this.submittingRecurso = true;
    this.errorRecurso = '';
    this.mensajeRecurso = '';

    this.api.createResource({
      asignatura_id: Number(this.nuevoRecurso.asignatura_id),
      titulo: this.nuevoRecurso.titulo.trim(),
      tipo_recurso: this.nuevoRecurso.tipo_recurso,
      enlace: this.nuevoRecurso.enlace.trim()
    }).subscribe({
      next: () => {
        this.submittingRecurso = false;
        this.mensajeRecurso = 'Recurso propuesto con éxito (pendiente de aprobación por admin).';
        this.loadRecursos();
        setTimeout(() => this.cerrarModalProponer(), 1500);
      },
      error: err => {
        this.submittingRecurso = false;
        this.errorRecurso = err?.error?.error || 'Error al proponer recurso.';
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
