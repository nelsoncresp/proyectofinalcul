# Rediseño UI/UX — Dashboard de Estudiante (Sequora CUL)

Written against: `2c99476`

## Evidence chain

- Surface: `/dashboard/estudiante` (`client/src/app/views/dashboard-estudiante.view.html`, `client/src/app/styles/dashboard-estudiante.style.css`)
- Problem:
  1. **Dispersión y sobredimensión vertical/horizontal**: Contenedor `.campus-experience` con márgenes y paddings excesivos (`28px 20px 110px`), hero sobredimensionado (`padding: 30px 32px`, avatar de `66px`, anillo SVG de `120px`) que empuja el contenido formativo debajo del scroll inicial.
  2. **Sobrecarga de elementos no funcionales**: Mascota flotante "Byte" (`.mascot`, template `#robotArt`) y widgets decorativos ocupan espacio persistente sin valor en el flujo académico.
  3. **Código muerto y modal huérfano**: En `dashboard-estudiante.view.html` (líneas 701-867) queda el modal antiguo de cursos cuando ya se navega a `/curso/:id`.
  4. **Jerarquía visual diluida en la lista de materias (`learning-path`)**: Riel vertical con líneas gruesas y tarjetas sobredimensionadas que provocan un scroll innecesario.
- Design evidence:
  - Tokens globales institucionales en `client/src/styles.css`: `--bg`, `--surface`, `--fg`, `--fg-strong`, `--muted`, `--line`, `--brand`, `--energy`, `--shadow-1`, `--r-md`, `--r-lg`.
  - Sistema visual sobrio universitario: sin neones, sin degradados decorativos ni efectos glassmorphism.
- Owner: `client/src/app/views/dashboard-estudiante.view.html`, `client/src/app/styles/dashboard-estudiante.style.css`, `client/src/app/controllers/dashboard-estudiante.controller.ts`
- Scope and affected surfaces: Dashboard del estudiante (`/dashboard/estudiante`), vistas tabulares ("Ruta de aprendizaje", "Líneas de formación", "Para ti").
- Uncertainty: Ninguna.

---

## Design decision

Reestructurar el Dashboard de Estudiante hacia un diseño académico sobrio, compacto y de alta densidad funcional:
1. **Compactar el Header/Hero**: Reducir el padding vertical y la escala del avatar/progreso. Convertir el hero en un panel ejecutivo unificado con datos clave (semestre, asignaturas aprobadas, avance global) sin fondos radiales decorativos ni animaciones infinitas de pulso.
2. **Eliminar la mascota "Byte"**: Remover el template `#robotArt`, el bloque flotante `.mascot`, y el estado auxiliar en el controlador (`isMascotOpen`, `mascot`, `toggleMascot`).
3. **Limpiar el modal residual de cursos**: Remover el bloque `@if (cursoSeleccionado; as cSel)` y sus métodos huérfanos asociados en el controlador.
4. **Optimizar la lista y cuadrícula de materias**: Reemplazar el riel vertical estirado por tarjetas compactas y proporcionadas con jerarquía tipográfica limpia.

---

## Reuse

- Tokens de color y elevación: `var(--surface)`, `var(--bg)`, `var(--line)`, `var(--fg)`, `var(--fg-strong)`, `var(--muted)`, `var(--brand)`, `var(--energy)`, `var(--r-md)`, `var(--shadow-1)`.
- Componentes UI: `.btn`, `.btn-primary`, `.btn-outline`, `.chip`, `.state-badge`.
- Exemplar: Cabecera compacta y layout estructurado de `/aula/:id`.

---

## Changes

1. `client/src/app/views/dashboard-estudiante.view.html`:
   - Change: Eliminar `<ng-template #robotArt>` y `<aside class="mascot">`.
   - Change: Eliminar el modal huérfano `@if (cursoSeleccionado; as cSel) { ... }`.
   - Change: Compactar `<header class="campus-hero">` reduciendo avatar a 44px y organizando métricas en línea.
   - Change: Compactar la lista `.learning-path` reduciendo la altura y espaciado de cada materia.
   - Preserve: Filtros de semestre, estados de materias (`Disponible`, `Aprobada`, `Bloqueada`), pestaña "Para ti" y accesibilidad por teclado.
   - Verify: Vista compacta en primer plano; eliminación total de overlays flotantes innecesarios; navegación a `/curso/:id` intacta.

2. `client/src/app/styles/dashboard-estudiante.style.css`:
   - Change: Reducir padding de `.campus-experience` (`16px 20px 48px`), eliminar pseudo-elementos radiales decorativos `::after`.
   - Change: Eliminar estilos de `.robot-art`, `.mascot`, `.mascot-bubble`, animaciones de parpadeo (`dotBreath`, `avatarIn`), y estilos del modal de cursos antiguo.
   - Change: Reajustar `.path-card`, espaciados y tipografía con tokens estándar.
   - Preserve: Compatibilidad completa con modo claro y modo oscuro (`.dark-mode`).

3. `client/src/app/controllers/dashboard-estudiante.controller.ts`:
   - Change: Eliminar propiedades y métodos muertos (`isMascotOpen`, `toggleMascot`, `cursoSeleccionado`, `cursoCatalogoSeleccionado`, `cargandoCursoDetalle`, `moduloSeleccionadoIndex`, `cerrarDetalleCurso`, `cargarDetalleCurso`, `siguienteModuloPendiente`, `seleccionarModuloCurso`, `moduloCursoSeleccionado`, `continuarModuloCurso`, `toggleModulo`, `estaVisto`).
   - Preserve: Rutas del aula (`irAlAula`, `abrirDetalleCurso`), gestión de tabs y soporte técnico.

---

## Scope

- Inherit: Vista de estudiante de la plataforma CUL.
- Verify: Compatibilidad con modo oscuro y responsividad (móvil y escritorio).
- Exclude: Lógica de backend o pantallas `/aula/:id` y `/curso/:id`.

---

## Validation

- Product: El estudiante ve inmediatamente en pantalla su semestre y sus materias listas para cursar, con interfaz limpia y rápida.
- Interface: Navegación entre semestres S1-S10 sin scroll desproporcionado.
- System: Respeto estricto a tokens CSS del sistema; cero glassmorphism ni efectos decorativos innecesarios.
- Repository: Compilación limpia en Angular (`ng build` o `ng serve`).

---

## Stop conditions

- Detener si alguna funcionalidad de navegación a asignaturas o cursos se rompe.
