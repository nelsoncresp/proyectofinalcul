# .agents/skills

Este directorio contiene las "skills" instaladas por la herramienta de agentes. Aquí hay un resumen rápido de las skills CSS relevantes y dónde encontrarlas:

- **better-ui**: recomendaciones de pulido UI (rayados concéntricos, alignment óptico, animaciones exactas, scale-on-press, icon transitions, etc.)
  - Ruta: `.agents/skills/better-ui/`
  - Archivos clave: `SKILL.md`, `surfaces.md`, `animations.md`, `icon-transitions.md`, `enter-exit.md`, `performance.md`

- **better-accessibility**: directrices de accesibilidad (focus-visible, hit areas, keyboard support, reduced-motion, aria, etc.)
  - Ruta: `.agents/skills/better-accessibility/`
  - Archivos clave: `SKILL.md`, `focus-and-keyboard.md`, `hit-areas.md`, `forms.md`, `screen-readers.md`, `motion-and-zoom.md`

- **angular-developer**: guía para prácticas Angular (referencias de routing, reactivity, forms, DI, etc.)
  - Ruta: `.agents/skills/angular-developer/`
  - Archivos clave: `SKILL.md`, `references/`

Uso sugerido:
- Revisa `SKILL.md` en cada carpeta para entender las reglas concretas.
- Muchas reglas especifican valores exactos (duraciones, curvaturas, escala). Prefiere usar estos valores cuando apliques estilos en `client/src/styles.css` o en componentes.

He aplicado un conjunto inicial de reglas en `client/src/styles.css` (focus-visible, reduced-motion, press-scale, image outline, hit-area helper, suppress-transitions recipe, icon crossfade CSS, visually-hidden helper). Si quieres que adopte otras recetas concretas (por ejemplo entradas escalonadas, reglas de sombras en `surfaces.md`, o tokens de icon stroke), dime cuál y lo agrego.

Además, añadí un helper TypeScript para suprimir transiciones durante cambios globales de estilo:

- `client/src/app/utils/suppress-transitions.ts`: función `suppressTransitionsOnce()` que agrega la clase `suppress-transitions` al elemento `<html>` y la remueve en los siguientes frames. Útil antes de alternar clases de tema para evitar el cross-fade de toda la página.

Ejemplo de uso:

```ts
import { suppressTransitionsOnce } from 'src/app/utils/suppress-transitions';

function toggleTheme() {
  suppressTransitionsOnce();
  document.documentElement.classList.toggle('dark-mode');
}
```
