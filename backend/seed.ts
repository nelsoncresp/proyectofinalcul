import { In } from 'typeorm';
import { AppDataSource } from './src/config/database';
import { Role } from './src/models/role.model';
import { Area } from './src/models/area.model';
import { Asignatura } from './src/models/asignatura.model';
import { LeccionEvaluacion } from './src/models/leccion.model';
import { RecursoContenido } from './src/models/resource.model';

async function seed() {
    await AppDataSource.initialize();
    console.log('Conexión inicializada con la base de datos.');

    // 0. Deshabilitar revision de llaves foraneas temporalmente y asegurar que la tabla areas_conocimiento existe con sus IDs
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await AppDataSource.query(`
        CREATE TABLE IF NOT EXISTS \`areas_conocimiento\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`nombre\` varchar(100) NOT NULL,
            \`descripcion\` varchar(255) NULL,
            \`color\` varchar(30) NOT NULL DEFAULT '#3b82f6',
            \`icono\` varchar(50) NOT NULL DEFAULT 'book',
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB;
    `);

    const areasInit = [
        [1, 'Ciencias Básicas y Matemáticas', 'Fundamentos de cálculo, física y lógica analítica.', '#3b82f6', 'calculator'],
        [2, 'Ingeniería de Software y Algoritmia', 'Lógica computacional, diseño de algoritmos y programación.', '#10b981', 'code'],
        [3, 'Infraestructura, Redes y Sistemas', 'Hardware, redes de telecomunicación y sistemas operativos.', '#8b5cf6', 'server'],
        [4, 'Bases de Datos e Información', 'Modelado de datos, SQL, NoSQL y persistencia.', '#f59e0b', 'database'],
        [5, 'Gestión de TI y Formación CUL', 'Proyectos tecnológicos, metodologías y ética profesional.', '#ec4899', 'briefcase']
    ];

    for (const a of areasInit) {
        await AppDataSource.query(
            'INSERT IGNORE INTO `areas_conocimiento` (`id`, `nombre`, `descripcion`, `color`, `icono`) VALUES (?, ?, ?, ?, ?)',
            a
        );
    }

    // Sincronizar esquema para crear tablas faltantes si aplica
    await AppDataSource.synchronize();
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Esquema sincronizado exitosamente.');

    const roleRepo = AppDataSource.getRepository(Role);
    const areaRepo = AppDataSource.getRepository(Area);
    const asigRepo = AppDataSource.getRepository(Asignatura);
    const leccRepo = AppDataSource.getRepository(LeccionEvaluacion);
    const recuRepo = AppDataSource.getRepository(RecursoContenido);

    // 1. Roles Base
    const rolesData = [
        { id: 1, nombre: 'Administrador' },
        { id: 2, nombre: 'Docente' },
        { id: 3, nombre: 'Estudiante' }
    ];
    for (const r of rolesData) {
        let role = await roleRepo.findOneBy({ id: r.id });
        if (!role) {
            role = roleRepo.create(r);
            await roleRepo.save(role);
        }
    }
    console.log('Roles verificados.');

    // 2. Áreas de Conocimiento
    const areasData = [
        { id: 1, nombre: 'Ciencias Básicas y Matemáticas', descripcion: 'Fundamentos de cálculo, física y lógica analítica.', color: '#3b82f6', icono: 'calculator' },
        { id: 2, nombre: 'Ingeniería de Software y Algoritmia', descripcion: 'Lógica computacional, diseño de algoritmos y programación.', color: '#10b981', icono: 'code' },
        { id: 3, nombre: 'Infraestructura, Redes y Sistemas', descripcion: 'Hardware, redes de telecomunicación y sistemas operativos.', color: '#8b5cf6', icono: 'server' },
        { id: 4, nombre: 'Bases de Datos e Información', descripcion: 'Modelado de datos, SQL, NoSQL y persistencia.', color: '#f59e0b', icono: 'database' },
        { id: 5, nombre: 'Gestión de TI y Formación CUL', descripcion: 'Proyectos tecnológicos, metodologías y ética profesional.', color: '#ec4899', icono: 'briefcase' }
    ];
    for (const a of areasData) {
        let area = await areaRepo.findOneBy({ id: a.id });
        if (!area) {
            area = areaRepo.create(a);
            await areaRepo.save(area);
        }
    }
    console.log('Áreas de conocimiento verificadas.');

    // 3. Asignaturas Base
    const asignaturasData = [
        // Semestre 1
        { id: 1, nombre: 'Cálculo Diferencial', semestre: 1, area_id: 1 },
        { id: 2, nombre: 'Fundamentos de Programación', semestre: 1, area_id: 2 },
        { id: 3, nombre: 'Introducción a la Ingeniería de Sistemas', semestre: 1, area_id: 5 },

        // Semestre 2
        { id: 4, nombre: 'Cálculo Integral', semestre: 2, area_id: 1 },
        { id: 5, nombre: 'Programación Orientada a Objetos', semestre: 2, area_id: 2 },
        { id: 6, nombre: 'Arquitectura de Computadores', semestre: 2, area_id: 3 },

        // Semestre 3
        { id: 7, nombre: 'Física Mecánica', semestre: 3, area_id: 1 },
        { id: 8, nombre: 'Estructuras de Datos', semestre: 3, area_id: 2 },
        { id: 9, nombre: 'Bases de Datos I', semestre: 3, area_id: 4 },

        // Semestre 4
        { id: 10, nombre: 'Sistemas Operativos', semestre: 4, area_id: 3 },
        { id: 11, nombre: 'Bases de Datos Avanzadas', semestre: 4, area_id: 4 },
        { id: 12, nombre: 'Ingeniería de Software I', semestre: 4, area_id: 2 }
    ];

    for (const asig of asignaturasData) {
        let item = await asigRepo.findOneBy({ id: asig.id });
        if (!item) {
            item = asigRepo.create(asig);
            await asigRepo.save(item);
        }
    }
    console.log('Asignaturas base verificadas.');

    // 4. Prerrequisitos (Mapeo de Grafo de Carrera)
    const prerequisitosMap: { [id: number]: number[] } = {
        4: [1],      // Cálculo Integral requiere Cálculo Diferencial
        5: [2],      // POO requiere Fundamentos de Programación
        7: [4],      // Física Mecánica requiere Cálculo Integral
        8: [5],      // Estructuras de Datos requiere POO
        9: [5],      // Bases de Datos I requiere POO
        10: [6],     // Sistemas Operativos requiere Arquitectura de Computadores
        11: [9],     // Bases de Datos Avanzadas requiere Bases de Datos I
        12: [8]      // Ingeniería de Software I requiere Estructuras de Datos
    };

    for (const [idStr, preIds] of Object.entries(prerequisitosMap)) {
        const id = Number(idStr);
        const asig = await asigRepo.findOne({ where: { id }, relations: ['prerrequisitos'] });
        if (asig) {
            const pres = await asigRepo.findBy({ id: In(preIds) });
            asig.prerrequisitos = pres;
            await asigRepo.save(asig);
        }
    }
    console.log('Prerrequisitos académicos enlazados con éxito.');

    // 5. Lecciones y Evaluaciones Interactivas
    const leccionesData = [
        {
            asignatura_id: 1,
            contenido_lectura: 'El cálculo diferencial es el estudio del cambio y la razón a la cual ocurren los cambios en funciones matemáticas. El concepto fundamental es la derivada, que mide la tasa de variación instantánea de una variable respecto a otra.',
            video_url: 'https://www.youtube.com/watch?v=kYJUp_b6P4M',
            tiempo_minimo_segundos: 60,
            pregunta: '¿Cuál es el significado geométrico principal de la derivada de una función en un punto?',
            opciones: [
                'El área total bajo la curva de la función.',
                'La pendiente de la recta tangente a la curva en ese punto.',
                'El punto donde la función se hace igual a cero.',
                'La longitud total de la gráfica en el intervalo.'
            ],
            respuesta_correcta: 1,
            explicacion: 'Exacto: Geométricamente, la derivada en un punto representa la pendiente de la recta tangente a la gráfica de la función en dicho punto.'
        },
        {
            asignatura_id: 2,
            contenido_lectura: 'La programación secuencial y estructurada se fundamenta en variables, tipos de datos primitivos, operadores lógicos y estructuras de control de flujo (condicionales y bucles iterativos). Todo algoritmo eficiente descompone un problema complejo en instrucciones secuenciales elementales.',
            video_url: 'https://www.youtube.com/watch?v=CDk8bTls2b4',
            tiempo_minimo_segundos: 60,
            pregunta: '¿Qué estructura de control es óptima cuando se conoce con exactitud el número de iteraciones a ejecutar?',
            opciones: [
                'Bucle while con condición indefinida.',
                'Bucle for indexado.',
                'Estructura switch-case.',
                'Recursión sin caso base.'
            ],
            respuesta_correcta: 1,
            explicacion: 'Correcto: El ciclo for es el más adecuado cuando el número de repeticiones está determinado de antemano.'
        },
        {
            asignatura_id: 3,
            contenido_lectura: 'La Ingeniería de Sistemas en la CUL forma profesionales orientados al diseño, análisis y optimización de soluciones de computación integrales, considerando hardware, software y factor humano en ecosistemas de información.',
            video_url: null,
            tiempo_minimo_segundos: 30,
            pregunta: '¿Cuál es el objetivo principal del pensamiento sistémico en la ingeniería?',
            opciones: [
                'Escribir código sin documentar.',
                'Comprender las partes como un todo interconectado y evaluar su impacto global.',
                'Ignorar el contexto de negocio de las empresas.',
                'Reemplazar todas las personas por robots.'
            ],
            respuesta_correcta: 1,
            explicacion: 'Correcto: El pensamiento sistémico evalúa cómo interactúan todos los componentes de un sistema complejo.'
        },
        {
            asignatura_id: 5,
            contenido_lectura: 'La Programación Orientada a Objetos (POO) modela el software en base a Clases y Objetos, articulándose sobre cuatro pilares fundamentales: Abstracción, Encapsulamiento, Herencia y Polimorfismo.',
            video_url: 'https://www.youtube.com/watch?v=2pA4UjE_tB8',
            tiempo_minimo_segundos: 60,
            pregunta: '¿Qué pilar de la POO permite que un objeto oculte sus atributos internos y restrinja el acceso directo?',
            opciones: [
                'Polimorfismo dinámico.',
                'Herencia múltiple.',
                'Encapsulamiento.',
                'Sobrecarga de operadores.'
            ],
            respuesta_correcta: 2,
            explicacion: 'Excelente: El encapsulamiento protege el estado interno de un objeto permitiendo su manipulación únicamente mediante métodos controlados (getters/setters).'
        }
    ];

    for (const lec of leccionesData) {
        let item = await leccRepo.findOneBy({ asignatura_id: lec.asignatura_id });
        if (!item) {
            item = leccRepo.create(lec);
            await leccRepo.save(item);
        }
    }
    console.log('Lecciones interactivas registradas.');

    // 6. Recursos Curados Base
    const recursosData = [
        {
            id: 1,
            asignatura_id: 1,
            titulo: 'Guía de Derivadas y Límites - CUL Ciencias Básicas',
            tipo_recurso: 'documento',
            enlace: 'https://repositorio.cul.edu.co/ciencias/calculo_diferencial.pdf',
            estado_revision: 'aprobado'
        },
        {
            id: 2,
            asignatura_id: 2,
            titulo: 'Repositorio GitHub - Algoritmos y Ejercicios Prácticos',
            tipo_recurso: 'repositorio',
            enlace: 'https://github.com/cul-ingenieria/fundamentos-programacion',
            estado_revision: 'aprobado'
        },
        {
            id: 3,
            asignatura_id: 5,
            titulo: 'Manual de Patrones POO y Principios SOLID',
            tipo_recurso: 'documento',
            enlace: 'https://github.com/cul-ingenieria/poo-solid-patterns',
            estado_revision: 'aprobado'
        }
    ];

    for (const rec of recursosData) {
        let item = await recuRepo.findOneBy({ id: rec.id });
        if (!item) {
            item = recuRepo.create(rec);
            await recuRepo.save(item);
        }
    }
    console.log('Recursos curados iniciales registrados.');

    console.log('¡SEED COMPLETADO EXITOSAMENTE!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Error ejecutando seed:', err);
    process.exit(1);
});
