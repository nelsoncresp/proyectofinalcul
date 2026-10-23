# Engineering Rules — Angular 17, Node.js, Express, TypeScript y MySQL

## 1. Principios obligatorios

Antes de escribir o modificar código:

1. Inspeccionar la estructura del proyecto, los archivos relacionados, las dependencias y las implementaciones existentes.
2. Comprender cómo fluye la información desde Angular hasta Express y desde Express hasta MySQL.
3. Reutilizar la arquitectura, los servicios, las funciones, los tipos, las consultas y las utilidades existentes cuando sea apropiado.
4. Identificar riesgos de rendimiento, seguridad, integridad de datos y compatibilidad antes de implementar cambios.
5. Realizar la modificación mínima necesaria para resolver el problema.

**Prohibido:**
- Inventar archivos, servicios, capas, abstracciones o dependencias sin necesidad demostrable.
- Duplicar lógica existente o reescribir funcionalidades completas para resolver problemas pequeños.
- cambiar tecnologías, contratos de API, estructuras de tablas o convenciones del proyecto sin justificación.
- Eliminar código, validaciones, restricciones o funcionalidades existentes sin comprobar sus dependencias.
- Afirmar que algo funciona, está optimizado o ha sido probado sin evidencia real.

Cuando falte información esencial, inspeccionar primero el proyecto. Si todavía no es posible determinar la solución correcta, solicitar una aclaración en lugar de inventar requisitos.

## 2. TypeScript y calidad del código

- Mantener el tipado estricto y aprovechar las capacidades del sistema de tipos de TypeScript.
- Evitar `any`, conversiones forzadas, `@ts-ignore` y supresiones de errores sin justificación.
- Definir interfaces, tipos y contratos reutilizables para los datos que atraviesan las distintas capas.
- Evitar funciones excesivamente grandes, parámetros innecesarios, código muerto, variables sin uso y condiciones redundantes.
- No duplicar validaciones, cálculos, transformaciones ni reglas de negocio.
- Centralizar la lógica compartida únicamente cuando exista una necesidad real de reutilización.
- Preferir funciones pequeñas, claras y con responsabilidades bien definidas.
- Evitar abstracciones prematuras, patrones de diseño innecesarios y sobreingeniería.
- Mantener consistentes los nombres, las convenciones y el estilo de código existentes.
- No ocultar errores mediante bloques `catch` vacíos, valores predeterminados engañosos o conversiones silenciosas.
- Evitar dependencias adicionales cuando las herramientas existentes sean suficientes.

## 3. Angular 17: asincronía, RxJS y rendimiento

- Respetar la arquitectura real del frontend. No imponer NgModule, standalone components, MVC u otro patrón sin comprobar la estructura existente.
- Utilizar RxJS y `Observable` para peticiones HTTP, eventos y flujos asíncronos que necesiten composición, cancelación o control de concurrencia.
- Utilizar código síncrono para transformaciones simples y operaciones inmediatas que no dependan de recursos externos.
- No bloquear el hilo principal esperando respuestas HTTP ni utilizar APIs síncronas que congelen la interfaz.
- Evitar convertir observables en promesas o mezclar ambos enfoques sin una razón técnica.
- Evitar suscripciones anidadas y suscripciones manuales innecesarias. Preferir `async` pipe y mecanismos apropiados de gestión del ciclo de vida.
- Utilizar `takeUntilDestroyed` cuando sea compatible con el contexto de inyección y la versión utilizada.
- Elegir correctamente los operadores:
  - `switchMap`: búsquedas y operaciones en las que interesa el resultado más reciente y se puede cancelar el flujo anterior.
  - `concatMap`: operaciones que deben ejecutarse en orden.
  - `mergeMap`: operaciones independientes que admiten concurrencia controlada.
  - `exhaustMap`: ignorar nuevas emisiones mientras una operación está en curso, cuando sea apropiado.
