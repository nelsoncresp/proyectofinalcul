/**
 * Resaltador de sintaxis JS mínimo para el editor del aula.
 * Sin dependencias: un tokenizador de una pasada que emite <span> escapados.
 * Incluye "rainbow brackets": cada nivel de profundidad de (), [] y {}
 * se colorea con un tono distinto para que se vea qué pareja cierra qué.
 */

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

function escapar(texto: string): string {
    return texto.replace(/[&<>]/g, c => ESCAPES[c]);
}

// Cada patrón vive en su propio regex literal (así se puede comentar cada uno);
// el orden de la lista define la prioridad. Todos capturan UN grupo, de modo
// que en el tokenizador los índices van de 1 a 8 en el mismo orden.
const PARTES: RegExp[] = [
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/, // 1 comentario
    /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/, // 2 cadena
    /\b(function|return|if|else|for|while|of|in|let|const|var|new|break|continue|switch|case|default|typeof|class|do|try|catch|finally|throw|delete|instanceof)\b/, // 3 palabra clave
    /\b(true|false|null|undefined|NaN|Infinity)\b/, // 4 literal
    /\b(\d+(?:\.\d+)?)\b/, // 5 número
    /([A-Za-z_$][\w$]*)(?=\s*\()/, // 6 nombre de función
    /([[\](){}])/, // 7 paréntesis y llaves
    /([+\-*/%=<>!&|?:]+)/ // 8 operador
];

const TOKENS = new RegExp(PARTES.map(p => p.source).join('|'), 'g');

const CLASES_PARENTESIS = ['tk-r0', 'tk-r1', 'tk-r2', 'tk-r3', 'tk-r4', 'tk-r5'];

/** Convierte código JS en HTML escapado con clases de resaltado (para innerHTML). */
export function resaltarJs(codigo: string): string {
    TOKENS.lastIndex = 0;
    let salida = '';
    let ultimo = 0;
    let profundidad = 0;
    let match: RegExpExecArray | null;

    while ((match = TOKENS.exec(codigo)) !== null) {
        if (match.index > ultimo) {
            salida += escapar(codigo.slice(ultimo, match.index));
        }
        const texto = match[0];
        let clase: string;
        if (match[1]) clase = 'tk-c';
        else if (match[2]) clase = 'tk-s';
        else if (match[3]) clase = 'tk-k';
        else if (match[4]) clase = 'tk-lit';
        else if (match[5]) clase = 'tk-n';
        else if (match[6]) clase = 'tk-f';
        else if (match[7]) {
            const esApertura = texto === '(' || texto === '[' || texto === '{';
            if (esApertura) {
                clase = CLASES_PARENTESIS[profundidad % CLASES_PARENTESIS.length];
                profundidad += 1;
            } else {
                profundidad = Math.max(0, profundidad - 1);
                clase = CLASES_PARENTESIS[profundidad % CLASES_PARENTESIS.length];
            }
        } else clase = 'tk-o';

        salida += `<span class="${clase}">${escapar(texto)}</span>`;
        ultimo = match.index + texto.length;
    }

    salida += escapar(codigo.slice(ultimo));
    return salida;
}
