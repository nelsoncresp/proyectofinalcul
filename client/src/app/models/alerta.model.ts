export type AlertaTipo = 'exito' | 'error' | 'info';

export interface Alerta {
  id: number;
  tipo: AlertaTipo;
  titulo: string;
  detalle?: string;
}
