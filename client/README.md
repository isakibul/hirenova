# HireNova Client

Next.js App Router frontend for HireNova. The client provides public job
browsing, auth flows, jobseeker account tools, employer job/application
management, admin operations, realtime menus, settings, and AI-assisted hiring
workflows.

## Tech Stack

- Next.js 16 App Router
- React 19
- JavaScript/JSX
- Tailwind CSS 4
- Axios-backed API helpers
- Socket.IO client
- Playwright E2E tests
- Node test runner for extracted utilities

## Setup

Install client dependencies:

```bash
cd client
npm install
```

Create the client env file:

```bash
cp .env.example .env.local
```

Recommended local values:

```bash
NEXT_PUBLIC_REALTIME_URL=http://localhost:4000
BACKEND_API_URL=http://localhost:4000/api/v1
```

Leave these unset unless you intentionally need direct browser-to-backend
requests:

```bash
NEXT_PUBLIC_BACKEND_API_URL=
NEXT_PUBLIC_DIRECT_BACKEND_API=false
```

The recommended path is the same-origin `/api/v1` proxy. It keeps browser auth
cookie behavior reliable.

## Development

Start the backend first from the repository root:

```bash
npm run dev
```

Start the client:

```bash
cd client
npm run dev
```

Open `http://localhost:3000`.

The default dev script uses webpack:

```bash
npm run dev
```

Turbopack is available if needed:

```bash
npm run dev:turbo
```

## Scripts

```bash
npm run lint
npm run build
npm run test
npm run test:coverage
npm run check
npm run test:e2e
npm run test:e2e:local
npm run test:e2e:external
```

`npm run check` runs:

1. client utility tests with coverage
2. ESLint
3. production build

## Structure

```txt
client/app/
  (marketing)/
  (auth)/
  (jobs)/
  (account)/
  (admin)/
  _components/
  _lib/
  _fonts/
client/E2E/
client/test/
```

Route groups:

- `(marketing)`: landing, feature, company, and public pages.
- `(auth)`: signup, login, forgot password, and reset password.
- `(jobs)`: job search, filters, detail page, apply/save actions.
- `(account)`: profile, applications, saved jobs, messages, settings.
- `(admin)`: admin/employer dashboards, candidates, users, jobs, newsletters,
  system monitor, application review.

Shared areas:

- `_components`: reusable UI, layout, auth, theme, modals, menus, forms.
- `_lib`: API clients, URL helpers, storage helpers, validation, realtime, UI
  formatting.
- `test`: utility and extracted logic tests.
- `E2E`: Playwright browser coverage.

## API Layer

The client uses centralized helpers:

- `app/_lib/clientApi.js`: browser requests through Axios.
- `app/_lib/serverApi.js`: server-side backend requests.
- `app/_lib/url.js`: API URL and same-origin proxy behavior.
- `app/_lib/realtime.js`: Socket.IO connection setup.

Prefer these helpers over raw `fetch` or ad hoc URL construction.

## Auth and Theme

Auth is backed by HttpOnly cookies from the Express API. The `AuthProvider`
hydrates the current user from `/auth/session`.

Theme state lives in `ThemeProvider` and persists to local storage. Account
settings can also save the preferred theme to the backend.

## E2E Tests

The E2E suite uses:

- real Next.js app
- real Express backend
- MongoDB test database
- deterministic seed endpoint mounted only under `NODE_ENV=test`

Start local infrastructure:

```bash
docker compose up -d mongodb redis mailhog minio minio-init
```

Run E2E from `client/`:

```bash
npm run test:e2e:local
```

For external backend mode:

```bash
E2E_API_URL=http://127.0.0.1:4100/api/v1 npm run test:e2e:external
```

## Accessibility and Visual Checks

The suite includes accessibility and visual regression coverage. Keep visible
text, controls, and status messages accessible by role/name where possible so
Playwright and assistive technologies can interact with the app reliably.

## Deployment Notes

Set these in the hosting provider:

- `BACKEND_API_URL`
- `NEXT_PUBLIC_REALTIME_URL`
- optionally `NEXT_PUBLIC_BACKEND_API_URL`
- optionally `NEXT_PUBLIC_DIRECT_BACKEND_API`

The backend must set:

- `CLIENT_URL` to the deployed frontend origin
- `CORS_ORIGINS` to the same frontend origin

If deploying to Vercel, keep the same-origin API rewrite approach unless there
is a specific reason to expose direct browser backend calls.
