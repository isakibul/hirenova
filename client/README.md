# HireNova Client

Next.js App Router frontend for HireNova. The app uses JavaScript/JSX,
HttpOnly cookie-backed auth from the Express API, direct backend API helpers,
and Tailwind CSS.

## Setup

Install dependencies from this directory:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Required variables:

- `BACKEND_API_URL`: backend API base URL, for example `http://localhost:4000/api/v1`.
- `BACKEND_API_URL`: server-side backend API base URL used by the Next.js
  same-origin rewrite, for example `http://localhost:4000/api/v1`.
- `NEXT_PUBLIC_BACKEND_API_URL`: optional browser-visible backend API base URL.
  Leave it unset for the recommended same-origin `/api/v1` proxy path.
- `NEXT_PUBLIC_DIRECT_BACKEND_API`: optional escape hatch. Leave unset or
  `false` so browser auth uses the same-origin proxy and cookies work reliably.

The backend also needs `CLIENT_URL` set to the same frontend origin. Email
confirmation links are sent to `/confirm-email?token=...` on that URL.

For local email testing, start the root Docker services and open MailHog:

```bash
docker compose up -d mailhog
```

MailHog receives SMTP on `localhost:1025` and exposes the email inbox at
[http://localhost:8025](http://localhost:8025). Newsletter campaigns sent from
the admin newsletter page will appear there.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

`npm run dev` uses the webpack dev bundler because this app lives inside a
nested backend repository and Turbopack currently resolves CSS dependencies from
the parent root in that layout. `npm run dev:turbo` is available if you want to
try the default Next.js dev bundler.

## Scripts

```bash
npm run lint
npm run build
npm run check
npm run test:e2e:local
npm run test:e2e:external
```

`npm run check` runs the unit suite with a client coverage gate, then lint and
the production build. The coverage gate currently covers shared browser helpers
and extracted feature utilities at 80% lines, 70% branches, and 80% functions.
Large interactive pages should move reusable behavior into tested utilities or
smaller components as they evolve.

## End-to-End Tests

The browser E2E suite uses Playwright Chromium, the real Next.js frontend, the
real Express API, and a dedicated Mongo database named `hirenova_e2e`.

Start the local infrastructure first:

```bash
docker compose up -d mongodb redis mailhog
```

Then run the monorepo-local E2E command:

```bash
npm run test:e2e:local
```

The suite seeds deterministic jobseeker, employer, admin, job, application,
notification, and conversation records through the backend test API before each
run. When the client is cut out into its own repository, start the backend
separately with `NODE_ENV=test`, matching `E2E_SEED_SECRET`, a test database,
Redis, and valid test email settings such as
`EMAIL_FROM=noreply@hirenova.test`. Then point Playwright at that backend:

```bash
E2E_API_URL=http://127.0.0.1:4100/api/v1 npm run test:e2e:external
```

## Structure

- `app/(marketing)`: public marketing and informational pages.
- `app/(auth)`: login and signup pages.
- `app/(jobs)`: job browsing and detail pages.
- `app/(account)`: authenticated user pages.
- `app/(admin)`: admin management pages.
- `app/_components/auth/AuthProvider.jsx`: browser auth provider that hydrates
  the current user from the backend HttpOnly auth cookie.
- `app/_components`: shared UI and provider components.
- `app/_lib`: shared helpers for API URLs, backend calls, environment values,
  realtime connections, server-side API calls, validation, and UI formatting.
- `app/<route-group>/<feature>/*Utils.js`: feature-level pure utilities that
  can be unit-tested separately from large interactive components.

## Deploy on Vercel

Set the same environment variables in the project settings before deploying.
