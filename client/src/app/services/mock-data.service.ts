import { Injectable } from '@angular/core';
import { Nodo, NodoContenido, Progreso, Ruta } from '../models';

const RUTAS_KEY = 'mock-rutas';
const PROGRESO_KEY = 'mock-progreso';
const APRENDIZAJE_KEY = 'mock-aprendizaje';

export interface EstadoAprendizaje {
  rutaId: string;
  nodoId: string;
  lecturaConfirmada: boolean;
  respuesta: number | null;
  ejercicioAprobado: boolean;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private rutas: Ruta[] = [];
  private progreso: Progreso[] = [];
  private aprendizaje: Record<string, EstadoAprendizaje> = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      const rawR = localStorage.getItem(RUTAS_KEY);
      const rawP = localStorage.getItem(PROGRESO_KEY);
      const rawA = localStorage.getItem(APRENDIZAJE_KEY);
      if (rawR) {
        this.rutas = JSON.parse(rawR) as Ruta[];
      } else {
        this.rutas = this.initialRutas();
        this.saveRutas();
      }

      if (rawP) {
        this.progreso = JSON.parse(rawP) as Progreso[];
      } else {
        this.progreso = this.initialProgreso();
        this.saveProgreso();
      }

      if (rawA) this.aprendizaje = JSON.parse(rawA) as Record<string, EstadoAprendizaje>;
    } catch (e) {
      this.rutas = this.initialRutas();
      this.progreso = this.initialProgreso();
    }
  }

  private saveRutas() {
    localStorage.setItem(RUTAS_KEY, JSON.stringify(this.rutas));
  }

  private saveProgreso() {
    localStorage.setItem(PROGRESO_KEY, JSON.stringify(this.progreso));
  }

  private saveAprendizaje() {
    localStorage.setItem(APRENDIZAJE_KEY, JSON.stringify(this.aprendizaje));
  }

  getEstadoAprendizaje(usuarioId: string): EstadoAprendizaje | null {
    return this.aprendizaje[usuarioId] ? { ...this.aprendizaje[usuarioId] } : null;
  }

  saveEstadoAprendizaje(usuarioId: string, estado: EstadoAprendizaje): void {
    this.aprendizaje[usuarioId] = { ...estado };
    this.saveAprendizaje();
  }

  getRutas(): Ruta[] {
    // return deep copy to avoid accidental mutation
    return JSON.parse(JSON.stringify(this.rutas.map(ruta => ({
      ...ruta,
      nodos: ruta.nodos.map(nodo => ({
        ...nodo,
        contenido: nodo.contenido ?? this.contenidoInicial(nodo.id)
      }))
    })))) as Ruta[];
  }

  getProgreso(): Progreso[] {
    return JSON.parse(JSON.stringify(this.progreso)) as Progreso[];
  }

  toggleNodoCompletado(usuarioId: string, nodoId: string): boolean {
    const idx = this.progreso.findIndex(p => p.usuarioId === usuarioId && p.nodoId === nodoId);
    if (idx >= 0) {
      // toggle
      this.progreso[idx].completado = !this.progreso[idx].completado;
      this.progreso[idx].fecha = this.progreso[idx].completado ? new Date().toISOString() : undefined;
    } else {
      this.progreso.push({ usuarioId, nodoId, completado: true, fecha: new Date().toISOString() });
    }
    this.saveProgreso();
    const current = this.progreso.find(p => p.usuarioId === usuarioId && p.nodoId === nodoId);
    return !!current && current.completado;
  }

  // Add a new node to a ruta
  addNodo(rutaId: string, nodo: Partial<Nodo>): Nodo | null {
    const ruta = this.rutas.find(r => r.id === rutaId);
    if (!ruta) return null;
    const newNodo: Nodo = {
      id: 'n-' + Math.random().toString(36).slice(2, 9),
      titulo: nodo.titulo || 'Nuevo nodo',
      descripcion: nodo.descripcion || '',
      estado: 'Bloqueado',
      prerequisitos: nodo.prerequisitos || [],
      recursos: nodo.recursos || []
    };
    ruta.nodos.push(newNodo);
    ruta.actualizadoEn = new Date().toISOString();
    this.saveRutas();
    return JSON.parse(JSON.stringify(newNodo)) as Nodo;
  }

  // Compute node estado for a given user
  computeNodoEstadoForUser(ruta: Ruta, nodo: Nodo, usuarioId: string): 'Bloqueado' | 'Disponible' | 'Completado' {
    const done = this.progreso.some(p => p.usuarioId === usuarioId && p.nodoId === nodo.id && p.completado);
    if (done) return 'Completado';

    // If no prereqs -> available
    if (!nodo.prerequisitos || nodo.prerequisitos.length === 0) return 'Disponible';

    // check if all prereqs are completed
    const allMet = nodo.prerequisitos.every(pr => this.progreso.some(p => p.usuarioId === usuarioId && p.nodoId === pr && p.completado));
    return allMet ? 'Disponible' : 'Bloqueado';
  }

  private initialRutas(): Ruta[] {
    return [
      {
        id: 'r-1',
        titulo: 'Fundamentos de Programación',
        descripcion: 'Ruta introductoria',
        porcentajeAvance: 0,
        actualizadoEn: new Date().toISOString(),
        nodos: [
          { id: 'n-1', titulo: 'Variables y Tipos', descripcion: 'Aprende a representar datos y elegir el tipo adecuado.', estado: 'Disponible', prerequisitos: [], recursos: [], contenido: this.contenidoInicial('n-1') },
          { id: 'n-2', titulo: 'Control de Flujo', descripcion: 'Toma decisiones y repite instrucciones con lógica clara.', estado: 'Bloqueado', prerequisitos: ['n-1'], recursos: [], contenido: this.contenidoInicial('n-2') },
          { id: 'n-3', titulo: 'Funciones', descripcion: 'Divide un problema en piezas reutilizables y fáciles de probar.', estado: 'Bloqueado', prerequisitos: ['n-2'], recursos: [], contenido: this.contenidoInicial('n-3') }
        ]
      }
    ];
  }

  private initialProgreso(): Progreso[] {
    return [
      { usuarioId: 'u-est-1', nodoId: 'n-1', completado: true, fecha: new Date().toISOString() }
    ];
  }

  private contenidoInicial(nodoId: string): NodoContenido {
    const contenido: Record<string, NodoContenido> = {
      'n-1': {
        resumen: 'Las variables guardan valores que un programa puede consultar o cambiar.',
        teoria: 'Un tipo describe qué clase de dato contiene una variable. Los tipos comunes son texto, número y booleano.',
        ejemplo: "let edad: number = 20;\nlet nombre: string = 'Ana';\nlet activo: boolean = true;",
        pregunta: '¿Qué tipo representa un valor verdadero o falso?',
        opciones: ['string', 'number', 'boolean'],
        respuesta: 2
      },
      'n-2': {
        resumen: 'El control de flujo permite que el programa elija caminos y repita acciones.',
        teoria: 'Usa una condición para tomar decisiones y un ciclo cuando necesitas repetir una operación.',
        ejemplo: "if (edad >= 18) {\n  console.log('Puede ingresar');\n}",
        pregunta: '¿Qué estructura se usa para tomar una decisión?',
        opciones: ['if', 'array', 'interface'],
        respuesta: 0
      },
      'n-3': {
        resumen: 'Una función encapsula una tarea y puede recibir datos para producir un resultado.',
        teoria: 'Nombrar una función hace que el código sea reutilizable, comprobable y más fácil de leer.',
        ejemplo: "function sumar(a: number, b: number): number {\n  return a + b;\n}",
        pregunta: '¿Qué palabra devuelve un resultado desde una función?',
        opciones: ['yield', 'return', 'break'],
        respuesta: 1
      }
    };
    return contenido[nodoId] ?? {
      resumen: 'Contenido pendiente de publicación.',
      teoria: 'El equipo académico agregará esta lección próximamente.',
      ejemplo: 'Contenido en preparación.',
      pregunta: '¿Qué deseas hacer con este contenido?',
      opciones: ['Leer la lección', 'Resolver el ejercicio', 'Ambas'],
      respuesta: 2
    };
  }
}
