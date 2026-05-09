# HireNova Client

Next.js App Router frontend for HireNova. The app uses JavaScript/JSX, route
handlers as backend proxies, NextAuth credentials sessions, and Tailwind CSS.

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
- `NEXTAUTH_URL`: frontend origin, for example `http://localhost:3000`.
- `NEXTAUTH_SECRET`: strong random secret used to sign NextAuth tokens.

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

## Structure

- `app/(marketing)`: public marketing and informational pages.
- `app/(auth)`: login and signup pages.
- `app/(jobs)`: job browsing and detail pages.
- `app/(account)`: authenticated user pages.
- `app/(admin)`: admin management pages.
- `app/api`: Next.js route handlers that proxy backend API calls.
- `app/_components`: shared UI and provider components.
- `app/_lib`: shared server-side helpers for auth, env, sessions, and backend calls.

## Deploy on Vercel

Set the same environment variables in the project settings before deploying.
