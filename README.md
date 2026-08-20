# Pills Here — Cómo levantar el proyecto

Guía para levantar la aplicación completa (base de datos, backend y frontend) usando Docker.

## Requisitos

- Docker instalado y corriendo.
- Puertos libres: `5432`, `8083`, `5173`.

## 1. Base de datos

```bash
docker network create pills-here_default 2>/dev/null || true

docker run -d --name pills-here-db \
  --network pills-here_default \
  --network-alias db \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pills_here \
  -v "$PWD/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro" \
  -v pills-here_pills-here-db-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

## 2. Backend

Compilar la imagen desde el código:

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

docker run -d --name pills-here-backend \
  --network pills-here_default \
  -p 8083:8083 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/pills_here \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  pills-here-backend
```

## 3. Frontend

```bash
docker run -d --name pills-here-frontend \
  -p 5173:5173 \
  -v "$PWD/pills-here-frontend:/app" \
  -v /app/node_modules \
  -w /app \
  node:22-alpine \
  sh -c "npm ci --no-audit --no-fund && npm run dev -- --host 0.0.0.0"
```

## 4. Verificación

```bash
docker ps --filter name=pills-here
curl -s -o /dev/null -w 'frontend: %{http_code}\n' http://localhost:5173/
curl -s -o /dev/null -w 'backend:  %{http_code}\n' -X POST http://localhost:8083/auth/login \
  -H 'Content-Type: application/json' -d '{"correo":"test@test.com","contrasena":"x"}'
```

- Frontend: `200` (la app carga en `http://localhost:5173`).
- Backend: `400` con credenciales falsas (la API está viva).

## Comandos útiles

- **Logs:** `docker logs -f pills-here-backend` / `pills-here-frontend` / `pills-here-db`.
- **Detener:** `docker stop pills-here-frontend pills-here-backend pills-here-db`.
- **Reiniciar:** `docker start pills-here-db pills-here-backend pills-here-frontend`.
- **BD desde cero** (pierde datos): `docker rm -f pills-here-db && docker volume rm pills-here_pills-here-db-data` y volver al paso 1.
