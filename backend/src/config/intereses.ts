export const INTERESES_PERMITIDOS: readonly string[] = [
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

export function validarIntereses(valor: unknown): string[] | null {
    if (valor === null || valor === undefined) return null;
    if (!Array.isArray(valor)) return null;

    const valores = [...new Set(valor)];
    if (valores.some(interes =>
        typeof interes !== 'string'
        || !INTERESES_PERMITIDOS.includes(interes)
    )) {
        return null;
    }

    return valores;
}
