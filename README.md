# PROYECTO_CSWF_APP

## Avance de primer Parcial

### Avance segunda semana (creación de estructuras base para el proyecto)

En este avance definimos y creamos los componentes y carpetas necesarias para construir el proyecto, iniciando por el frontend con React (JavaScript + React Compiler) y Backend PHP, con la base de datos en el motor MySQL.

### Avance semana tres (estado del proyecto)

El proyecto ya avanzó hacia un modelo de login y registro completo. Ahora:

- el frontend tiene un flujo unificado de inicio de sesión y registro en el mismo componente,
- el backend usa un controlador `AuthController` para procesar `/login`, `/register` y `/status`,
- la capa de datos está organizada con un modelo `Usuario` que busca usuarios y crea nuevos registros,
- la arquitectura ya separa claramente frontend, backend y base de datos.

### Avance semana cuatro (protección de rutas y orden de acceso)
En la semana cuatro se trabajó en organizar el flujo de acceso y asegurar que el módulo de clientes solo sea visible después de un login válido de usuario administrador.

- El app ahora redirige primero a la pantalla de login.
- El dashboard y las opciones de clientes no se muestran antes de iniciar sesión.
- Se añadió un contexto de autenticación para mantener el estado del usuario en React.
- Solo los usuarios con `role: Admin` pueden acceder a `/clientes` y a los formularios de creación/edición.
- Las rutas no autorizadas redirigen correctamente o muestran una página de acceso denegado.
- Esto mejora el orden del frontend: login primero, dashboard después del login exitoso.

### Avance semana cinco (Seguridad JWT, Tolerancia a Fallos y Gestión de Vehículos)
En esta semana se implementó la gestión completa de Vehículos integrada con la de Clientes, aplicando un enfoque de seguridad y un manejo estructurado de **Tolerancia a Fallos**.
- **Autenticación Segura (JWT)**: Se protegió el API implementando tokens *JSON Web Token* (JWT). Al iniciar sesión exitosamente (`AuthController`), el servidor firma y emite un token válido por 24h. Las rutas de la API de clientes y vehículos ahora están protegidas por un `AuthMiddleware` que comprueba la cabecera `Authorization: Bearer <token>` rechazando accesos no autorizados con un error 401. El frontend almacena este token seguro en el `localStorage` e inyecta la cabecera en cada petición `fetch` desde sus servicios.
- **Gestión de Vehículos**: Se crearon rutinas CRUD en backend (`VehiculoController.php`, `Vehiculo.php`) y vistas frontend (`VehiculoListPage.jsx`, `VehiculoFormPage.jsx`).
- **Verificación de Esquema DB**: El backend ahora corresponde estrictamente a la tabla `vehiculo` referenciando `id_cliente` con cascada en borrado, incluyendo kilometraje, marca, modelo, año y color.
- **Tolerancia a fallos en el Backend**: Se añadieron bloques `try-catch` encapsulando cada transacción a base de datos (tanto en la clase abstracta BD, controladores como *ClienteController* y *VehiculoController*, y los Modelos *Cliente* y *Vehiculo*). Los errores imprevistos (base de datos caída o inconsistencias) se capturan y son respondidos como JSON code 500, evitando cierres abruptos (Fatal errors) del lado de Apache o PHP.
- **Tolerancia a fallos en Frontend**: Los métodos *fetch* contemplan fallos de conexión (ej: servidor caído o sin red). Si ocurre una excepción de red o parseo, los servicios retornan mensajes controlados (`setError` / `setErrorMessage`), los cuales son mostrados con amabilidad en UI sin crashear la interfaz ni recargar páginas.
- **Código documentado**: Se comentaron los Modelos y Controladores detallando qué bloque de código maneja la tolerancia y la lógica aplicada en los endpoints.

## Avance de segundo Parcial

### Avance semana 9 (Módulo de Gestión de Inventario - Repuestos)

