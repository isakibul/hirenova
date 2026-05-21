# HireNova

HireNova is a production-style full-stack hiring platform with role-based
workflows for jobseekers, employers, admins, and superadmins. It includes job
posting, applications, AI-assisted job matching, AI applicant ranking, resume
object storage, notifications, messaging, newsletters, account settings, and
automated tests.

This project is built as a full-stack portfolio application, but the structure
is intentionally close to a real product codebase.

## Highlights

- Multi-role authentication and authorization.
- Jobseeker job search, smart matching, applications, saved jobs, profile, and
  resume upload.
- Employer job management, applicant review, status updates, delete flow, AI
  ranking, applicant profile/resume links.
- Admin user management, job approval, candidates, newsletters, dashboard, and
  system monitor.
- HttpOnly cookie auth with protected API/client flows.
- S3-compatible resume storage through Docker MinIO locally.
- MailHog email preview for confirmation, reset, and newsletter emails.
- Realtime-ready notifications/messages with Socket.IO.
- Backend tests, frontend utility tests, Playwright E2E, accessibility, and
  visual regression coverage.
- Docker Compose for local infrastructure.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Cache/realtime support | Redis |
| Object storage | MinIO locally, S3-compatible in production |
| Email | Nodemailer, MailHog locally |
| Realtime | Socket.IO |
| AI | OpenRouter-compatible chat completions |
| Testing | Node test runner, Playwright, ESLint |

## Repository Structure

```txt
hirenova/
  client/              # Next.js frontend
  src/                 # Express backend
  test/                # backend tests
  docs/                # production/readiness notes
  docker-compose.yml   # local infrastructure
  .env.example         # backend env template
  package.json         # backend/root scripts
```

Read more:

- Backend docs: [`src/README.md`](src/README.md)
- Client docs: [`client/README.md`](client/README.md)
- Production notes: [`docs/production-readiness.md`](docs/production-readiness.md)

## Local Setup

### 1. Install Dependencies

From the repository root:

```bash
npm install
npm --prefix client install
```

### 2. Create Environment Files

Backend:

```bash
cp .env.example .env
```

Client:

```bash
cp client/.env.example client/.env.local
```

### 3. Start Infrastructure

```bash
docker compose up -d mongodb redis mailhog minio minio-init
```

Useful local UIs:

| Service | URL |
| --- | --- |
| Mongo Express | `http://localhost:8081` |
| Redis Commander | `http://localhost:8082` |
| MailHog | `http://localhost:8025` |
| MinIO Console | `http://localhost:9001` |

MinIO local credentials:

```txt
username: hirenova
password: hirenova-minio-secret
bucket: hirenova-resumes
```

### 4. Start Backend

```bash
npm run dev
```

Backend API:

```txt
http://localhost:4000/api/v1
```

### 5. Start Client

In another terminal:

```bash
npm run dev:client
```

Frontend:

```txt
http://localhost:3000
```

## Environment Overview

Backend variables live in `.env`.

Important backend groups:

- Database: `DATABASE_CONNECTION_URL`, `DB_NAME`
- Redis: `REDIS_URL` or `REDIS_HOST` / `REDIS_PORT`
- Auth: `ACCESS_TOKEN_SECRET`, `EMAIL_SECRET`, `CSRF_SECRET`
- Client/CORS: `CLIENT_URL`, `CORS_ORIGINS`
- Email: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_FROM`
- Storage: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- AI: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`

Client variables live in `client/.env.local`.

Recommended local client values:

```bash
NEXT_PUBLIC_REALTIME_URL=http://localhost:4000
BACKEND_API_URL=http://localhost:4000/api/v1
```

## Scripts

Root/backend:

```bash
npm run dev
npm start
npm test
npm run check:backend
npm run check
npm run check:all
```

Client:

```bash
npm --prefix client run dev
npm --prefix client run lint
npm --prefix client run build
npm --prefix client run test
npm --prefix client run check
npm --prefix client run test:e2e:local
```

## Testing

Backend tests:

```bash
npm test
```

Backend coverage gate:

```bash
npm run check:backend
```

Client lint/build/unit coverage:

```bash
npm --prefix client run check
```

Playwright E2E:

```bash
docker compose up -d mongodb redis mailhog minio minio-init
npm --prefix client run test:e2e:local
```

Full available check:

```bash
npm run check:all
```

## Main Product Flows

Jobseeker:

- Signup/login
- Confirm email
- Browse and filter jobs
- Save jobs
- Apply with a cover letter
- Upload and parse resumes
- View applications and notifications
- Manage profile/settings/messages

Employer:

- Create and manage job listings
- Send jobs for admin approval
- Review applicants
- Turn on AI ranking per job
- Update application statuses
- View applicant profile/resume
- Delete applications when needed
- Message candidates

Admin/superadmin:

- Approve or decline jobs
- Manage users
- Review candidates
- Manage newsletters
- Monitor system health
- Access dashboards and audit-friendly workflows

## AI Features

HireNova includes two AI-assisted workflows:

- Smart job recommendations for jobseekers.
- Applicant ranking for employers/admins reviewing a job.

Both features are designed as decision-support tools. Human review remains part
of the hiring workflow.

## Resume Storage

Resume files are stored in S3-compatible object storage. Locally, Docker Compose
runs MinIO and creates the `hirenova-resumes` bucket automatically.

For production, point the same S3 variables at AWS S3, Cloudflare R2,
DigitalOcean Spaces, or another S3-compatible provider.

## Demo and Portfolio Pitch

Short description:

> HireNova is a full-stack hiring platform with jobseeker, employer, and admin
> workflows. It includes job posting, applications, AI smart matching, AI
> applicant ranking, resume object storage, notifications, messaging, and
> automated tests.

What it demonstrates:

- Product thinking across multiple roles
- Full-stack feature ownership
- API design and protected workflows
- File/object storage integration
- AI integration
- Docker-based local infrastructure
- Testing and production-readiness practices

## Deployment Notes

Recommended production services:

- Frontend: Vercel, Netlify, or containerized Node hosting
- Backend: Render, Fly.io, Railway, AWS, DigitalOcean, or similar
- Database: MongoDB Atlas
- Redis: managed Redis
- Object storage: S3/R2/Spaces
- Email: Resend, SendGrid, Postmark, SES, or similar

Before deploying:

1. Replace all secrets from `.env.example`.
2. Set `CLIENT_URL` and `CORS_ORIGINS` to the deployed frontend origin.
3. Set production `BACKEND_API_URL` in the client.
4. Use managed object storage instead of local MinIO.
5. Disable or protect all test-only seed routes.
6. Run backend tests, client checks, and E2E smoke tests.

## License

ISC
