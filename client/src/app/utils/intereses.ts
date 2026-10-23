/**
 * Catálogo único de intereses académicos (registro + perfil + recomendador).
 * Mantener sincronizado con INTERESES_PERMITIDOS en backend/src/controllers/auth.controller.ts.
 */
export const INTERESES_DISPONIBLES: string[] = [
  'Desarrollo Web',
  'Desarrollo Móvil',
  'Inteligencia Artificial y ML',
  'Ciberseguridad',
  'Bases de Datos y Big Data',
  'Redes e Infraestructura',
  'DevOps y Cloud',
  'Ingeniería de Software',
  'Videojuegos',
  'Gestión de TI'
];

/**
 * Mapa interés → áreas de conocimiento del pensum (post-corrección de áreas):
 * 1 = Ciencias Básicas y Matemáticas
 * 2 = Ingeniería de Software y Algoritmia
 * 3 = Infraestructura, Redes y Sistemas
 * 4 = Bases de Datos e Información
 * 5 = Gestión de TI y Formación CUL
 */
export const INTERES_AREAS: Record<string, number[]> = {
  'Desarrollo Web': [2],
  'Desarrollo Móvil': [2],
  'Inteligencia Artificial y ML': [2, 1],
  'Ciberseguridad': [3],
  'Bases de Datos y Big Data': [4, 2],
  'Redes e Infraestructura': [3],
  'DevOps y Cloud': [3],
  'Ingeniería de Software': [2],
  'Videojuegos': [2],
  'Gestión de TI': [5]
};

/** Áreas recomendadas para un conjunto de intereses (sin duplicados, orden ascendente). */
export function areasRecomendadas(intereses: string[] | null | undefined): number[] {
  if (!intereses || intereses.length === 0) return [];
  const set = new Set<number>();
  intereses.forEach(i => INTERES_AREAS[i]?.forEach(a => set.add(a)));
  return [...set].sort((a, b) => a - b);
}

export interface CursoInteres {
  id: string;
  interes: string;
  titulo: string;
  subtitulo: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  duracion: string;
  color: string;
  tags: string[];
  descripcion: string;
  modulos: string[];
  clasesCount: number;
}

