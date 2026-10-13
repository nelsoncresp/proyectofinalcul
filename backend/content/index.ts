import type { ContenidoAsignatura } from './tipos';
import { semestre01 } from './semestre-01';
import { semestre02 } from './semestre-02';
import { semestre03 } from './semestre-03';
import { semestre04 } from './semestre-04';
import { semestre05 } from './semestre-05';
import { semestre06 } from './semestre-06';
import { semestre07 } from './semestre-07';
import { semestre08 } from './semestre-08';
import { semestre09 } from './semestre-09';
import { semestre10 } from './semestre-10';

/** Contenido curado agrupado por semestre del pensum real CUL (59 materias). */
export const contenidoPorSemestre: Record<number, ContenidoAsignatura[]> = {
    1: semestre01,
    2: semestre02,
    3: semestre03,
    4: semestre04,
    5: semestre05,
    6: semestre06,
    7: semestre07,
    8: semestre08,
    9: semestre09,
    10: semestre10,
};
