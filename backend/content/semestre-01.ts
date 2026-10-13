import type { ContenidoAsignatura } from './tipos';

/**
 * Semestre 1 del pensum real CUL (7 materias).
 * Nombres exactos de `asignaturas` (minúsculas, sin acentos).
 */
export const semestre01: ContenidoAsignatura[] = [
    {
        nombre: 'Fisica mecanica',
        contenido_lectura:
            'La física mecánica estudia los sistemas materiales en reposo y en movimiento, y constituye el lenguaje con el que la ingeniería describe el mundo físico. La cinemática describe el movimiento sin preguntar por sus causas: posición, desplazamiento, velocidad y aceleración se modelan como funciones del tiempo, y el análisis del movimiento rectilíneo uniforme (MRU) y del movimiento rectilíneo uniformemente acelerado (MRUA) entrega las herramientas básicas para predecir trayectorias. La dinámica introduce las causas del movimiento: la primera ley de Newton define la inercia, la segunda establece que la fuerza neta es igual a masa por aceleración (F = m·a), y la tercera describe la acción y la reacción. Sobre estas leyes se construyen el análisis de fuerzas de rozamiento, el equilibrio de cuerpos y el estudio del trabajo, la energía cinética y la energía potencial, cuyos principios de conservación permiten resolver problemas complejos sin rastrear cada fuerza por separado. El dominio de estos conceptos es imprescindible para carreras de ingeniería, donde el modelado mecánico sustenta el diseño de estructuras, máquinas y sistemas electromecánicos.',
        video_url: 'https://www.youtube.com/watch?v=aDHVXyFXxCE',
        tiempo_minimo_segundos: 150,
        preguntas: [
            {
                pregunta: 'En cinemática, ¿qué diferencia existe entre desplazamiento y recorrido (distancia)?',
                opciones: [
                    'El desplazamiento es una magnitud vectorial que solo depende de los puntos inicial y final; el recorrido es la longitud total del trayecto.',
                    'El desplazamiento siempre es mayor o igual que el recorrido.',
                    'Ambas magnitudes son idénticas siempre que el movimiento sea curvilíneo.',
                    'El recorrido depende solo de la velocidad media, y el desplazamiento de la aceleración.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'El desplazamiento es un vector que va del punto inicial al final, por lo que ignora el camino intermedio; el recorrido (distancia) mide toda la longitud recorrida y solo puede ser mayor o igual en módulo que el desplazamiento.',
            },
            {
                pregunta: 'En el Sistema Internacional, la unidad de fuerza (Newton) se define a partir de:',
                opciones: [
                    'masa por aceleración (kg·m/s²)',
                    'masa por velocidad (kg·m/s)',
                    'energía por unidad de tiempo (J/s)',
                    'trabajo por unidad de distancia (J/m)',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'De la segunda ley de Newton, F = m·a, la unidad de fuerza se compone de kilogramo por metro sobre segundo al cuadrado: 1 N equivale a la fuerza que acelera 1 kg a 1 m/s².',
            },
        ],
        recursos: [
            { titulo: 'Khan Academy - Física (curso completo en español)', tipo: 'enlace', enlace: 'https://es.khanacademy.org/science/physics' },
            { titulo: 'HyperPhysics - Referencia conceptual de mecánica', tipo: 'documento', enlace: 'https://hyperphysics.phy-astr.gsu.edu/' },
            { titulo: 'The Physics Classroom - Lecciones y simulaciones', tipo: 'enlace', enlace: 'https://www.physicsclassroom.com/' },
            { titulo: 'MIT OpenCourseWare 8.01SC - Classical Mechanics', tipo: 'documento', enlace: 'https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/' },
            { titulo: 'LibreTexts Physics - Textos abiertos de física', tipo: 'documento', enlace: 'https://phys.libretexts.org/' },
            { titulo: 'OpenStax - University Physics Volume 1 (PDF libre)', tipo: 'documento', enlace: 'https://openstax.org/details/books/university-physics-volume-1' },
            { titulo: 'Wikipedia - Mecánica clásica', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Mec%C3%A1nica_cl%C3%A1sica' },
            { titulo: 'GeoGebra - Simulaciones interactivas de física', tipo: 'enlace', enlace: 'https://www.geogebra.org/' },
        ],
    },
    {
        nombre: 'Comunicacion oral y escrita',
        contenido_lectura:
            'Comunicar es transferir información, ideas y actitudes de un emisor a un receptor mediante un código compartido, y la competencia comunicativa es un activo profesional tan determinante como la técnica. La comunicación oral se produce en tiempo real: depende de la pronunciación, el ritmo, el lenguaje corporal y la escucha activa, y admite retroalimentación inmediata; por eso su preparación exige estructurar el mensaje con introducción, desarrollo y cierre, y adaptar el registro al auditorio. La comunicación escrita, en cambio, permite planificación y revisión, pero exige precisión léxica, coherencia y cohesión textual: párrafos con idea central, conectores lógicos y un estilo adecuado al género (informe, correo profesional, memoria). Ambas modalidades comparten la argumentación: sostener una tesis con premisas verificables, anticipar objeciones y evitar falacias como el ad hominem o la apelación a la mayoría. En el ejercicio profesional, la mayor parte de los fracasos técnicos se explican por mensajes mal formulados, no por ideas débiles: redactar y exponer con rigor es, literalmente, parte del trabajo del ingeniero.',
        video_url: 'https://www.youtube.com/watch?v=JiM6f6z1lxA',
        tiempo_minimo_segundos: 150,
        preguntas: [
            {
                pregunta: '¿Cuál es una diferencia fundamental entre la comunicación escrita y la oral?',
                opciones: [
                    'La escrita permite planificación y revisión; la oral se produce en tiempo real y depende de la retroalimentación inmediata.',
                    'La oral admite un vocabulario técnico y la escrita no.',
                    'La escrita nunca requiere adaptación al auditorio.',
                    'La oral no transmite actitudes ni emociones.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La escrita ofrece control sobre el texto (planificación, borradores, revisión); la oral ocurre en vivo y su eficacia depende de la claridad del habla, del lenguaje corporal y de la escucha activa del interlocutor.',
            },
            {
                pregunta: 'Al preparar una exposición oral técnica, ¿qué acción mejora más la claridad del mensaje?',
                opciones: [
                    'Estructurar el discurso con introducción, desarrollo y cierre, adaptando el lenguaje al nivel del auditorio.',
                    'Incluir la mayor cantidad posible de tecnicismos para demostrar dominio.',
                    'Leer el texto completo del informe de manera literal.',
                    'Evitar cualquier pregunta del público para no perder el hilo.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La estructura clásica guía al oyente y la adaptación al auditorio evita la sobrecarga cognitiva; los tecnicismos innecesarios y la lectura literal deterioran la comprensión y la conexión con el público.',
            },
        ],
        recursos: [
            { titulo: 'Purdue OWL - Guía de redacción y gramática (inglés)', tipo: 'documento', enlace: 'https://owl.purdue.edu/' },
            { titulo: 'Khan Academy - Gramática en español', tipo: 'enlace', enlace: 'https://es.khanacademy.org/humanities/grammar' },
            { titulo: 'RAE - Diccionario panhispánico de dudas (DPD)', tipo: 'documento', enlace: 'https://www.rae.es/dpd/' },
            { titulo: 'MindTools - Habilidades de comunicación', tipo: 'enlace', enlace: 'https://www.mindtools.com/' },
            { titulo: 'Wikipedia - Comunicación (proceso y elementos)', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Comunicaci%C3%B3n' },
            { titulo: 'Wikipedia - Redacción (géneros y estructura)', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Redacci%C3%B3n' },
            { titulo: 'Astraway - Videos de comunicación oral y escrita', tipo: 'enlace', enlace: 'https://www.youtube.com/@Astraway' },
        ],
    },
    {
        nombre: 'Fundamentos matematicos',
        contenido_lectura:
            'Los fundamentos matemáticos construyen el idioma en el que la ingeniería formula sus problemas. La lógica proposicional estudia enunciados que pueden ser verdaderos o falsos, las conectivas (y, o, negación, implicación) que los combinan y las tablas de verdad que determinan su valor; los cuantificadores universal (∀) y existencial (∀) permiten enunciar proposiciones sobre conjuntos completos. La teoría de conjuntos aporta la notación de pertenencia, unión, intersección, complemento y diferencia, base para describir dominios de funciones y relaciones. Las funciones asocian cada elemento de un conjunto de partida con un único elemento de un conjunto de llegada; su estudio incluye dominio, recorrido, inyectividad, biyectividad y composición, además del análisis gráfico de crecimiento, máximos y asíntotas. El orden de magnitud, la notación científica y el manejo de logaritmos y potencias completan el instrumental necesario para el cálculo diferencial e integral. Este bloque parece abstracto, pero cada técnica que se use después en física, estadística o programación descansa aquí: dominar estas bases reduce drásticamente los fracasos en asignaturas posteriores.',
        video_url: 'https://www.youtube.com/watch?v=oVxT4iwwG9g',
        tiempo_minimo_segundos: 150,
        preguntas: [
            {
                pregunta: 'En lógica proposicional, ¿cuál es el valor de verdad de la negación de una proposición verdadera?',
                opciones: [
                    'Falso, siempre.',
                    'Verdadero, siempre.',
                    'Depende de la longitud de la proposición.',
                    'Indefinido hasta aplicar los cuantificadores.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La negación invierte el valor de verdad: si P es verdadera, ¬P es falsa. Es una de las propiedades básicas de las conectivas lógicas.',
            },
            {
                pregunta: 'Dados A = {1, 2, 3} y B = {2, 3, 4}, ¿cuál es el conjunto A ∩ B (intersección)?',
                opciones: ['{2, 3}', '{1, 4}', '{1, 2, 3, 4}', '∅ (conjunto vacío)'],
                respuesta_correcta: 0,
                explicacion:
                    'La intersección reúne solo los elementos presentes en ambos conjuntos: el 2 y el 3 cumplen la condición de pertenencia a A y a B a la vez.',
            },
        ],
        recursos: [
            { titulo: 'Khan Academy - Matemáticas (ruta completa en español)', tipo: 'enlace', enlace: 'https://es.khanacademy.org/math' },
            { titulo: 'MathWorld (Wolfram) - Referencia matemática enciclopédica', tipo: 'documento', enlace: 'https://mathworld.wolfram.com/' },
            { titulo: "Paul's Online Math Notes - Álgebra y pre cálculo", tipo: 'documento', enlace: 'https://tutorial.math.lamar.edu/' },
            { titulo: 'Wolfram Alpha - Calculadora de pasos', tipo: 'enlace', enlace: 'https://www.wolframalpha.com/' },
            { titulo: 'Wikipedia - Conjunto (teoría de conjuntos)', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Conjunto' },
            { titulo: 'Wikipedia - Lógica matemática', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/L%C3%B3gica_matem%C3%A1tica' },
            { titulo: '3Blue1Brown - Visualización matemática', tipo: 'enlace', enlace: 'https://www.3blue1brown.com/' },
        ],
    },
    {
        nombre: 'Formacion del espiritu cientifico',
        contenido_lectura:
            'Formar el espíritu científico no es memorizar hechos, sino adoptar una manera de pensar: exigir evidencia, aceptar el error y corregirlo. El método científico articula observación de un fenómeno, formulación de una hipótesis contrastable, experimentación controlada, análisis de resultados y publicación que permite la réplica de terceros. Karl Popper añadió una corrección decisiva: lo que distingue a una teoría científica no es que pueda confirmarse —casi cualquier hipótesia admite ejemplos a favor— sino que pueda refutarse; una afirmación inverificable (como las predicciones sin fecha) queda fuera de la ciencia. El pensamiento crítico complementa el método con herramientas defensivas contra el autoengaño: identificar sesgos cognitivos (confirmación, disponibilidad, exceso de confianza) y reconocer falacias formales e informales, como el ad hominem, la falsa dicotomía o la apelación a la autoridad. A esto se suma la ética científica: honestidad en el reporte de datos, reconocimiento de fuentes y responsabilidad social del conocimiento. Un profesional formado en este marco toma mejores decisiones porque distingue entre lo que sabe, lo que supone y lo que solo parece saber.',
        video_url: 'https://www.youtube.com/watch?v=gHTYikPV15M',
        tiempo_minimo_segundos: 150,
        preguntas: [
            {
                pregunta: 'Según el falsacionismo de Karl Popper, ¿qué convierte a una teoría en científica?',
                opciones: [
                    'Que formule afirmaciones que puedan ser refutadas por evidencia o experimentación.',
                    'Que acumule la mayor cantidad de confirmaciones posibles.',
                    'Que sea aceptada por la mayoría de los científicos.',
                    'Que no pueda ser contradicha por ningún dato futuro.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'Popper sostenía que la demarcación entre ciencia y no ciencia es la refutabilidad: una teoría científica arriesga predicciones que pueden resultar falsas; las teorías inverificables no hacen ciencia.',
            },
            {
                pregunta: '¿Cuál de los siguientes ejemplos corresponde a una falacia ad hominem?',
                opciones: [
                    'Rechazar un argumento atacando a la persona que lo expone, en lugar de discutir sus razones.',
                    'Concluir que algo es cierto porque lo sostiene una mayoría.',
                    'Presentar únicamente los datos que apoyan una postura e ignorar el resto.',
                    'Asumir que dos eventos correlacionados tienen relación de causa y efecto.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'El ad hominem desvía el debate hacia la persona (su reputación, intereses o circunstancias) en vez de evaluar la validez del argumento; las demás opciones describen otras falacias (apelación a la mayoría, sesgo de confirmación y cum hoc).',
            },
        ],
        recursos: [
            { titulo: 'Wikipedia - Método científico (fases y debate)', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/M%C3%A9todo_cient%C3%ADfico' },
            { titulo: 'Wikipedia - Pensamiento crítico', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Pensamiento_cr%C3%ADtico' },
            { titulo: 'Wikipedia - Falsabilidad (criterio de demarcación)', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Falsabilidad' },
            { titulo: 'Science - Revista científica de referencia', tipo: 'enlace', enlace: 'https://www.science.org/' },
            { titulo: 'Nature - Investigación y actualidad científica', tipo: 'enlace', enlace: 'https://www.nature.com/' },
            { titulo: 'TED - Charlas de divulgación científica', tipo: 'enlace', enlace: 'https://www.ted.com/' },
            { titulo: 'CuriosaMente - Pensamiento crítico y lógica (canal)', tipo: 'enlace', enlace: 'https://www.youtube.com/@CuriosaMente' },
        ],
    },
    {
        nombre: 'Fundamentos de programacion',
        contenido_lectura:
            'La lógica de programación establece las bases para cualquier ingeniero de sistemas. En este primer semestre, el enfoque se centra en la resolución de problemas mediante el modelado lógico de datos y flujos de ejecución. Herramientas como pseudocódigo y diagramas de flujo permiten comprender las estructuras secuenciales, condicionales y cíclicas sin la complejidad sintáctica de un lenguaje de compilación avanzada. El dominio de este bloque garantiza que el estudiante comprenda el comportamiento de la memoria y la evaluación de expresiones booleanas antes de abordar lenguajes fuertemente tipados como Java en la universidad.',
        video_url: 'https://www.youtube.com/watch?v=c2sodUDMxDs',
        tiempo_minimo_segundos: 120,
        preguntas: [
            {
                pregunta: '¿Cuál es la principal característica operativa de una estructura condicional múltiple (como el comando Según / Switch)?',
                opciones: [
                    'Ejecutar un bloque de instrucciones de manera repetitiva hasta que una condición externa cambie a verdadero.',
                    'Evaluar una única variable contra múltiples valores posibles para bifurcar el flujo de ejecución hacia caminos específicos de manera limpia.',
                    'Declarar variables estáticas en tiempo de compilación para optimizar el uso de memoria RAM.',
                    'Ordenar de forma descendente un conjunto de registros numéricos.',
                ],
                respuesta_correcta: 1,
                explicacion:
                    'El comando Según/Switch compara una expresión contra varios valores posibles y ejecuta únicamente el bloque asociado al valor coincidente, evitando encadenamientos extensos de condicionales simples.',
            },
            {
                pregunta: '¿Qué diferencia fundamental existe entre un bucle con contador (Para / For) y un bucle condicional (Mientras / While)?',
                opciones: [
                    'El bucle con contador se utiliza exclusivamente en bases de datos relacionales, mientras que el condicional se usa en interfaces gráficas.',
                    'El bucle con contador conoce de antemano el número exacto de iteraciones a realizar, mientras que el bucle condicional se ejecuta de forma indefinida hasta que una condición lógica se invalida.',
                    'El bucle condicional no permite anidamiento bajo ninguna circunstancia lógica.',
                    'El bucle con contador requiere obligatoriamente el uso de arreglos multidimensionales.',
                ],
                respuesta_correcta: 1,
                explicacion:
                    'El Para/For recorre un rango conocido de iteraciones; el Mientras/While evalúa una condición en cada vuelta y puede repetirse un número no determinado de veces, lo que lo hace útil cuando el fin del ciclo depende de un estado en ejecución.',
            },
        ],
        reto: {
            enunciado:
                'Implementa una función que clasifique una nota numérica según la escala CUL: menor a 4.0 → "Básico"; de 4.0 a 4.4 (inclusive) → "Suficiente"; 4.5 o más → "Alto". Usa una estructura condicional y devuelve exactamente uno de esos tres textos.',
            plantilla:
                '// Escala CUL:\n' +
                '//   menor a 4.0      -> "Básico"\n' +
                '//   de 4.0 a 4.4     -> "Suficiente"\n' +
                '//   4.5 o más        -> "Alto"\n' +
                'function clasificarNota(nota) {\n' +
                '  // escribe aquí tu lógica condicional\n' +
                '}\n',
            nombre_funcion: 'clasificarNota',
            casos: [
                { entrada: [3.7], esperado: 'Básico' },
                { entrada: [4.2], esperado: 'Suficiente' },
                { entrada: [4.9], esperado: 'Alto' },
                { entrada: [4.5], esperado: 'Alto' },
            ],
        },
        recursos: [
            { titulo: 'karan/Projects - Colección de proyectos de programación para principiantes', tipo: 'repositorio', enlace: 'https://github.com/karan/Projects' },
            { titulo: 'TheAlgorithms/Java - Algoritmos y estructuras implementados en Java', tipo: 'repositorio', enlace: 'https://github.com/TheAlgorithms/Java' },
            { titulo: 'TheAlgorithms/Python - Algoritmos y estructuras en Python', tipo: 'repositorio', enlace: 'https://github.com/TheAlgorithms/Python' },
            { titulo: 'PseInt - Documentación y manual de uso del intérprete de pseudocódigo', tipo: 'documento', enlace: 'https://pseint.sourceforge.net/' },
            { titulo: 'freeCodeCamp Español - Fundamentos de programación', tipo: 'enlace', enlace: 'https://www.freecodecamp.org/espanol/' },
            { titulo: 'OpenWebinars - Curso de Introducción a la Programación', tipo: 'enlace', enlace: 'https://openwebinars.net/cursos/fundamentos-programacion/' },
            { titulo: 'MDN Web Docs - Guía de lógica y conceptos de código', tipo: 'documento', enlace: 'https://developer.mozilla.org/es/docs/Learn/Getting_started_with_the_web/JavaScript_basics' },
            { titulo: 'LeetCode - Sección de problemas fáciles de introducción', tipo: 'enlace', enlace: 'https://leetcode.com/' },
            { titulo: 'HackerRank - Domains de práctica algorítmica', tipo: 'enlace', enlace: 'https://www.hackerrank.com/domains' },
        ],
    },
    {
        nombre: 'Introduccion a la ingenieria',
        contenido_lectura:
            'La ingeniería es la profesión que aplica el conocimiento científico y matemático para resolver problemas prácticos diseñando sistemas, procesos y productos bajo restricciones de costo, tiempo, calidad y seguridad. La ingeniería de sistemas, en particular, se distingue por su enfoque interdisciplinario: no optimiza componentes aislados, sino el comportamiento del todo, considerando las interdependencias entre personas, procesos, tecnología y contexto. El pensamiento sistémico se apoya en conceptos como frontera del sistema, entradas y salidas, retroalimentación (feedback) y equilibrio, y en metodologías que estructuran el ciclo de vida del proyecto: definición de requisitos, diseño, implementación, verificación y mantenimiento. A lo anterior se suma el marco profesional: estándares de calidad (como los de la ISO), gestión de proyectos, documentación técnica y una ética de responsabilidad social que obliga a ponderar el impacto humano de cada decisión técnica. Esta asignatura contextualiza el pensum: cada materia posterior —programación, redes, bases de datos, software— será una herramienta al servicio de un propósito mayor: construir sistemas que funcionen en el mundo real.',
        video_url: 'https://www.youtube.com/watch?v=i3mhdoptGKk',
        tiempo_minimo_segundos: 150,
        preguntas: [
            {
                pregunta: '¿Qué distingue el enfoque de la ingeniería de sistemas?',
                opciones: [
                    'Aborda problemas complejos considerando el sistema completo y sus interdependencias, integrando múltiples disciplinas.',
                    'Se enfoca exclusivamente en el hardware de las computadoras.',
                    'Estudia únicamente los algoritmos de programación sin contexto organizacional.',
                    'Aplica únicamente métodos empíricos sin apoyo matemático.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La ingeniería de sistemas es interdisciplinaria y sistémica: analiza el todo y las relaciones entre sus partes (personas, procesos y tecnología) antes de optimizar componentes aislados.',
            },
            {
                pregunta: 'En el pensamiento sistémico, ¿qué es la retroalimentación (feedback)?',
                opciones: [
                    'El proceso por el cual una salida del sistema reingresa como entrada y modifica su comportamiento posterior.',
                    'La opinión que los usuarios emiten al final de un proyecto.',
                    'Un informe de auditoría sobre los costos del sistema.',
                    'La lista de requisitos iniciales del proyecto.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La retroalimentación es un bucle causal: los efectos del sistema vuelven a influir en sus causas, generando estabilización (feedback negativo) o amplificación (feedback positivo).',
            },
        ],
        recursos: [
            { titulo: 'INCOSE - Sociedad Internacional de Ingeniería de Sistemas', tipo: 'enlace', enlace: 'https://www.incose.org/' },
            { titulo: 'ASQ - Calidad y estándares de ingeniería', tipo: 'enlace', enlace: 'https://www.asq.org/' },
            { titulo: 'IIASA - Investigación en ciencias de sistemas (Viena)', tipo: 'enlace', enlace: 'https://www.iiasa.ac.at/' },
            { titulo: 'ISO - Estándares internacionales de calidad', tipo: 'enlace', enlace: 'https://www.iso.org/' },
            { titulo: 'PMI - Marco de gestión de proyectos (PMBOK)', tipo: 'enlace', enlace: 'https://www.pmi.org/' },
            { titulo: 'Wikipedia - Ingeniería de sistemas', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Ingenier%C3%ADa_de_sistemas' },
            { titulo: 'Wikipedia - Teoría de sistemas', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Teor%C3%ADa_de_sistemas' },
        ],
    },
    {
        nombre: 'Sociedad y tecnologia',
        contenido_lectura:
            'La tecnología y la sociedad se transforman mutuamente: cada avance técnico reorganiza hábitos, economías y relaciones de poder, y cada necesidad social abre una ruta de innovación. La revolución industrial ilustró el patrón —la máquina de vapor no solo produjo telas, sino fábricas, ciudades y nuevas clases sociales— y la revolución digital lo aceleró: la computación, internet y la telefonía móvil alteraron la comunicación, el trabajo, la educación y hasta la política. Este entrelazamiento tiene doble filo. Por un lado, la tecnología amplía capacidades: acceso al conocimiento, salud a distancia, automatización de tareas peligrosas. Por otro, produce riesgos que el ingeniero no puede ignorar: la brecha digital —la desigualdad en el acceso y uso efectivo de las tecnologías de la información— excluye a millones; la sobreexposición de datos compromete la privacidad; la automatización desplaza empleos y la huella ambiental de la infraestructura digital crece. Frente a esto, la ética tecnológica y la regulación (marcos de protección de datos, diseño inclusivo, computación responsable) se vuelven parte del diseño, no un añadido. El profesional que ignore el contexto social de su obra construirá sistemas técnicamente correctos y socialmente fracasados.',
        video_url: 'https://www.youtube.com/watch?v=AU_m-7dDVR8',
        tiempo_minimo_segundos: 150,
        preguntas: [
            {
                pregunta: '¿Qué describe el concepto de brecha digital?',
                opciones: [
                    'La desigualdad en el acceso y el uso efectivo de las tecnologías de la información entre distintos grupos, territorios o generaciones.',
                    'La distancia física entre los centros de cómputo y los usuarios finales.',
                    'El retraso técnico entre dos versiones de un mismo software.',
                    'El diferencial de costo entre equipos de marca y equipos genéricos.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La brecha digital es una desigualdad socio-técnica: incluye acceso a dispositivos y conectividad, pero también habilidades digitales y uso productivo de la tecnología.',
            },
            {
                pregunta: '¿Cómo se entiende mejor la relación entre sociedad y tecnología?',
                opciones: [
                    'Como un proceso de co-evolución: la tecnología transforma la sociedad y las necesidades sociales orientan el desarrollo tecnológico.',
                    'Como una relación unidireccional donde la tecnología determina por completo la cultura.',
                    'Como dos ámbitos independientes que no se influyen entre sí.',
                    'Como un proceso exclusivamente económico ajeno a la política o la ética.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'El enfoque contemporáneo (estudios STS) supera el determinismo tecnológico y el instrumentalismo: sociedad y tecnología se codeterminan en ciclos de influencia mutua.',
            },
        ],
        recursos: [
            { titulo: 'Wikipedia - Impacto tecnológico', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Impacto_tecnol%C3%B3gico' },
            { titulo: 'Wikipedia - Brecha digital', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Brecha_digital' },
            { titulo: 'Wikipedia - Revolución digital', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Revoluci%C3%B3n_digital' },
            { titulo: 'Wikipedia - Tecnologías de la información y la comunicación', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Tecnolog%C3%ADa_de_la_informaci%C3%B3n_y_la_comunicaci%C3%B3n' },
            { titulo: 'OCDE - Estudios de sociedad y tecnología', tipo: 'enlace', enlace: 'https://www.oecd.org/' },
            { titulo: 'World Economic Forum - Agenda tecnológica global', tipo: 'enlace', enlace: 'https://www.weforum.org/' },
            { titulo: 'TEDx Talks - Charlas sobre tecnología y sociedad', tipo: 'enlace', enlace: 'https://www.youtube.com/@TEDxTalks' },
        ],
    },
];