- No utilizar `switchMap` para operaciones de escritura que deban completarse necesariamente sin analizar antes las consecuencias de su cancelación.
- Utilizar `debounceTime` y `distinctUntilChanged` cuando reduzcan peticiones repetidas en búsquedas o formularios reactivos.
- Evitar llamadas HTTP duplicadas, suscripciones que disparen la misma petición varias veces y solicitudes innecesarias desde el ciclo de vida de los componentes.
- No asumir que múltiples suscriptores comparten una petición HTTP. Comprobar si es necesario compartir o almacenar el resultado.
- Utilizar `shareReplay` y caché solo cuando se comprendan su invalidación, duración y comportamiento ante errores.
- Gestionar los errores con `catchError` sin ocultar fallos ni presentar resultados falsamente exitosos.
- Evitar cálculos costosos en plantillas y renderizados innecesarios.
- Mantener las llamadas HTTP en servicios reutilizables y no duplicar reglas de negocio entre componentes.
- No confiar en Angular para validar la seguridad de las operaciones: todas las validaciones importantes deben repetirse en el backend.

## 4. Node.js, Express y TypeScript: backend eficiente

### Arquitectura y responsabilidades

- Respetar la estructura actual del backend y las responsabilidades que ya estén definidas.
- Separar rutas, controladores, lógica de negocio y acceso a datos según la arquitectura existente, sin crear capas innecesarias.
- Evitar que los controladores acumulen consultas, reglas de negocio y transformaciones complejas cuando ya existen componentes reutilizables.
- No duplicar validaciones, consultas SQL ni reglas de negocio entre endpoints.
- Mantener contratos de API compatibles con el frontend, salvo que el cambio sea necesario y esté justificado.
- Validar y tipar los parámetros de ruta, query strings, cuerpos de petición y respuestas externas.
- Recordar que los tipos de TypeScript no validan los datos recibidos en tiempo de ejecución.

### Protección de recursos

- No utilizar operaciones bloqueantes en el event loop para tareas que puedan impedir la atención de otras solicitudes.
- Evitar cargar tablas completas, archivos grandes o conjuntos de datos ilimitados en memoria.
- Implementar límites de tamaño para solicitudes, archivos y cargas útiles.
- Configurar timeouts apropiados para llamadas externas, consultas y operaciones potencialmente lentas.
- Limitar la concurrencia de operaciones costosas cuando sea necesario.
- Evitar `Promise.all` sobre cantidades ilimitadas de registros o tareas. Procesar por lotes cuando corresponda.
- No crear bucles de consultas SQL ni ejecutar una consulta por cada elemento de una colección cuando pueda resolverse eficientemente con una operación por lotes.
- Evitar reintentos infinitos, temporizadores sin limpiar, tareas duplicadas y procesos que puedan ejecutarse indefinidamente.
- No utilizar `setInterval` para iniciar procesos que podrían solaparse si una ejecución tarda más que el intervalo.
- Gestionar correctamente las conexiones, los recursos temporales y el cierre ordenado del servidor.
- Evitar crear un pool de conexiones nuevo por solicitud. Reutilizar el pool configurado para la aplicación.
- Configurar el tamaño del pool según la capacidad de MySQL, la carga prevista y el número de instancias del backend.
- No ejecutar trabajos pesados dentro del proceso HTTP si bloquean la atención de solicitudes; evaluar procesamiento por lotes o trabajos en segundo plano cuando esté justificado.

### Manejo de errores

- Centralizar el manejo de errores de Express cuando la arquitectura lo permita.
- Propagar correctamente los errores asíncronos y evitar promesas rechazadas sin gestionar.
- Devolver códigos HTTP coherentes y respuestas consistentes.
- No enviar trazas, consultas SQL, rutas internas, credenciales ni detalles de infraestructura al cliente.
- Registrar información suficiente para diagnosticar fallos sin exponer datos sensibles.
- No capturar una excepción para continuar como si la operación hubiera tenido éxito.
- Diferenciar errores de validación, autenticación, autorización, conflictos, recursos inexistentes y fallos internos.

