import { NodoEstado } from './enums';
import { Recurso } from './recurso.model';

export interface NodoContenido {
  resumen: string;
  teoria: string;
  ejemplo: string;
  pregunta: string;
  opciones: string[];
  respuesta: number;
}

export interface Nodo {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: NodoEstado;
  prerequisitos: string[]; // ids de otros nodos
  recursos?: Recurso[];
  contenido?: NodoContenido;
}
