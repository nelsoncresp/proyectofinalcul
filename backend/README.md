# Plataforma de Gestión de Contenidos Académicos CUL - Backend API

## 1. Descripción General
Este es el servidor backend para la estructuración de rutas de aprendizaje del programa de Ingeniería de Sistemas de la Corporación Universitaria Latinoamericana (CUL). Desarrollado bajo una arquitectura estricta **MVC (Model-View-Controller)** y orientado a objetos.

## 2. Stack Tecnológico
- **Entorno**: Node.js
- **Lenguaje**: TypeScript (Tipado estricto)
- **Framework**: Express.js
- **ORM**: TypeORM (Reemplazo moderno para manipulación segura de SQL)
- **Base de Datos**: MySQL
- **Seguridad**: Autenticación mediante JSON Web Tokens (JWT) y encriptación con Bcrypt.

## 3. Instalación y Ejecución

1. Abrir la terminal en la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instalar todas las dependencias:
   ```bash
   npm install
   ```
3. Levantar el servidor en modo desarrollo (con recarga automática ante cambios gracias a `tsx watch`):
   ```bash
   npm run dev
   ```
   *El servidor quedará escuchando peticiones en `http://localhost:3000`.*

## 4. Base de Datos, Roles e Inserts Iniciales
La base de datos relacional está definida por un esquema que mapea las entidades académicas a través de TypeORM (usuarios, asignaturas, recursos, prerrequisitos, etc.).

### Roles del Sistema (rol_id)
El sistema opera bajo un control de acceso basado en roles jerárquicos:
1. **Administrador** (rol_id = 1)
2. **Docente** (rol_id = 2)
3. **Estudiante** (rol_id = 3)

### Esquema y Datos Iniciales (Inserts)
La base de datos se debe alimentar inicialmente con 5 áreas de formación (Ciencias Básicas, Infraestructura, etc.) y un pensum predefinido de 58 asignaturas (Física, Cálculo, Programación, etc.), fuertemente interconectadas por una tabla cruzada de **prerrequisitos** que el motor valida en tiempo real al evaluar el avance del usuario.

## 5. Reglas de Negocio Implementadas
- **Motor de Prerrequisitos**: Al intentar actualizar el estado de una asignatura a `completado`, el servidor intercepta la acción, cruza la tabla de relaciones muchos-a-muchos y valida en el historial que el alumno haya aprobado previamente todos los prerrequisitos estrictos de la materia.
- **Filtrado de Curaduría**: Los recursos académicos de estudio son consultados bajo la condición estricta de que su columna `estado_revision` sea equivalente a `aprobado`.

## 6. Manejo de Errores (Error Handling)
El API implementa un control de errores robusto utilizando códigos de estado HTTP semánticos y middlewares globales que previenen caídas del sistema:
- **Middleware Global de Sintaxis (JSON)**: Si el cliente envía un JSON mal formado (e.g., comas sobrantes), un middleware en `index.ts` atrapa la excepción `SyntaxError` y responde limpiamente con un `{ "error": "Formato JSON invalido en la peticion" }` y código HTTP `400` en lugar de emitir HTML en crudo o colapsar.
- **Respuestas Estandarizadas por Controlador**:
  - `200/201`: Petición exitosa / Creado correctamente.
  - `400 Bad Request`: Error de lógica de negocio o validación (Faltan prerrequisitos, correo electrónico duplicado).
  - `401 Unauthorized`: Autenticación fallida, credenciales incorrectas o token JWT inexistente.
  - `403 Forbidden`: Token válido pero con rol insuficiente (ej. un Docente intentando actualizar su propio progreso de estudiante).
  - `500 Internal Server Error`: Excepciones generales, como fallas en la base de datos.

---

## 7. Referencia de la API (Endpoints)

Todas las rutas operan bajo el prefijo `http://localhost:3000`

### Módulo de Autenticación (`/api/auth`)

#### Registrar Usuario
- **Método**: `POST`
- **URL**: `/api/auth/register`
- **Descripción**: Registra un usuario y hashea su contraseña con Salt.
- **Body** (JSON):
  ```json
  {
    "nombre": "Nombre del alumno",
    "email": "correo@ejemplo.com",
    "password": "tu_password",
    "rol_id": 3
  }
  ```

#### Iniciar Sesión (Login)
- **Método**: `POST`
- **URL**: `/api/auth/login`
- **Descripción**: Valida credenciales y retorna el JWT firmado para su uso en las siguientes rutas.
- **Body** (JSON):
  ```json
  {
    "email": "correo@ejemplo.com",
    "password": "tu_password"
  }
  ```

---

### Módulo de Progreso Académico (`/api/progress`)

#### Actualizar o Insertar Progreso
- **Método**: `POST`
- **URL**: `/api/progress/update`
- **Protección**: JWT Requerido en los Headers (`Authorization: Bearer <token>`). Valida que el rol sea `3` (Estudiante).
- **Descripción**: Inserta o actualiza el progreso de una asignatura. Valida la regla del Motor de Prerrequisitos.
- **Body** (JSON):
  ```json
  {
    "asignatura_id": 10,
    "estado": "completado"
  }
  ```

---

### Módulo de Recursos Didácticos (`/api/resources`)

#### Obtener Recursos Aprobados
- **Método**: `GET`
- **URL**: `/api/resources/:asignatura_id`
- **Protección**: JWT Requerido (`Authorization: Bearer <token>`)
- **Descripción**: Obtiene los recursos asociados al núcleo tecnológico de una asignatura específica.
- **Ejemplo de Uso**: `/api/resources/5` (Obtiene los recursos aprobados para la asignatura con ID 5).

---

### Módulo de Soporte y Auditoría (`/api/tickets`)

#### Crear Ticket de Soporte
- **Método**: `POST`
- **URL**: `/api/tickets/create`
- **Protección**: JWT Requerido (`Authorization: Bearer <token>`)
- **Descripción**: Permite a un usuario abrir un ticket de soporte asociado a un recurso que presenta problemas (ej. enlace caído o contenido incorrecto).
- **Body** (JSON):
  ```json
  {
    "recurso_id": 12,
    "descripcion": "El enlace del video está roto y no abre."
  }
  ```
