# Gymtracker Backend

Spring Boot backend for personal workout tracking.

## Stack

- Java 21
- Spring Boot 4
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway
- OpenAPI / Swagger UI

## Local development

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Copy `.env.example` into your local environment, or export the same variables manually.

3. Start the app with the `dev` profile:

```bash
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

The local development profile enables Swagger and allows localhost CORS origins.

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

## Environment variables

### Development

Development defaults are available through `application-dev.properties`, but these variables can override them:

```text
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:postgresql://localhost:5432/gymtracker
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-this-development-secret-change-this-development-secret
JWT_EXPIRATION_SECONDS=86400
APP_CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:3000,http://127.0.0.1:3000
```

### Production

The `prod` profile requires explicit environment variables for database credentials, JWT secret, and allowed CORS origins.

```bash
SPRING_PROFILES_ACTIVE=prod
```

Swagger and OpenAPI endpoints are disabled by default outside `dev`.

## Database

Schema management is handled by Flyway. The initial schema lives in:

```text
src/main/resources/db/migration/V1__init_schema.sql
```

## API examples

Register:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"francesco","email":"francesco@example.com","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"francesco","password":"password123"}'
```

List exercises for the authenticated user:

```bash
curl http://localhost:8080/api/exercises \
  -H "Authorization: Bearer <accessToken>"
```

Create exercises in bulk:

```bash
curl -X POST http://localhost:8080/api/exercises/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '[
    {
      "name": "Panca piana bilanciere",
      "description": "Esercizio multiarticolare per il petto",
      "muscleGroup": "CHEST",
      "equipment": "BARBELL",
      "imageUrl": null,
      "notes": "Mantenere scapole addotte"
    },
    {
      "name": "Lat machine avanti",
      "description": "Esercizio per dorsali",
      "muscleGroup": "BACK",
      "equipment": "MACHINE",
      "imageUrl": null,
      "notes": null
    }
  ]'
```

## Data model note

Exercises, workouts, and weekly schedules are scoped to the authenticated user.

## Tests

```bash
./mvnw test
```

Tests use H2 in memory, disable Flyway, and do not require PostgreSQL.
