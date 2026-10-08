# Especificación Funcional y Arquitectura de Frontend (MVC)
**Proyecto:** Sequora — Plataforma de Gestión de Contenidos Académicos y Rutas de Aprendizaje  
**Institución:** Corporación Universitaria Latinoamericana (CUL)[cite: 1]  
**Programa:** Ingeniería de Sistemas  
**Enfoque de Arquitectura:** Patrón MVC (Modelo-Vista-Controlador), componentes desacoplados, alta escalabilidad y prevención de fallos en cascada (loose coupling).

---

## 1. Definición de Actores del Sistema
*   **Estudiante:** Usuario final que consume rutas de aprendizaje secuenciales, consulta repositorios indexados y gestiona su progreso académico para mitigar la ineficiencia del trabajo autónomo y evitar vacíos conceptuales[cite: 1].
*   **Administrador (Gestor Académico / Docente CUL):** Usuario con privilegios de curaduría, encargado de alimentar, estructurar y actualizar el árbol de nodos, repositorios, bibliotecas y prerrequisitos pedagógicos del sistema[cite: 1].

---

## 2. Requerimientos Funcionales por Módulo (MVC)

### Módulo 1: Autenticación y Control de Accesos
*   **RF-01:** El sistema debe permitir el inicio de sesión diferenciado por roles (Estudiante y Administrador) para restringir o habilitar las capacidades de curaduría frente a las de consumo de contenido.
*   **RF-02:** El controlador de sesión debe persistir el rol activo en el almacenamiento local del cliente (`localStorage`) de forma aislada, protegiendo las rutas de navegación de manera modular sin comprometer el núcleo de la aplicación.

### Módulo 2: Gestión de Rutas y Curaduría de Contenidos (Vista Administrador)
*   **RF-03:** El administrador debe contar con un panel de control (Dashboard CRUD) para crear, editar y eliminar líneas de carrera (ej. Fundamentos de Programación, Arquitectura de Software, Bases de Datos)[cite: 1].
*   **RF-04:** El administrador debe poder vincular recursos externos (repositorios de GitHub, bibliotecas digitales, documentación oficial CUL) a nodos específicos, asignándoles metadatos de complejidad técnica[cite: 1].
*   **RF-05:** El administrador debe establecer de manera gráfica los prerrequisitos lógicos entre nodos (ej. que el nodo de desarrollo avanzado requiera obligatoriamente la aprobación de los nodos base), asegurando la regla de negocio de progresión secuencial.

### Módulo 3: Visualización de Rutas y Progreso Secuencial (Vista Estudiante)
*   **RF-06:** El estudiante debe visualizar un panel principal con el listado de rutas de aprendizaje disponibles y su porcentaje general de avance acumulado.
*   **RF-07:** El mapa de ruta secuencial debe renderizar tres estados visuales inequívocos por cada nodo para evitar la sobrecarga cognitiva (Teoría de Carga Cognitiva aplicada)[cite: 1]:
    *   *Bloqueado:* Cuando no se cumplen los prerrequisitos académicos previos.
    *   *Disponible:* Cuando el estudiante está habilitado para cursarlo.
    *   *Completado:* Cuando el nodo ha sido superado y validado.
*   **RF-08:** Al ingresar a un nodo habilitado, el estudiante debe visualizar un panel modular centralizado que agrupe los recursos teóricos y prácticos sin dispersión de fuentes[cite: 1].

---

## 3. Especificación de Interfaces UI/UX (Vistas del Sistema)

### 3.1. Interfaz de Administrador (Panel de Curaduría y Control)
*   **Dashboard de Gestión de Malla:**
    *   Tabla interactiva de control para administrar rutas activas, conteo de nodos y fecha de última actualización.
    *   Acción flotante o botón principal: *"Nueva Línea de Aprendizaje"*.
*   **Editor de Nodos y Prerrequisitos:**
    *   Formulario estructurado en pestañas para definir el título, descripción conceptual y la selección múltiple de nodos bloqueantes (prerrequisitos).
    *   Sección de inyección de recursos donde el administrador ingresa URLs de repositorios, tipo de recurso (Repositorio, Biblioteca, Metodología) y nivel de complejidad[cite: 1].

### 3.2. Interfaz de Estudiante (Experiencia de Aprendizaje)
*   **Selector de Líneas de Carrera (Dashboard Principal):**
    *   Tarjetas estilo *grid* orientadas a la experiencia de usuario, mostrando el impacto del módulo, la categoría y una barra de progreso porcentual dinámica.
*   **Mapa de Grafo Secuencial (Vista de Detalle de Ruta):**
    *   Línea de tiempo interactiva o diagrama de flujo vertical donde cada nodo muestra iconos distintivos (candado para bloqueados, check verde para completados, libro abierto para disponibles).
*   **Panel de Contenido y Recursos Indexados:**
    *   Vista de lectura limpia diseñada para mitigar la carga cognitiva extraña, separando la teoría resumida de los enlaces directos a GitHub y documentación oficial de la CUL[cite: 1].

---

## 4. Directrices de Escalabilidad (Clean Code & Loose Coupling)
*   **Independencia de Módulos:** Cada vista y componente se comunica exclusivamente a través de servicios controladores de estado, evitando dependencias circulares que puedan ocasionar bloqueos o caídas en cascada al modificar un componente secundario.
*   **Tipado Estricto:** Cero uso de tipos ambiguos (`any`). Toda entidad del sistema debe estar acoplada a contratos e interfaces claras, facilitando la futura integración con el backend en C# .NET sin alterar la capa visual[cite: 1].