# Backend Structure

The backend uses a feature-module structure for core product domains. A module
owns its routes, controllers, validation, and service entry points together:

```txt
modules/
  auth/
    auth.routes.js
    auth.service.js
    auth.validation.js
    controllers/
  jobs/
    jobs.routes.js
    jobs.service.js
    jobs.validation.js
    controllers/
  applications/
    applications.routes.js
    applications.service.js
    applications.validation.js
    controllers/
```

Shared infrastructure and cross-domain code stays outside modules:

- `routes/v1`: API version composition only. Mount module routes here, but keep
  feature route definitions inside `modules/<feature>`.
- `modules/<feature>/controllers`: request/response adapters. Controllers
  validate inputs, call module services, and return API responses.
- `modules/<feature>/<feature>.service.js`: feature business rules, model
  queries, and workflow logic.
- `modules/<feature>/<feature>.validation.js`: Joi schemas for request
  contracts. Use enum values from `src/lib/apiContract.js`.
- `api/v1/*` and selected `lib/*` files may exist as compatibility shims while
  older modules are migrated. New backend feature work should prefer
  `modules/<feature>`.
- `model`: Mongoose schemas and indexes. Model enums should also use
  `src/lib/apiContract.js`.
- `middleware`: cross-cutting Express behavior such as auth, rate limits,
  logging, metrics, and request context.
- `utils`: small framework-agnostic helpers.
- `lib/*`: shared domain services and integrations that are not yet migrated
  to modules, such as mailer, notifications, resume parsing, and observability.
- `lib/apiContract.js`: enum/status contract consumed by backend validators
  and models.

When adding a feature, prefer this flow:

1. Add or update `src/lib/apiContract.js` if the API introduces a new
   enum/status.
2. Create or update `modules/<feature>/<feature>.routes.js`.
3. Keep controllers focused on HTTP details.
4. Put reusable business behavior in `modules/<feature>/<feature>.service.js`.
5. Put request schemas in `modules/<feature>/<feature>.validation.js`.
6. Mount the module route from `routes/v1/index.js`.
7. Keep persistence details in `model` or service-level queries.

## Local Email

The root `docker-compose.yml` includes MailHog for development email delivery.
Use `EMAIL_HOST=localhost`, `EMAIL_PORT=1025`, and `EMAIL_SECURE=false`.
Open `http://localhost:8025` to inspect confirmation, reset, and newsletter
campaign emails.

## Backend Tests

The backend test surface is self-contained and does not require the `client/`
folder:

```bash
npm run check
```

Browser E2E seeding is exposed only when the API runs with `NODE_ENV=test`.
Production and development route wiring does not mount the `/api/v1/e2e`
helpers.
