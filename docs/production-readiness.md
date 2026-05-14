# Production Readiness

This checklist captures the minimum proof points for shipping HireNova beyond
local development.

## Required Checks

Run these before deploying:

```bash
npm run check
```

The root check runs backend unit tests, client unit tests, client lint, and the
client production build.

## Seed Data

For local QA, start MongoDB and Redis, copy `.env.example` to `.env`, then run:

```bash
npm run seed
```

Seeded users:

- `admin@hirenova.local`
- `employer@hirenova.local`
- `jobseeker@hirenova.local`

The default password is `HireNova123`. Override it with
`SEED_USER_PASSWORD=...` when needed.

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
- `REDIS_HOST`
- `REDIS_PORT`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `ACCESS_TOKEN_SECRET`
- `EMAIL_SECRET`
- `OBSERVABILITY_HASH_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `RATE_LIMIT_STORE=redis`

Keep `CLIENT_URL` and `CORS_ORIGINS` pinned to the deployed frontend origin.
Use strong, unique secrets for auth, email verification, and observability
hashing. Configure a real SMTP provider before enabling newsletter campaigns.

## Release Gate

A release candidate is ready only when:

- `npm run check` passes.
- The seed script can populate a clean staging database.
- All critical E2E flows above pass in staging.
- Staging CORS, email, Redis-backed rate limiting, and Socket.IO origins match
  the production topology.
