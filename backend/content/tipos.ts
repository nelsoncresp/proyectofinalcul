/**
 * Tipos del contenido curado por materia.
 *
 * La clave de cada entrada es `nombre`: debe coincidir EXACTAMENTE con el
 * nombre en la tabla `asignaturas` (minúsculas y sin acentos, p. ej.
 * "Comunicacion oral y escrita"). El loader lo resuelve a `asignatura_id`
 * y falla con reporte si el nombre no existe.
 */

export interface ContenidoRecurso {
    titulo: string;
    tipo: 'repositorio' | 'documento' | 'enlace';
    enlace: string;
}

export interface ContenidoPregunta {
    pregunta: string;
    /** Exactamente 4 opciones; `respuesta_correcta` es el índice 0-3. */
    opciones: [string, string, string, string];
    respuesta_correcta: number;
    explicacion: string;
}

/** Reto de código práctico: se verifica en el navegador contra `casos`. */
export interface ContenidoReto {
    enunciado: string;
    /** Código inicial que se carga en el editor (define la firma de la función). */
    plantilla: string;
    /** Nombre de la función que el estudiante debe implementar. */
    nombre_funcion: string;
    /** Cada caso invoca la función con `entrada` (array de argumentos) y compara contra `esperado`. */
    casos: { entrada: unknown[]; esperado: unknown }[];
}

export interface ContenidoAsignatura {
    /** Nombre exacto en `asignaturas` (minúsculas, sin acentos). */
    nombre: string;
    /**
     * Párrafo académico en texto plano (sin Markdown: la interfaz renderiza
     * `white-space: pre-line`). Puede incluir saltos de línea para separar
     * el título del párrafo.
     */
    contenido_lectura: string;
    /** URL real verificada de YouTube, o `null` si no hay video confiable. */
    video_url: string | null;
    /** Segundos mínimos de lectura antes de habilitar la confirmación. */
    tiempo_minimo_segundos: number;
    /** 2 preguntas por materia (el esquema actual guarda la primera). */
    preguntas: ContenidoPregunta[];
    /** Reto de código práctico (opcional): se ejecuta y verifica en el navegador. */
    reto?: ContenidoReto;
    /** Lista curada de recursos/repositorios (reemplaza la lista previa). */
    recursos: ContenidoRecurso[];
}
