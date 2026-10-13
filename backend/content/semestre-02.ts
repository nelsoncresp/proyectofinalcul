import type { ContenidoAsignatura } from './tipos';

/**
 * Semestre 2 del pensum real CUL (6 materias).
 * Nombres exactos de `asignaturas` (minúsculas, sin acentos).
 */
export const semestre02: ContenidoAsignatura[] = [
    {
        nombre: 'Constitucion politica',
        contenido_lectura:
            'La Constitución Política es la norma suprema del ordenamiento jurídico: toda ley, acto de autoridad y decisión administrativa deben acomodarse a ella so pena de inconstitucionalidad. En Colombia, la Constitución de 1991 adoptó el modelo de Estado social de derecho: el poder público no solo garantiza libertades, sino que asume deberes positivos en salud, educación, trabajo y seguridad social. La Carta estructura el Estado en tres ramas —legislativa (Congreso, que legisla y controla), ejecutiva (Presidencia y ministros, que administra) y judicial (corte y jueces, que administran justicia)—, además de órganos de control y entes de planeación y vigilancia. Los derechos fundamentales (vida, dignidad, igualdad, libertad de cultos, debido proceso) son exigibles directamente ante los jueces mediante la acción de tutela, mientras los derechos económicos, sociales y culturales progresan según la capacidad del Estado. El control de constitucionalidad lo ejerce la Corte Constitucional mediante la revisión de acciones de tutela y las demandas de nulidad. Comprender este marco es esencial para el profesional: toda solución tecnológica —bases de datos personales, sistemas de vigilancia, plataformas educativas— opera dentro de este límite legal.',
        video_url: 'https://www.youtube.com/watch?v=KFoyA8Z8VYc',
        tiempo_minimo_segundos: 160,
        preguntas: [
            {
                pregunta: '¿En qué consiste el Estado social de derecho adoptado por la Constitución de 1991?',
                opciones: [
                    'En que el Estado no solo garantiza libertades, sino que asume deberes positivos para lograr la efectividad de los derechos sociales.',
                    'En que el poder judicial administra directamente los servicios públicos.',
                    'En que la Constitución puede suspenderse durante emergencias económicas.',
                    'En que las leyes prevalecen sobre la Constitución cuando el Congreso lo decide.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'El Estado social de derecho combina el sometimiento del poder a la ley (Estado de derecho) con la obligación del Estado de intervenir activamente para hacer efectivos los derechos económicos, sociales y culturales.',
            },
            {
                pregunta: '¿Cuál es la principal característica de la acción de tutela en el ordenamiento colombiano?',
                opciones: [
                    'Es una acción mediante la cual cualquier persona puede reclamar directamente ante el juez la protección inmediata de sus derechos fundamentales.',
                    'Es un recurso jerárquico que se interpone únicamente ante la Corte Suprema.',
                    'Solo procede cuando el afectado es una entidad pública.',
                    'Es una acción penal contra los servidores públicos.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La tutela es la vía ordinaria y preferente para la defensa de los derechos fundamentales: es informal, rápida y cualquier persona puede interponerla sin abogado ante el juez competente.',
            },
        ],
        recursos: [
            { titulo: 'Corte Constitucional de Colombia - Sentencias y doctrina', tipo: 'enlace', enlace: 'https://www.corteconstitucional.gov.co/' },
            { titulo: 'Senado de la República - Texto de la Constitución', tipo: 'enlace', enlace: 'https://www.senado.gov.co/' },
            { titulo: 'Cámara de Representantes - Trabajo legislativo', tipo: 'enlace', enlace: 'https://www.camara.gov.co/' },
            { titulo: 'Wikipedia - Constitución de Colombia (1991)', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Constituci%C3%B3n_de_Colombia' },
            { titulo: 'Wikipedia - Estado social de derecho', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Estado_social_de_derecho' },
            { titulo: 'Wikipedia - Derechos fundamentales', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Derechos_fundamentales' },
            { titulo: 'Wikipedia - Constitucionalismo y control de constitucionalidad', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Constitucionalismo' },
        ],
    },
    {
        nombre: 'Fisica calor',
        contenido_lectura:
            'La física del calor (termodinámica clásica) estudia la energía en su forma térmica y sus transformaciones. La temperatura mide la energía cinética media de las moléculas de un sistema, mientras que el calor es energía en tránsito que se transfiere entre cuerpos con diferente temperatura; la cantidad de calor necesaria para variar la temperatura de una masa se expresa mediante la capacidad calorífica (Q = m·c·ΔT). La transferencia térmica ocurre por tres mecanismos: conducción (contacto directo, cuantificada por la ley de Fourier), convección (movimiento de fluidos) y radiación (emisión de ondas electromagnéticas, descrita por la ley de Stefan-Boltzmann). Sobre esta base se formulan las leyes de la termodinámica: la ley cero define el equilibrio térmico y la temperatura; la primera ley establece la conservación de la energía (ΔU = Q − W); la segunda introduce la entropía y direccióna los procesos espontáneos; la tercera fija el cero absoluto como límite inalcanzable. Estos principios gobiernan motores, refrigeradores, centrales eléctricas y disipadores de equipos electrónicos: cualquier ingeniero que diseñe sistemas físicos debe comprenderlos.',
        video_url: 'https://www.youtube.com/watch?v=kpCve_D_BrU',
        tiempo_minimo_segundos: 160,
        preguntas: [
            {
                pregunta: '¿Cuál es la diferencia entre temperatura y calor?',
                opciones: [
                    'La temperatura mide la energía cinética media de las moléculas; el calor es energía térmica en tránsito entre cuerpos a distinta temperatura.',
                    'La temperatura es una energía y el calor es una temperatura acumulada.',
                    'Ambos conceptos describen la misma magnitud con unidades distintas.',
                    'El calor mide el volumen de un gas y la temperatura su presión.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'Temperatura y calor no son la misma magnitud: la temperatura es una propiedad de estado del sistema, mientras que el calor es energía que se transfiere (un proceso), no una propiedad del cuerpo.',
            },
            {
                pregunta: 'Según la segunda ley de la termodinámica, en un proceso espontáneo la entropía del universo:',
                opciones: [
                    'Aumenta siempre.',
                    'Disminuye siempre.',
                    'Se mantiene constante.',
                    'Puede aumentar o disminuir indistintamente.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La segunda ley afirma que la entropía total (sistema + entorno) crece en todo proceso espontáneo; solo puede mantenerse en procesos reversibles ideales, nunca disminuir.',
            },
        ],
        recursos: [
            { titulo: 'Khan Academy - Termodinámica (física)', tipo: 'enlace', enlace: 'https://es.khanacademy.org/science/physics/thermodynamics' },
            { titulo: 'HyperPhysics - Heat and thermodynamics', tipo: 'documento', enlace: 'https://hyperphysics.phy-astr.gsu.edu/' },
            { titulo: 'PhET Colorado - Simulaciones de calor y gases', tipo: 'enlace', enlace: 'https://phet.colorado.edu/' },
            { titulo: 'NASA Glenn Research Center - Thermodynamics', tipo: 'documento', enlace: 'https://www.grc.nasa.gov/' },
            { titulo: 'Wikipedia - Leyes de la termodinámica', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Leyes_de_la_termodin%C3%A1mica' },
            { titulo: 'Wikipedia - Calor (transferencia de energía térmica)', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Calor' },
            { titulo: 'Wikipedia - Entropía', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Entrop%C3%ADa' },
        ],
    },
    {
        nombre: 'Laboratorio de programacion II',
        contenido_lectura:
            'Este laboratorio consolida mediante práctica lo aprendido en Programación, con Java como lenguaje de referencia. Cada sesión se estructura como un ciclo de trabajo de ingeniería: se plantea un problema, se diseña la solución en pseudocódigo, se implementa, se depura y se documenta. Los ejercicios progresan desde el manejo de arreglos unidimensionales y matrices —recorridos, búsquedas, ordenamientos burbuja e inserción— hasta la modularización: se exige dividir la solución en métodos con parámetros bien definidos, retornos tipados y alcances controlados, evitando variables globales. Se practica el paso por valor de datos y por qué una función no debe alterar el estado del programa salvo que lo declare. Introductorio también es el trabajo con cadenas de caracteres y la lectura validada de datos, que anticipa los problemas de entrada real. El laboratorio instala hábitos que diferencian a un programador de un ingeniero: nombrar con intención, comentar lo que no es obvio, escribir casos de prueba antes del código y revisar la complejidad de cada solución.',
        video_url: 'https://www.youtube.com/watch?v=qxXcI56NfnE',
        tiempo_minimo_segundos: 150,
        preguntas: [
            {
                pregunta: 'Al declarar un vector de enteros en Java con int[] notas = new int[10];, ¿cuál es el índice de la última posición accesible?',
                opciones: ['9', '10', '11', '0'],
                respuesta_correcta: 0,
                explicacion:
                    'Los arreglos en Java se indexan desde 0: un arreglo de 10 posiciones va del índice 0 al 9; usar el índice 10 produce ArrayIndexOutOfBoundsException.',
            },
            {
                pregunta: '¿Por qué conviene escribir casos de prueba antes de implementar una solución en el laboratorio?',
                opciones: [
                    'Porque fijan el comportamiento esperado y permiten detectar errores de inmediato, además de documentar el objetivo del método.',
                    'Porque Java exige pruebas unitarias para compilar el código.',
                    'Porque reemplazan la necesidad de leer la documentación del lenguaje.',
                    'Porque eliminan la posibilidad de errores lógicos por completo.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'Los casos de prueba definen el contrato del método: ejecutarlos tras cada cambio detecta regresiones al instante y comunica la intención del código a quien lo lea después.',
            },
        ],
        reto: {
            enunciado:
                'Implementa el algoritmo de ordenamiento burbuja sobre una lista de notas: recorre la lista comparando pares vecinos e intercámbialos hasta que quede ordenada de menor a mayor. Devuelve el mismo arreglo ordenado.',
            plantilla:
                '// Ordena de menor a mayor con el algoritmo burbuja.\n' +
                '// Devuelve el arreglo ya ordenado.\n' +
                'function ordenarNotas(notas) {\n' +
                '  // implementa burbuja: compara pares vecinos e intercambia\n' +
                '  return notas;\n' +
                '}\n',
            nombre_funcion: 'ordenarNotas',
            casos: [
                { entrada: [[5, 1, 4]], esperado: [1, 4, 5] },
                { entrada: [[9, 3, 7, 1]], esperado: [1, 3, 7, 9] },
                { entrada: [[2, 2, 1]], esperado: [1, 2, 2] },
                { entrada: [[8, 3, 5, 1, 9, 4, 2, 7, 6]], esperado: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
            ],
        },
        recursos: [
            { titulo: 'geekific/programming-algorithms - Algoritmos explicados visualmente', tipo: 'repositorio', enlace: 'https://github.com/geekific/programming-algorithms' },
            { titulo: 'donnemartin/interactive-coding-challenges - Retos con pruebas unitarias', tipo: 'repositorio', enlace: 'https://github.com/donnemartin/interactive-coding-challenges' },
            { titulo: 'TheAlgorithms/JavaScript - Algoritmos base en JavaScript', tipo: 'repositorio', enlace: 'https://github.com/TheAlgorithms/JavaScript' },
            { titulo: 'Exercism - Pistas de práctica en múltiples lenguajes', tipo: 'enlace', enlace: 'https://exercism.org/' },
            { titulo: 'W3Schools - Java (referencia rápida)', tipo: 'documento', enlace: 'https://www.w3schools.com/java/' },
            { titulo: 'GeeksforGeeks - Array Data Structure', tipo: 'documento', enlace: 'https://www.geeksforgeeks.org/array-data-structure/' },
            { titulo: 'Oracle - The Java Tutorials (tutorial oficial)', tipo: 'documento', enlace: 'https://docs.oracle.com/javase/tutorial/' },
            { titulo: 'Programiz - Java Arrays con ejemplos', tipo: 'documento', enlace: 'https://www.programiz.com/java-programming/arrays' },
        ],
    },
    {
        nombre: 'Calculo diferencial',
        contenido_lectura:
            'El cálculo diferencial estudia cómo cambian las magnitudes. El concepto puerta de entrada es el límite: formaliza el comportamiento de una función cuando la variable se aproxima a un valor, permitiendo definir continuidad y resolver indeterminaciones con teoremas como L\'Hôpital. Sobre el límite se construye la derivada, definida como el cociente incremental en el límite cuando h tiende a cero; geométricamente es la pendiente de la recta tangente y físicamente la tasa de cambio instantánea. El estudiante domina las reglas de derivación (potencia, producto, cociente, cadena), las derivadas de funciones trigonométricas, exponenciales y logarítmicas, y aplica el teorema de Rolle y del valor medio para razonar sobre el comportamiento de las funciones. Las aplicaciones son el corazón de la asignatura: optimización (máximos y mínimos relativos), tasas relacionadas, análisis de crecimiento con la diferencial dy = f\'(x)·dx y graficado de funciones mediante primer y segunda derivada. Este instrumental es indispensable para física, economía, estimación numérica y cualquier modelo de ingeniería que describa variación.',
        video_url: 'https://www.youtube.com/watch?v=ZSYQ13iMbYA',
        tiempo_minimo_segundos: 160,
        preguntas: [
            {
                pregunta: 'La derivada de una función en un punto representa geométricamente:',
                opciones: [
                    'La pendiente de la recta tangente a la gráfica en ese punto.',
                    'El área bajo la curva hasta ese punto.',
                    'La asíntota horizontal de la función.',
                    'La segunda aproximación polinómica de la función.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    "f'(x) mide la pendiente de la tangente y, en general, la tasa de cambio instantánea de f respecto de x; el área corresponde al cálculo integral.",
            },
            {
                pregunta: '¿Cuál es el primer paso recomendado para resolver un límite con forma de indeterminación 0/0?',
                opciones: [
                    'Simplificar la expresión factorizando o racionalizando, o aplicar el teorema de L\'Hôpital si las condiciones se cumplen.',
                    'Afirmar que el límite no existe y terminar el ejercicio.',
                    'Reemplazar la variable por un número grande para aproximar.',
                    'Elevar la expresión al cuadrado para eliminar la indeterminación.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'La indeterminación 0/0 indica cancelaciones pendientes: se resuelve factorizando o racionalizando; si el límite sigue indeterminado y se cumplen las hipótesis, se aplica L\'Hôpital derivando numerador y denominador.',
            },
        ],
        recursos: [
            { titulo: 'Khan Academy - Cálculo diferencial', tipo: 'enlace', enlace: 'https://es.khanacademy.org/math/differential-calculus' },
            { titulo: "Paul's Online Math Notes - Calculus I", tipo: 'documento', enlace: 'https://tutorial.math.lamar.edu/classes/calculi/calculi.aspx' },
            { titulo: 'MIT OpenCourseWare 18.01SC - Single Variable Calculus', tipo: 'documento', enlace: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/' },
            { titulo: 'MathWorld - Derivative (referencia formal)', tipo: 'documento', enlace: 'https://mathworld.wolfram.com/Derivative.html' },
            { titulo: '3Blue1Brown - Cálculo (visualización)', tipo: 'enlace', enlace: 'https://www.3blue1brown.com/' },
            { titulo: 'GeoGebra - Graficador de funciones y tangentes', tipo: 'enlace', enlace: 'https://www.geogebra.org/' },
            { titulo: 'Wikipedia - Derivada', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Derivada' },
        ],
    },
    {
        nombre: 'Algebra lineal',
        contenido_lectura:
            'El álgebra lineal aporta el lenguaje de la mayoría de los modelos de ingeniería. Comienza con los vectores: operaciones, combinaciones lineales, independencia y bases de un espacio vectorial, cuyo concepto de dimensión generaliza el plano y el espacio tridimensional. Las matrices representan transformaciones lineales y sistemas de ecuaciones: se estudían suma, producto, transpuesta e inversa, junto con los métodos de resolución de sistemas —eliminación de Gauss-Jordan, regla de Cramer y factorización—, así como el rango como medida de la información contenida en un sistema. Los determinantes cuantifican el factor de escala de una transformación y permiten decidir invertibilidad. El bloque cierra con autovalores y autovectores: los elementos que no cambian de dirección bajo una transformación, con aplicaciones directas en análisis de estabilidad, procesamiento de imágenes y grafos. Más allá de la técnica, la asignatura enseña a abstraer: cada problema de ingeniería con múltiples variables puede escribirse como un sistema lineal Ax = b, y el álgebra lineal entrega las herramientas para saber cuándo tiene solución y cómo encontrarla.',
        video_url: 'https://www.youtube.com/watch?v=BMBZJwTS7Ks',
        tiempo_minimo_segundos: 160,
        preguntas: [
            {
                pregunta: '¿Qué condición garantiza que un sistema de ecuaciones lineales Ax = b tenga solución única?',
                opciones: [
                    'Que la matriz A sea cuadrada y su determinante sea distinto de cero (A invertible).',
                    'Que la matriz A tenga todos los elementos positivos.',
                    'Que el vector b sea nulo.',
                    'Que A tenga más filas que columnas.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'det(A) ≠ 0 equivale a que las columnas de A sean linealmente independientes (rango completo), lo que garantiza existencia y unicidad de la solución.',
            },
            {
                pregunta: 'Un autovector de una matriz A es aquel que:',
                opciones: [
                    'Al aplicar la transformación A, conserva su dirección y solo cambia por un escalar (su autovalor).',
                    'Es ortogonal a todas las columnas de A.',
                    'Tiene norma igual a uno.',
                    'Hace que A se vuelva singular.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'Por definición, Av = λv: el autovector v no cambia de dirección bajo la transformación A; solo se escala por el autovalor λ.',
            },
        ],
        recursos: [
            { titulo: 'Khan Academy - Álgebra lineal', tipo: 'enlace', enlace: 'https://es.khanacademy.org/math/linear-algebra' },
            { titulo: 'MIT OpenCourseWare 18.06SC - Linear Algebra', tipo: 'documento', enlace: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
            { titulo: 'Álgebra Para Todos - Canal de ejercicios resueltos', tipo: 'enlace', enlace: 'https://www.youtube.com/c/algebraparatodos' },
            { titulo: 'matrixmultiplication.xyz - Visualización interactiva de productos matriciales', tipo: 'enlace', enlace: 'https://matrixmultiplication.xyz/' },
            { titulo: 'Desmos - Graficador con álgebra de matrices', tipo: 'enlace', enlace: 'https://www.desmos.com/' },
            { titulo: 'Wikipedia - Álgebra lineal', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/%C3%81lgebra_lineal' },
            { titulo: 'Wikipedia - Valor propio y autovector', tipo: 'documento', enlace: 'https://es.wikipedia.org/wiki/Valor_propio_y_autovector' },
        ],
    },
    {
        nombre: 'Programacion',
        contenido_lectura:
            'En esta etapa se traslada la lógica abstracta a un lenguaje formal, con Java como pilar institucional y soporte para Python o JavaScript en la plataforma. La modularización introduce el concepto de funciones y procedimientos para dividir problemas complejos en partes más pequeñas y mantenibles. Asimismo, se estudian los vectores (arreglos unidimensionales) y las matrices (arreglos bidimensionales), permitiendo el almacenamiento estructurado de colecciones de datos homogéneos bajo índices de memoria continuos.',
        video_url: 'https://www.youtube.com/watch?v=JOAqpdM36wI',
        tiempo_minimo_segundos: 120,
        preguntas: [
            {
                pregunta: 'Al declarar un vector de enteros en Java mediante int[] notas = new int[10];, ¿cuál es el índice válido correspondiente a la última posición accesible del arreglo?',
                opciones: ['Índice 10', 'Índice 9', 'Índice 11', 'Índice 0'],
                respuesta_correcta: 1,
                explicacion:
                    'Java indexa los arreglos desde 0: un arreglo de 10 posiciones ocupa los índices 0 a 9; el índice 10 queda fuera del rango y lanza una excepción.',
            },
            {
                pregunta: '¿Qué mecanismo se emplea para enviar datos hacia una función modularizada asegurando que el valor original de la variable principal no sufra alteraciones accidentales (paso por valor)?',
                opciones: [
                    'Copiar el valor de la variable en el espacio de memoria local del parámetro del método.',
                    'Apuntar directamente a la dirección de memoria física del disco duro.',
                    'Declarar la variable como global estática en todas las clases del sistema.',
                    'Utilizar un apuntador de tipo puntero nulo.',
                ],
                respuesta_correcta: 0,
                explicacion:
                    'En Java los tipos primitivos se pasan por valor: el método recibe una copia local del dato, por lo que sus modificaciones no afectan a la variable original del llamador.',
            },
        ],
        reto: {
            enunciado:
                'Implementa una función que recorra una lista de notas y retorne el valor mayor. Recorre el arreglo con un bucle y compara elemento por elemento; no uses Math.max.',
            plantilla:
                '// Retorna el valor mayor de la lista de notas.\n' +
                '// Recorre el arreglo con un bucle; no uses Math.max.\n' +
                'function mayorValor(notas) {\n' +
                '  // escribe aquí tu recorrido\n' +
                '}\n',
            nombre_funcion: 'mayorValor',
            casos: [
                { entrada: [[3, 8, 2]], esperado: 8 },
                { entrada: [[-5, -1, -9]], esperado: -1 },
                { entrada: [[7]], esperado: 7 },
                { entrada: [[12, 4, 120, 1]], esperado: 120 },
            ],
        },
        recursos: [
            { titulo: 'MoureDev hello-java - Repositorio del curso de Java', tipo: 'repositorio', enlace: 'https://github.com/mouredev/hello-java' },
            { titulo: 'Oracle Java Documentation - Language Basics', tipo: 'documento', enlace: 'https://docs.oracle.com/en/java/' },
            { titulo: 'Python Software Foundation - Tutorial oficial (funciones y listas)', tipo: 'documento', enlace: 'https://docs.python.org/3/tutorial/' },
            { titulo: 'TheAlgorithms/Java - Algoritmos y estructuras en Java', tipo: 'repositorio', enlace: 'https://github.com/TheAlgorithms/Java' },
            { titulo: 'Codecademy - Ruta de Java', tipo: 'enlace', enlace: 'https://www.codecademy.com/' },
            { titulo: 'Programiz - Java Arrays Tutorial con ejemplos', tipo: 'documento', enlace: 'https://www.programiz.com/java-programming/arrays' },
            { titulo: 'LeetCode - Sección de problemas fáciles', tipo: 'enlace', enlace: 'https://leetcode.com/' },
            { titulo: 'Exercism - Ejercicios guiados de programación', tipo: 'enlace', enlace: 'https://exercism.org/' },
        ],
    },
];
