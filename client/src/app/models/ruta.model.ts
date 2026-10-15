import { Nodo } from './nodo.model';

export interface Ruta {
  id: string;
  titulo: string;
  descripcion?: string;
  nodos: Nodo[];
  porcentajeAvance: number; // 0..100
  actualizadoEn?: string; // ISO date string — última modificación (curaduría)
}
