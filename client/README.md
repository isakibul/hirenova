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
- `NEXT_PUBLIC_BACKEND_API_URL`: browser-visible backend API base URL, for
  example `http://localhost:4000/api/v1`.

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
```

## End-to-End Tests

The browser E2E suite uses Playwright Chromium, the real Next.js frontend, the
real Express API, and a dedicated Mongo database named `hirenova_e2e`.

Start the local infrastructure first:

```bash
docker compose up -d mongodb redis mailhog
```

Then run:

```bash
npm run test:e2e
```

The suite seeds deterministic jobseeker, employer, admin, job, application,
notification, and conversation records before each run.

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
  realtime connections, validation, and UI formatting.

## Deploy on Vercel

Set the same environment variables in the project settings before deploying.
