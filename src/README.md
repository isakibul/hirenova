# Backend Structure

The backend uses a feature-module structure for product domains. A module
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
  newsletters/
    newsletters.routes.js
    newsletters.service.js
    controllers/
```

Shared infrastructure and cross-domain code stays outside modules:

- `routes/v1`: API version composition only. Mount module routes here, but keep
  feature route definitions inside `modules/<feature>`.
- `modules/<feature>/controllers`: request/response adapters. Controllers
  validate inputs, call module services, and return API responses.
- `modules/<feature>/<feature>.service.js`: feature business rules and
  workflow logic. Persistence access should come through infrastructure
  database entry points rather than importing schemas directly.
- `modules/<feature>/<feature>.validation.js`: Joi schemas for request
  contracts. Use enum values from `src/shared/apiContract.js`.
- `model`: Mongoose schemas and indexes. Model enums should also use
  `src/shared/apiContract.js`.
- `middleware`: cross-cutting Express behavior such as auth, rate limits,
  logging, metrics, and request context.
- `utils`: small framework-agnostic helpers.
- `shared`: project-wide contracts and security helpers.
- `integrations`: adapters for external systems such as email delivery and
  resume parsing.
- `infrastructure`: operational concerns such as observability and database
  access entry points.
- `shared/apiContract.js`: enum/status contract consumed by backend validators
  and models.

When adding a feature, prefer this flow:

1. Add or update `src/shared/apiContract.js` if the API introduces a new
   enum/status.
2. Create or update `modules/<feature>/<feature>.routes.js`.
3. Keep controllers focused on HTTP details.
4. Put reusable business behavior in `modules/<feature>/<feature>.service.js`.
5. Put request schemas in `modules/<feature>/<feature>.validation.js`.
6. Mount the module route from `routes/v1/index.js`.
7. Keep schema definitions in `model` and consume persistence through
   `infrastructure/database`.

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

`npm run check` runs the backend suite with the production coverage gate:
75% lines, 70% branches, and 70% functions across the backend code that is
meaningful to unit-test directly. HTTP controller glue, route composition,
external integrations, observability adapters, and static email template
builders are excluded from the threshold and should be covered by focused
route, integration, or smoke tests where appropriate.

Browser E2E seeding is exposed only when the API runs with `NODE_ENV=test`.
Production and development route wiring does not mount the `/api/v1/e2e`
helpers.
