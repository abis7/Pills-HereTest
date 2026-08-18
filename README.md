# Pills Here — Levantamiento del proyecto

Guía para levantar la aplicación completa (base de datos, backend y frontend) usando **Docker**, sin modificar ningún archivo del proyecto.

## Arquitectura

| Servicio | Tecnología | Puerto | Contenedor |
|---|---|---|---|
| Base de datos | PostgreSQL 16 (Alpine) | 5432 | `pills-here-db` |
| Backend | Spring Boot 3.3.5 / Java 21 | 8083 | `pills-here-backend` |
| Frontend | React 19 + Vite 7 (dev server) | 5173 | `pills-here-frontend` |

- Los servicios comparten la red Docker `pills-here_default`.
- El navegador consume el backend directamente en `http://localhost:8083` (el CORS del backend ya permite `http://localhost:5173`).
- El frontend corre en modo desarrollo (hot reload) con `node_modules` dentro de un volumen del contenedor, así que la carpeta del proyecto no se toca.

## Requisitos

- Docker Desktop (con Docker Compose) instalado y corriendo.
- Puertos libres: `5432`, `8083`, `5173`.

---

## 1. Base de datos

```bash
docker network create pills-here_default 2>/dev/null || true

docker run -d --name pills-here-db \
  --network pills-here_default \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pills_here \
  -v "$PWD/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro" \
  -v pills-here_pills-here-db-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

- El `schema.sql` se ejecuta automáticamente solo la **primera vez** (cuando el volumen de datos está vacío).
- Los datos persisten en el volumen `pills-here_pills-here-db-data`.

## 2. Backend

### Opción A — Si ya existe la imagen `pills-here-backend`

```bash
docker run -d --name pills-here-backend \
  --network pills-here_default \
  -p 8083:8083 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/pills_here \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  pills-here-backend
```

### Opción B — Compilar la imagen desde el código (sin crear Dockerfile en el repo)

```bash
docker build -f - -t pills-here-backend ./pills-here-backend <<'EOF'
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
EOF
```

Luego ejecuta el `docker run` de la Opción A.

> Las variables `SPRING_DATASOURCE_*` sobrescriben en tiempo de ejecución los valores de `application.properties` (que apuntan a `localhost:5432`), permitiendo conectar con el contenedor `db` sin editar ningún archivo.

## 3. Frontend (Vite dev server)

```bash
docker run -d --name pills-here-frontend \
  -p 5173:5173 \
  -v "$PWD/pills-here-frontend:/app" \
  -v /app/node_modules \
  -w /app \
  node:22-alpine \
  sh -c "npm ci --no-audit --no-fund && npm run dev -- --host 0.0.0.0"
```

- `npm ci` instala exactamente lo que define el `package-lock.json` y nunca lo modifica.
- El volumen anónimo `/app/node_modules` mantiene las dependencias (con binarios de Linux) dentro del contenedor; la carpeta del proyecto queda intacta.
- Requiere Node `^20.19 || >=22.12` (por eso se usa `node:22-alpine`).

## 4. Verificación

```bash
docker ps --filter name=pills-here
curl -s -o /dev/null -w 'frontend: %{http_code}\n' http://localhost:5173/
curl -s -o /dev/null -w 'backend:  %{http_code}\n' -X POST http://localhost:8083/auth/login \
  -H 'Content-Type: application/json' -d '{"correo":"test@test.com","contrasena":"x"}'
```

- Frontend: `200` (la app carga en `http://localhost:5173`).
- Backend: `400` con credenciales falsas (la API está viva; un login válido devuelve `200`).
- Base de datos: estado `healthy` en `docker ps`.

## Notas útiles

- **Logs:** `docker logs -f pills-here-backend` / `pills-here-frontend` / `pills-here-db`.
- **Detener todo:** `docker stop pills-here-frontend pills-here-backend pills-here-db`.
- **Reiniciar:** `docker start pills-here-db pills-here-backend pills-here-frontend`.
- **Base de datos desde cero** (pierde datos): eliminar el contenedor y el volumen antes del paso 1:
  `docker rm -f pills-here-db && docker volume rm pills-here_pills-here-db-data`.
- Si el puerto 5173 queda ocupado por un proceso `vite` viejo: `lsof -nP -iTCP:5173 -sTCP:LISTEN` y `kill <PID>`.
