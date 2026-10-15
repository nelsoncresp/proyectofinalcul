export interface Progreso {
  usuarioId: string;
  nodoId: string;
  completado: boolean;
  fecha?: string; // ISO date string
}
