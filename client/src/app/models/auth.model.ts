import { UserRole } from './enums';

export type LoginResult =
  | { ok: true; user: UsuarioResumen }
  | { ok: false; error: 'invalid-credentials' | 'server-error' };

export interface UsuarioResumen {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  semestre?: number | null;
  jornada?: 'Diurno' | 'Nocturno' | null;
  genero?: 'Masculino' | 'Femenino' | 'Otro' | 'No especificado' | null;
  intereses?: string[] | null;
}

export interface DemoAccount {
  email: string;
  password: string;
  rol: UserRole;
}
