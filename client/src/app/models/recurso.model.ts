import { RecursoTipo, NivelComplejidad } from './enums';

export interface Recurso {
  id: string;
  tipo: RecursoTipo;
  titulo?: string;
  url: string;
  nivelComplejidad: NivelComplejidad;
}
