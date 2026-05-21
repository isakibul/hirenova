# HireNova Backend

Express/MongoDB API for HireNova, a role-based hiring platform with job posts,
applications, applicant ranking, resume storage, notifications, messaging, and
admin operations.

## Responsibilities

- User auth with HttpOnly cookie sessions, CSRF-aware clients, and role checks.
- Jobseeker, employer, admin, and superadmin workflows.
- Job CRUD, approval, lifecycle updates, saved jobs, and applications.
- Application status updates, delete flow, and AI-assisted applicant ranking.
- Resume upload, download, and parsing through S3-compatible object storage.
- Notifications, realtime messaging support, newsletters, and dashboards.
- Audit logging, health checks, rate limiting, and production-readiness helpers.

## Tech Stack

- Node.js 20+
- Express 5
- MongoDB with Mongoose
- Redis for scalable runtime services
- Socket.IO integration
- Nodemailer and MailHog for local email
- MinIO/S3-compatible object storage for resumes
- OpenRouter-compatible AI integration
- Node test runner with coverage gates

## Setup

Install dependencies from the repository root:

```bash
npm install
```

Create the backend environment file:

```bash
cp .env.example .env
```

Start local infrastructure:

```bash
docker compose up -d mongodb redis mailhog minio minio-init
```

Run the API:

```bash
npm run dev
```

The API runs on `http://localhost:4000` by default. Versioned API routes are
mounted under `/api/v1`.

## Required Environment

Core local variables are documented in the root `.env.example`.

Important groups:

- `PORT`, `DATABASE_CONNECTION_URL`, `DB_NAME`
- `REDIS_URL` or `REDIS_HOST` / `REDIS_PORT`
- `CLIENT_URL`, `CORS_ORIGINS`
- `ACCESS_TOKEN_SECRET`, `EMAIL_SECRET`, `CSRF_SECRET`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_FROM`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`

For production, replace every secret-like value with a strong secret and point
MongoDB, Redis, email, and object storage to managed services.

## Local Infrastructure

The root `docker-compose.yml` provides:

| Service | Purpose | URL |
| --- | --- | --- |
| MongoDB | Database | `mongodb://localhost:27017` |
| Mongo Express | Mongo UI | `http://localhost:8081` |
| Redis | Cache/realtime support | `localhost:6379` |
| Redis Commander | Redis UI | `http://localhost:8082` |
| MailHog | Email capture | `http://localhost:8025` |
| MinIO | Resume object storage | `http://localhost:9001` |

Use these MinIO defaults locally:

```bash
S3_ENDPOINT=http://127.0.0.1:9000
S3_REGION=us-east-1
S3_BUCKET=hirenova-resumes
S3_ACCESS_KEY=hirenova
S3_SECRET_KEY=hirenova-minio-secret
S3_FORCE_PATH_STYLE=true
S3_REQUEST_TIMEOUT_MS=5000
```

## Architecture

The backend uses feature modules. Each module owns routes, controllers,
validation, and service logic for a product domain.

```txt
src/
  app.js
  index.js
  routes/v1/
  modules/
    auth/
    jobs/
    applications/
    users/
    messages/
    notifications/
    newsletters/
    dashboard/
    assistant/
  model/
  middleware/
  integrations/
  infrastructure/
  shared/
  utils/
```

Guidelines:

- `routes/v1` composes versioned routes only.
- `modules/<feature>/<feature>.routes.js` defines feature routes.
- Controllers adapt HTTP requests/responses and call services.
- Services contain business rules and persistence workflows.
- Validation files contain Joi request contracts.
- `shared/apiContract.js` centralizes shared enum/status values.
- `integrations` contains external adapters such as HTTP, email, AI, and storage.
- `infrastructure` contains database entry points and observability concerns.

## Key API Areas

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/session`
- `GET /api/v1/jobs`
- `POST /api/v1/jobs`
- `PATCH /api/v1/jobs/:id/status`
- `PATCH /api/v1/jobs/:id/approval`
- `POST /api/v1/jobs/:id/apply`
- `GET /api/v1/jobs/:id/applications`
- `GET /api/v1/jobs/:id/applications/ranking`
- `PATCH /api/v1/applications/:id/status`
- `DELETE /api/v1/applications/:id`
- `GET /api/v1/notifications`
- `GET /api/v1/messages/conversations`
- `POST /api/v1/newsletter`

## Testing

Run backend tests:

```bash
npm test
```

Run backend coverage gate:

```bash
npm run check:backend
```

The coverage gate currently enforces:

- 75% lines
- 70% branches
- 70% functions

Controller glue, route composition, external integrations, observability
adapters, and static email builders are excluded from the unit coverage gate and
should be covered through focused integration/E2E tests where useful.

## E2E Seed Route

Browser E2E tests use a deterministic seed API mounted only when
`NODE_ENV=test`.

The `/api/v1/e2e/seed` route is intentionally unavailable in development and
production.

## Adding Backend Features

1. Add or update shared contracts in `src/shared/apiContract.js` when needed.
2. Add validation in `modules/<feature>/<feature>.validation.js`.
3. Add service behavior in `modules/<feature>/<feature>.service.js`.
4. Add controller files under `modules/<feature>/controllers`.
5. Wire the route in `modules/<feature>/<feature>.routes.js`.
6. Mount the module from `routes/v1/index.js` if it is a new module.
7. Add service tests and, for user-facing flows, Playwright E2E coverage.