En esta semana se implementó el módulo de inventario de repuestos con las siguientes características:

- **CRUD de repuestos**: Creación, lectura, actualización y eliminación de repuestos con campos: código, nombre, descripción, precio, stock y stock mínimo.
- **Tabla `repuesto` en base de datos**: Nueva tabla independiente con campos `codigo` (único), `nombre`, `descripcion`, `precio`, `stock`, `stock_minimo` y `activo`.
- **Alertas visuales de stock bajo**: Banner superior que muestra la cantidad de repuestos con stock por debajo del mínimo, resaltado de filas en la tabla con color amarillo, y color naranja/rojo en la celda de stock según la criticidad.
- **Protección JWT**: La ruta `/api/repuestos` está protegida por `AuthMiddleware`, solo accesible con token válido.
- **Tolerancia a fallos**: `try-catch` en modelo y controlador PHP, manejo de errores de red en el frontend.
- **Endpoints API**: `GET /repuestos` (lista), `GET /repuestos?id=N` (detalle), `GET /repuestos?low_stock=1` (stock bajo), `POST /repuestos`, `PUT /repuestos?id=N`, `DELETE /repuestos?id=N`.

## Uso

### Tecnologías y entorno de desarrollo

Este proyecto utiliza:

- Frontend: React + JavaScript + Vite
- Backend: PHP + Apache
- Base de datos: MySQL
- IDE recomendado: Visual Studio Code

### Despliegue remoto

El frontend remoto usa GitHub Pages para la interfaz `https://wallug.github.io/PROYECTO_CSWF_APP/` , mientras que el backend y la base de datos se alojan en `https://pruebascsf.alwaysdata.net/`.

### Ejecución local con servicios separados

Para correr el proyecto en local con tres servicios separados, el repositorio ahora incluye una configuración de Docker Compose.
Esto permite ejecutar:

- frontend como servicio de desarrollo Vite,
- backend como servicio PHP/Apache,
- MySQL como contenedor de base de datos.

#### Requisitos

- Docker instalado
- Docker Compose instalado
- Visual Studio Code (recomendado)

#### ¿No sabes cómo instalar Docker?

1. Visita https://www.docker.com/get-started y descarga Docker Desktop para Windows.
2. Sigue los pasos de instalación y asegúrate de habilitar WSL 2 si tu sistema lo solicita.
3. Para Docker Compose, la mayoría de instalaciones modernas de Docker Desktop ya lo incluyen.

Si prefieres instrucciones rápidas:

- Documentación de Docker Desktop: https://docs.docker.com/desktop/
- Documentación de Docker Compose: https://docs.docker.com/compose/install/

#### Pasos para ejecutar en local

1. Abre una terminal en la raíz del repositorio.
2. Ejecuta:

```bash
docker compose up --build
```

3. Cuando termine de arrancar, el frontend estará disponible en:

```text
http://localhost:5173
```

4. El backend quedará disponible en:

```text
http://localhost:8080
```

5. La base de datos MySQL correrá en:

```text
localhost:3306
```

#### Detalle de la configuración local

- El servicio `frontend` usa `VITE_API_URL=http://localhost:8080`, de modo que el navegador en tu máquina accede al backend a través del puerto publicado.
- El servicio `backend` usa variables de entorno para conectarse a MySQL y puede ejecutarse en local sin modificar el código PHP.
- El servicio `mysql` inicializa la base de datos con el esquema definido en `mysql/SISTEMA DE GESTIÓN DE TALLER.sql`.
- Recuerda: MySQL no se accede por navegador, se conecta con un cliente de base de datos en `localhost:3306`.

### Notas

- En producción se mantiene la URL remota `https://pruebascsf.alwaysdata.net/`.
- En local se usa Docker Compose para separar claramente los tres servicios.
- Si quieres correr el frontend local sin Docker, el repositorio puede adaptarse, pero la configuración actual se centra en un entorno de Docker local para mayor consistencia.
