import { Ruta } from './ruta.model';

export interface ResultadoCaso {
  ok: boolean;
  obtenido?: unknown;
  esperado: unknown;
  error?: string;
}

export type EstadoCaso = 'ok' | 'error' | 'corriendo' | 'pendiente' | 'omitido';

export interface FilaCaso {
  numero: number;
  estado: EstadoCaso;
  resultado: ResultadoCaso | null;
}

export interface RutaRow {
  ruta: Ruta;
  totalNodos: number;
  nodosCompletados: number;
}

export interface TicketRow {
  id: number;
  descripcion: string;
  asunto?: string;
  usuario_id: number;
  recurso_id: number | null;
  estado?: string;
  fecha_creacion?: string;
  recurso?: { id: number; titulo: string; enlace: string } | null;
  usuario?: { id: number; nombre: string; email: string };
}

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

export interface NavLink {
  path: string;
  label: string;
}

export interface EstadoAprendizaje {
  rutaId: string;
  nodoId: string;
  lecturaConfirmada: boolean;
  respuesta: number | null;
  ejercicioAprobado: boolean;
}
