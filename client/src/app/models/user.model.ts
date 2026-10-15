import { UserRole } from './enums';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  semestre?: number | null;
  jornada?: 'Diurno' | 'Nocturno' | null;
}