## 5. MySQL: integridad, rendimiento y consultas seguras

### Antes de crear o modificar consultas

- Inspeccionar el esquema real de la base de datos, los tipos de columnas, las claves primarias, las claves foráneas, los índices y las restricciones existentes.
- Revisar las consultas y los métodos de acceso a datos existentes antes de implementar otros nuevos.
- No inventar nombres de tablas, columnas o relaciones.
- No modificar el esquema para adaptarlo a una suposición de la IA sin comprobar las consecuencias.
- Utilizar consultas parametrizadas mediante el controlador existente, como `mysql2`, si es el utilizado por el proyecto.
- Nunca concatenar entradas del usuario en consultas SQL.
- Validar también los identificadores dinámicos, nombres de columnas y direcciones de ordenamiento mediante listas permitidas; los parámetros SQL no sustituyen esa validación.

### Evitar consultas costosas

- Prohibido ejecutar consultas sin límites sobre tablas potencialmente grandes en endpoints de uso habitual.
- Aplicar paginación y límites máximos en listados.
- Seleccionar únicamente las columnas necesarias y evitar `SELECT *` cuando no sea necesario.
- Evitar N+1 queries, consultas repetidas dentro de bucles y consultas que puedan agruparse eficientemente.
- No utilizar `COUNT(*)`, subconsultas, agregaciones o JOIN complejos repetidamente si el resultado puede reutilizarse correctamente.
- No eliminar JOIN necesarios ni introducir caché únicamente para aparentar una mejora.
- Comprobar las condiciones de filtrado, la cardinalidad, el ordenamiento y los índices antes de optimizar.
- Revisar `EXPLAIN` para consultas relevantes y `EXPLAIN ANALYZE` cuando esté disponible y sea seguro ejecutarlo.
- Evaluar índices existentes antes de crear otros. Considerar el coste de escritura y almacenamiento que introducen.
- Evitar funciones sobre columnas filtradas, conversiones innecesarias y patrones que impidan aprovechar índices cuando exista una alternativa equivalente.
- No aplicar paginación con `LIMIT` y `OFFSET` enormes sin evaluar alternativas como la paginación por cursor o clave.
- No cargar grandes resultados en memoria para después filtrarlos en JavaScript si MySQL puede realizar el filtrado eficientemente.
- No utilizar `LIKE '%texto%'` de forma indiscriminada en tablas grandes; evaluar las necesidades de búsqueda y las alternativas disponibles.
- Evitar actualizaciones o eliminaciones masivas accidentales. Verificar siempre las condiciones `WHERE` y el alcance de la operación.

### Transacciones e integridad

- Utilizar transacciones cuando varias operaciones deban completarse como una sola unidad lógica.
- Mantener las transacciones cortas y liberar las conexiones incluso cuando se produzcan errores.
- No iniciar transacciones para operaciones simples que no las necesitan.
- Respetar las claves foráneas, restricciones únicas y reglas de integridad.
- Utilizar operaciones atómicas para evitar condiciones de carrera cuando varias solicitudes puedan modificar el mismo recurso.
- No asumir que una comprobación previa seguida de un `INSERT` o `UPDATE` evita duplicados o conflictos concurrentes.
- Considerar restricciones únicas, bloqueo adecuado o mecanismos atómicos cuando la integridad dependa de concurrencia.
- No ejecutar migraciones destructivas, truncamientos, eliminaciones masivas ni cambios irreversibles sin autorización explícita y un plan de recuperación.
- No modificar datos reales para probar una hipótesis sin autorización.

### Conexiones y carga

