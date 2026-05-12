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

## Uso

### Despliegue remoto
El frontend remoto usa GitHub Pages para la interfaz, mientras que el backend y la base de datos se alojan en `https://pruebascsf.alwaysdata.net/`.

### Ejecución local con servicios separados
Para correr el proyecto en local con tres servicios separados, el repositorio ahora incluye una configuración de Docker Compose.
Esto permite ejecutar:
- frontend como servicio de desarrollo Vite,
- backend como servicio PHP/Apache,
- MySQL como contenedor de base de datos.

#### Requisitos
- Docker instalado
- Docker Compose instalado

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
- El servicio `frontend` usa `VITE_API_URL=http://backend`, de modo que las llamadas de la UI se resuelven dentro de la red de Docker hacia el backend.
- El servicio `backend` usa variables de entorno para conectarse a MySQL y puede ejecutarse en local sin modificar el código PHP.
- El servicio `mysql` inicializa la base de datos con el esquema definido en `mysql/SISTEMA DE GESTIÓN DE TALLER.sql`.

### Notas
- En producción se mantiene la URL remota `https://pruebascsf.alwaysdata.net/`.
- En local se usa Docker Compose para separar claramente los tres servicios.
- Si quieres correr el frontend local sin Docker, el repositorio puede adaptarse, pero la configuración actual se centra en un entorno de Docker local para mayor consistencia.