export const CATALOGO_CURSOS_INTERES: Record<string, CursoInteres[]> = {
  'Desarrollo Web': [
    {
      id: 'web-101',
      interes: 'Desarrollo Web',
      titulo: 'Fundamentos Web: HTML5 Semántico y Estructura Web',
      subtitulo: 'Aprende a estructurar sitios y aplicaciones web accesibles desde cero',
      nivel: 'Principiante',
      duracion: '3 semanas · 10 clases',
      color: '#E44D26',
      tags: ['HTML5', 'Semántica', 'Accesibilidad (a11y)', 'SEO Básico'],
      descripcion: 'Domina la anatomía del documento web, jerarquía de encabezados, marcado semántico estructurado (main, nav, article, section), formularios y buenas prácticas universales.',
      modulos: ['Estructura del Documento y Doctype', 'Etiquetas Semánticas y Contenido', 'Formularios y Validaciones Nativas', 'Accesibilidad Web y Estándares W3C'],
      clasesCount: 10
    },
    {
      id: 'web-102',
      interes: 'Desarrollo Web',
      titulo: 'CSS3 Moderno, Flexbox, Grid y Frameworks (Tailwind & Bootstrap)',
      subtitulo: 'Diseña interfaces visuales adaptables y responsivas para móviles y escritorio',
      nivel: 'Principiante',
      duracion: '4 semanas · 14 clases',
      color: '#264DE4',
      tags: ['CSS3', 'Flexbox', 'CSS Grid', 'Tailwind CSS', 'Bootstrap 5'],
      descripcion: 'Aprende el modelo de caja, diseño fluido, posicionamiento con Flexbox y Grid, y acelera tu flujo de trabajo con las clases utilitarias de Tailwind CSS y la cuadrícula de Bootstrap.',
      modulos: ['Modelo de Caja, Especificidad y Selectores', 'Flexbox y CSS Grid a Fondo', 'Diseño Mobile-First y Media Queries', 'Maquetación con Tailwind CSS y Bootstrap 5'],
      clasesCount: 14
    },
    {
      id: 'web-103',
      interes: 'Desarrollo Web',
      titulo: 'JavaScript Moderno (ES6+) y Manipulación del DOM',
      subtitulo: 'Agrega lógica, dinamismo e interactividad real a tus páginas web',
      nivel: 'Principiante',
      duracion: '5 semanas · 16 clases',
      color: '#F7DF1E',
      tags: ['JavaScript', 'ES6+', 'DOM', 'Async/Await', 'Fetch API'],
      descripcion: 'Comprende variables let/const, funciones flecha, desestructuración, eventos de usuario, manipulación dinámica del DOM y consumo de APIs externas con Fetch y promesas.',
      modulos: ['Sintaxis ES6+, Tipos y Estructuras', 'Manejo de Eventos y el Árbol DOM', 'Asincronía: Promesas, Async/Await y Fetch', 'Módulos ES6 y Programación Funcional'],
      clasesCount: 16
    },
    {
      id: 'web-104',
      interes: 'Desarrollo Web',
      titulo: 'Frameworks Frontend Modernos: React, Angular y Vue',
      subtitulo: 'Construye aplicaciones de una sola página (SPA) basadas en componentes',
      nivel: 'Intermedio',
      duracion: '6 semanas · 18 clases',
      color: '#61DAFB',
      tags: ['React', 'Angular', 'Vue.js', 'SPAs', 'Componentes'],
      descripcion: 'Descubre los principios fundamentales de las SPAs, el ciclo de vida de los componentes, reactividad y gestión de estado comparando el flujo en React, Angular y Vue.',
      modulos: ['Arquitectura de SPAs y Componentes Reutilizables', 'React: JSX, Hooks y Flujo Unidireccional', 'Vue 3: Composition API y Reactividad', 'Angular: Componentes Standalone y Servicios'],
      clasesCount: 18
    },
    {
      id: 'web-105',
      interes: 'Desarrollo Web',
      titulo: 'Desarrollo Backend y APIs RESTful con Node.js y Express',
      subtitulo: 'Crea servidores seguros, lógica de negocio y endpoints para tus clientes web',
      nivel: 'Intermedio',
      duracion: '5 semanas · 15 clases',
      color: '#68A063',
      tags: ['Node.js', 'Express', 'APIs REST', 'JWT', 'Bases de Datos'],
      descripcion: 'Diseña APIs estructuradas en capas, middlewares, controladores, autenticación JWT segura y persistencia de datos relacionales.',
      modulos: ['Fundamentos del Entorno Node.js', 'Servidores y Enrutamiento con Express', 'Middlewares, CORS y Seguridad JWT', 'Conexión a Bases de Datos y CRUD Completo'],
      clasesCount: 15
    }
  ],
  'Inteligencia Artificial y ML': [
    {
      id: 'ai-101',
      interes: 'Inteligencia Artificial y ML',
      titulo: 'Machine Learning Práctico con Python',
      subtitulo: 'De la limpieza de datos al entrenamiento de modelos supervisados',
      nivel: 'Intermedio',
      duracion: '6 semanas · 18 clases',
      color: '#8B5CF6',
      tags: ['Python', 'Pandas', 'Scikit-Learn', 'Modelos Supervisados'],
      descripcion: 'Entrena clasificadores y regresores con datos del mundo real, evalúa métricas (F1, AUC-ROC) y optimiza hiperparámetros.',
      modulos: ['Preprocesamiento y EDA', 'Regresión y Árboles de Decisión', 'Redes Neuronales Básicas', 'Validación Cruzada y Despliegue'],
      clasesCount: 18
    },
    {
      id: 'ai-102',
      interes: 'Inteligencia Artificial y ML',
      titulo: 'Ingeniería de Prompts y Agentes con LLMs',
      subtitulo: 'Aprende a integrar modelos de lenguaje en flujos de trabajo de software',
      nivel: 'Principiante',
      duracion: '3 semanas · 10 clases',
      color: '#A855F7',
      tags: ['LLMs', 'Prompt Engineering', 'RAG', 'Embeddings'],
      descripcion: 'Construye asistentes inteligentes utilizando embeddings vectoriales, arquitecturas de recuperación aumentada (RAG) y cadenas de ejecución con agentes.',
      modulos: ['Fundamentos de LLMs y Tokens', 'Estrategias de Prompting Avanzado', 'Bases de Datos Vectoriales y RAG', 'Herramientas y Agentes Autónomos'],
      clasesCount: 10
    }
  ],
  'Ciberseguridad': [
    {
      id: 'sec-101',
      interes: 'Ciberseguridad',
      titulo: 'Fundamentos de Hacking Ético y Pentesting',
      subtitulo: 'Identifica y remedia vulnerabilidades antes que los atacantes',
      nivel: 'Intermedio',
      duracion: '5 semanas · 15 clases',
      color: '#EF4444',
      tags: ['Kali Linux', 'Nmap', 'OWASP Top 10', 'Pentesting'],
      descripcion: 'Aprende metodologías de análisis de vulnerabilidades, escaneo de puertos, pruebas de penetración web y reporte ético de hallazgos.',
      modulos: ['Fase de Reconocimiento y OSINT', 'Análisis de Redes con Nmap y Wireshark', 'Vulnerabilidades Web (XSS, SQLi, CSRF)', 'Reporte y Mitigación'],
      clasesCount: 15
    },
    {
      id: 'sec-102',
      interes: 'Ciberseguridad',
      titulo: 'Defensa de Redes y Criptografía Práctica',
      subtitulo: 'Protección perimetral, firewalls y cifrado de comunicaciones',
      nivel: 'Principiante',
      duracion: '4 semanas · 12 clases',
      color: '#F43F5E',
      tags: ['Firewalls', 'VPNs', 'Criptografía', 'Zero Trust'],
      descripcion: 'Configura reglas de firewall, certificados SSL/TLS, autenticación multifactor y estrategias de defensa en profundidad.',
      modulos: ['Principios de Confidencialidad e Integridad', 'Criptografía Simétrica y Asimétrica', 'Segmentación de Redes y DMZ', 'Políticas Zero Trust'],
      clasesCount: 12
    }
  ],
  'Desarrollo Móvil': [
    {
      id: 'mob-101',
      interes: 'Desarrollo Móvil',
      titulo: 'Apps Nativas con Flutter y Dart',
      subtitulo: 'Crea apps para Android e iOS con una sola base de código',
      nivel: 'Intermedio',
      duracion: '5 semanas · 16 clases',
      color: '#0EA5E9',
      tags: ['Flutter', 'Dart', 'Widgets', 'State Management'],
      descripcion: 'Desarrolla interfaces móviles fluidas a 60 FPS, maneja estado con Bloc/Provider y consume APIs de servicios en la nube.',
      modulos: ['Árbol de Widgets y Layouts Móviles', 'Gestión de Estado Reactiva', 'Persistencia Local (SQLite/Preferences)', 'Publicación en Tiendas'],
      clasesCount: 16
    }
  ],
  'Bases de Datos y Big Data': [
    {
      id: 'db-101',
      interes: 'Bases de Datos y Big Data',
      titulo: 'Bases de Datos NoSQL: MongoDB y Redis',
      subtitulo: 'Modelado documental, almacenamiento en caché y alto rendimiento',
      nivel: 'Intermedio',
      duracion: '4 semanas · 12 clases',
      color: '#10B981',
      tags: ['MongoDB', 'Redis', 'Agregaciones', 'Caching'],
      descripcion: 'Aprende a diseñar esquemas orientados a documentos, optimizar pipelines de agregación y acelerar lecturas con memoria en caché Redis.',
      modulos: ['Diseño Documental vs Relacional', 'Pipelines de Agregación MongoDB', 'Estrategias de Caché con Redis', 'Transacciones y Sharding'],
      clasesCount: 12
    }
  ],
  'Redes e Infraestructura': [
    {
      id: 'net-101',
      interes: 'Redes e Infraestructura',
      titulo: 'Administración de Servidores Linux Empresariales',
      subtitulo: 'Control del sistema operativo que sostiene la infraestructura mundial',
      nivel: 'Principiante',
      duracion: '4 semanas · 14 clases',
      color: '#6366F1',
      tags: ['Linux', 'Bash Scripting', 'SSH', 'Systemd'],
      descripcion: 'Domina permisos POSIX, automatización de tareas con scripts Bash, gestión de procesos, configuración de servicios y seguridad de accesos.',
      modulos: ['Línea de Comandos y Filtros', 'Gestión de Usuarios y Permisos', 'Servicios del Sistema con Systemd', 'Automatización con Cron y Bash'],
      clasesCount: 14
    }
  ],
  'DevOps y Cloud': [
    {
      id: 'devops-101',
      interes: 'DevOps y Cloud',
      titulo: 'Contenedores Docker y Flujos CI/CD',
      subtitulo: 'Empaqueta, prueba y despliega software de forma continua y reproducible',
      nivel: 'Intermedio',
      duracion: '5 semanas · 15 clases',
      color: '#0284C7',
      tags: ['Docker', 'GitHub Actions', 'CI/CD', 'Deployments'],
      descripcion: 'Construye Dockerfiles optimizados multicapa, orquesta microservicios con Docker Compose y automatiza pipelines de integración continua.',
      modulos: ['Arquitectura de Contenedores e Imágenes', 'Docker Compose y Redes Internas', 'Pipelines en GitHub Actions', 'Buenas Prácticas de Producción'],
      clasesCount: 15
    }
  ],
  'Ingeniería de Software': [
    {
      id: 'eng-101',
      interes: 'Ingeniería de Software',
      titulo: 'Patrones de Diseño y Clean Architecture',
      subtitulo: 'Escribe código desacoplado, testeable y fácil de mantener a lo largo del tiempo',
      nivel: 'Intermedio',
      duracion: '5 semanas · 15 clases',
      color: '#14B8A6',
      tags: ['SOLID', 'Patrones GoF', 'Clean Architecture', 'Refactor'],
      descripcion: 'Aplica principios SOLID, patrones creacionales/estructurales/de comportamiento y estructura tus aplicaciones con arquitectura hexagonal o limpia.',
      modulos: ['Principios SOLID con Ejemplos Reales', 'Patrones Creacionales y de Estructura', 'Patrones de Comportamiento (Observer, Strategy)', 'Arquitectura Hexagonal'],
      clasesCount: 15
    }
  ],
  'Videojuegos': [
    {
      id: 'game-101',
      interes: 'Videojuegos',
      titulo: 'Desarrollo de Videojuegos 2D con Unity y C#',
      subtitulo: 'De la física y animación de personajes a la lógica de juego interactiva',
      nivel: 'Principiante',
      duracion: '6 semanas · 18 clases',
      color: '#EC4899',
      tags: ['Unity', 'C#', 'Física 2D', 'Game Loops'],
      descripcion: 'Aprende el ciclo de vida de componentes Unity, colisionadores, prefabs, máquinas de estados de animación y publicación de prototipos jugables.',
      modulos: ['Entorno Unity y Fundamentos de C#', 'Físicas 2D, Rigidbodies y Colliders', 'Sistemas de Partículas y Audio', 'UI de Juego y Exportación'],
      clasesCount: 18
    }
  ],
  'Gestión de TI': [
    {
      id: 'mgt-101',
      interes: 'Gestión de TI',
      titulo: 'Metodologías Ágiles: Scrum y Gestión de Proyectos TI',
      subtitulo: 'Lidera equipos ágiles, sprints y entregas de valor continuo',
      nivel: 'Principiante',
      duracion: '3 semanas · 10 clases',
      color: '#F59E0B',
      tags: ['Scrum', 'Kanban', 'User Stories', 'Jira'],
      descripcion: 'Comprende el marco Scrum (roles, eventos, artefactos), redacción de historias de usuario con criterios de aceptación y tableros ágiles.',
      modulos: ['El Manifiesto Ágil y Principios', 'Roles de Scrum: PO, Scrum Master, Devs', 'Estimación y Planificación de Sprints', 'Métricas Ágiles (Velocity, Burndown)'],
      clasesCount: 10
    }
  ]
};

/**
 * Retorna los cursos extracurriculares independientes asociados a los intereses dados.
 * Si no hay intereses o cursos, retorna una selección por defecto.
 */
export function obtenerCursosPorIntereses(intereses: string[] | null | undefined): CursoInteres[] {
  if (!intereses || intereses.length === 0) return [];
  const cursos: CursoInteres[] = [];
  const idsVistos = new Set<string>();

  for (const interes of intereses) {
    const lista = CATALOGO_CURSOS_INTERES[interes];
    if (lista) {
      for (const c of lista) {
        if (!idsVistos.has(c.id)) {
          idsVistos.add(c.id);
          cursos.push(c);
        }
      }
    }
  }

  return cursos;
}

