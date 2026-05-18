# Production Readiness

This checklist captures the minimum proof points for shipping HireNova beyond
local development.

## Required Checks

Run these before deploying:

```bash
npm run check
```

The root check is intentionally backend-only so the API can be copied out of
the monorepo and validated without the `client/` app. For a full monorepo
release candidate, run:

```bash
npm run check:all
```

`check:all` runs backend unit tests plus the client unit tests, lint, and
production build.

## Separated Testing

Backend-only repository or copied backend folder:

```bash
npm install
npm run check
```

Client-only repository or copied `client/` folder:

```bash
npm install
npm run check
```

For client E2E after separation, start the backend separately with
`NODE_ENV=test`, matching `E2E_SEED_SECRET`, a test database, Redis, and valid
test email settings such as `EMAIL_FROM=noreply@hirenova.test`. Then run:

```bash
E2E_API_URL=http://127.0.0.1:4100/api/v1 npm run test:e2e:external
```

## Critical E2E Flows

Verify these against every deploy candidate:

1. Jobseeker signup, email confirmation, login, profile update, resume upload.
2. Public job search with filters, job detail view, save job, apply to job.
3. Employer login, create job, edit job, close job, view applications.
4. Admin login, approve and decline jobs, manage users, review audit logs.
5. Messaging between candidate and employer, notification read/read-all states.
6. Forgot password, reset password, logout, and blocked access after logout.
7. Newsletter subscribe, admin campaign send, email event review.

## Deployment Notes

Set these environment variables in production:

- `DATABASE_CONNECTION_URL`
- `DB_NAME`
- `REDIS_URL` or both `REDIS_HOST` and `REDIS_PORT`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAMESITE`
- `EMAIL_SECRET`
- `OBSERVABILITY_HASH_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_RECOMMENDATION_MODEL`
- `RATE_LIMIT_STORE=redis`

Keep `CLIENT_URL` and `CORS_ORIGINS` pinned to the deployed frontend origin,
with comma-separated values only when you intentionally support multiple
frontends. Use strong, unique secrets for auth, email verification, and
observability hashing. Keep auth cookies `Secure` in production; use
`AUTH_COOKIE_SAMESITE=lax` for same-site frontend/API deployments and `none`
only when the frontend and API must operate cross-site over HTTPS. Configure a real SMTP provider before enabling
newsletter campaigns. Smart Match recommendations still return deterministic
match reasons if OpenRouter is unavailable, but production AI explanations need
`OPENROUTER_API_KEY`, Redis, and a recommendation-capable model configured
server-side.

The API validates the production environment at startup. It fails fast when
required production values are missing, placeholder secrets are still present,
or Redis-backed rate limiting is not enabled.

## Observability Scope

HireNova includes lightweight portfolio-grade observability:

- in-memory API request metrics for request volume, status classes, API errors,
  and slow requests since the current API process started
- persisted audit logs for successful sensitive actions, without request bodies
  or raw IP addresses
- persisted email delivery events with hashed recipients and delivery duration
- `/health/live` for process liveness and `/health/ready` for MongoDB/Redis
  readiness
- an admin System Monitor dashboard for health, email delivery, audit activity,
  and local alert signals

For a multi-instance production deployment, move request metrics and alerts to a
centralized observability backend such as Prometheus/Grafana, Datadog, Better
Stack, or a cloud provider monitoring service.

## Release Gate

A release candidate is ready only when:

- `npm run check:all` passes for monorepo releases, or `npm run check` passes
  for backend-only releases.
- All critical E2E flows above pass in staging.
- Staging CORS, email, Redis-backed rate limiting, and Socket.IO origins match
  the production topology.