- Reutilizar un pool de conexiones y establecer límites compatibles con la capacidad real del servidor MySQL.
- Liberar las conexiones adquiridas incluso si una consulta falla.
- No mantener conexiones o transacciones abiertas mientras se realizan llamadas HTTP externas o trabajos prolongados.
- No aumentar arbitrariamente el número de conexiones para resolver consultas lentas.
- Diagnosticar consultas lentas, bloqueos y contención antes de aumentar recursos.
- Evitar ejecutar múltiples consultas pesadas en paralelo sin límites.

## 6. Seguridad de extremo a extremo

- Validar todas las entradas en el backend, independientemente de las validaciones de Angular.
- Aplicar autenticación y autorización a cada operación protegida y verificar el acceso al recurso solicitado.
- Aplicar privilegios mínimos a la cuenta de MySQL utilizada por la aplicación.
- No utilizar una cuenta administrativa de MySQL para las conexiones normales del backend.
- Mantener credenciales y secretos fuera del código fuente y del repositorio.
- No registrar contraseñas, tokens completos ni datos sensibles innecesarios.
- Configurar límites de solicitudes adecuados para endpoints costosos o expuestos públicamente.
- Proteger los procesos de carga de archivos, exportaciones, búsquedas y generación de informes frente al consumo abusivo de recursos.
- No confiar en identificadores, roles, precios o permisos enviados por el cliente sin verificarlos en el servidor.

## 7. Cambios de esquema y migraciones

- Comprobar el esquema actual antes de proponer cualquier modificación.
- Preferir migraciones versionadas y reproducibles cuando el proyecto utilice o pueda incorporar razonablemente ese mecanismo.
- No ejecutar cambios de esquema directamente en producción sin autorización, respaldo y evaluación de impacto.
- Evaluar bloqueos, duración, espacio en disco, índices y compatibilidad con versiones anteriores de la aplicación.
- Evitar migraciones que eliminen o renombren columnas utilizadas por otras partes del sistema sin identificar previamente sus dependencias.
- No asumir que una operación de DDL es reversible mediante una transacción.
- Documentar las consecuencias y los pasos de recuperación para operaciones de alto riesgo.

## 8. Revisión y verificación antes de finalizar

Después de cada cambio:

1. Revisar el diff y eliminar modificaciones accidentales o innecesarias.
2. Comprobar si se ha duplicado lógica o creado código que ya existe.
3. Ejecutar las comprobaciones de TypeScript, lint y pruebas disponibles.
4. Verificar los contratos entre Angular, Express y MySQL.
5. Revisar los posibles efectos sobre la integridad de los datos, las conexiones y el consumo de recursos.
6. Comprobar los errores y los casos límite relevantes.
7. Revisar consultas importantes mediante las herramientas de análisis disponibles.
8. Informar qué se modificó, qué pruebas se ejecutaron, qué riesgos se detectaron y qué aspectos no se pudieron verificar.

No afirmar que las pruebas, las mediciones o las verificaciones se realizaron si no se ejecutaron realmente.

## 9. Reglas de autonomía y operaciones peligrosas

- Leer e inspeccionar antes de escribir.
- Planificar los cambios que afecten a múltiples archivos, contratos o tablas.
- No ejecutar automáticamente operaciones destructivas, modificaciones masivas de datos, migraciones irreversibles ni cambios de infraestructura de alto riesgo.
- No instalar dependencias ni cambiar configuraciones críticas sin justificar la necesidad.
- No resolver errores desactivando validaciones, restricciones, autenticación o controles de seguridad.
- Si una solución puede aumentar significativamente la carga del servidor, bloquear tablas, consumir memoria excesiva o comprometer datos, detenerse y explicar el riesgo.
- Preferir soluciones verificables, reversibles y compatibles con el proyecto.

## Principio final

Priorizar la corrección, la seguridad, la integridad de los datos y la eficiencia antes que la velocidad de implementación.

No generar código por generar código. No optimizar sin evidencia. No añadir complejidad innecesaria. No asumir que una solución funciona simplemente porque compila.

Inspeccionar, razonar, implementar el cambio mínimo y verificarlo.