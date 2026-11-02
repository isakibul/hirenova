# HireNova local load test — 31 October 2026

## Setup

- Production server build (`node dist/index.js`) on port 4100; isolated production Next.js build on port 3100. Existing development processes were left running.
- Intel Core i5-8365U: 4 physical cores, 8 logical CPUs; 7.06 GiB total RAM. Other projects were running, with roughly 6.3 GiB swap already occupied. This was not a dedicated or resource-limited VPS.
- 5,000 synthetic approved/open jobs (roughly 1.2 KB descriptions), 100 employers, populated author references, future expiry dates. Existing model indexes were used.
- Temporary database was created and dropped by the harness. No application database was modified.
- Rate limits disabled only in the test API process. Production environment checks remained enabled. No paid AI calls.
- HTTP keepalive, closed-loop workers with no think time. Each measured phase lasts 15 seconds plus in-flight request completion; 5-second API and web warmups are excluded.
- API mix: one-third job listing, one-third React/Dhaka search with pagination, one-third job detail.
- Web mix: one-third static `/about`, one-third dynamic `/jobs?search=React`, one-third jobs API via Next.js rewrite.
- Successful responses required HTTP 200 plus expected populated data or HTML. This excludes successful-looking error/empty-data pages.

## Measured results

Concurrency means simultaneous in-flight HTTP requests, not signed-in users or daily active users. API and web phases ran separately.

| In-flight requests | API req/s | API p95 | Web mix req/s | Web mix p95 | Errors |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 52 | 444.7 ms | 47.3 | 499.3 ms | 0 |
| 25 | 53.5 | 1156.3 ms | 48.2 | 1432 ms | 0 |
| 50 | 52.9 | 2548.8 ms | 49.4 | 2849.6 ms | 0 |
| 100 | 51 | 4778.5 ms | 48.8 | 5912.9 ms | 0 |

6,382 measured HTTP requests, zero HTTP/content-validation errors. Throughput plateaued around 48–54 requests/second. Increased concurrency mainly increased queuing latency. At 100 concurrency, dynamic job search HTML alone had p95 6.83 seconds.

## Resources and bottleneck

- Test API peak RSS: 389 MiB. Test Next.js peak RSS: 398 MiB. These are observed short-run process values, not memory limits or full production memory requirements.
- API mean CPU over sampled interval: 35.6% of one logical CPU; Next.js: 27.3%. Derived from Linux process CPU ticks (`CLK_TCK=100`), excluding child processes.
- Docker snapshots during load: MongoDB roughly 496–604% CPU (about 5–6 logical CPUs), 73–116 MiB reported memory; Redis about 2–5 MiB; MinIO about 62–64 MiB. Docker memory accounting differs from process RSS and excludes some cache; these snapshots are not exhaustive peaks. MinIO was idle because uploads were excluded.
- MongoDB explain for a 10-item newest-jobs listing: 5,000 index keys examined, 10,000 document examinations (including repeated FETCH stages), blocking SORT, only 10 rows returned. The only jobs indexes were `_id` and `approvalStatus`. Explain ran once during load and adds a small amount of diagnostic overhead.
- These observations identify job filtering/sorting/search queries as the primary bottleneck of this test. Increasing RAM alone does not address this query plan.

## VPS interpretation

- A 4 vCPU / 8 GB RAM / 100 GB NVMe machine remains a reasonable starting configuration for a small deployment, with monitoring and off-host backups. It is not a validated capacity guarantee.
- This laptop had eight logical CPUs, other services and substantial swap usage; a four-vCPU VPS can differ materially in both directions. Do not translate the measured throughput directly to a VPS plan.
- Before targeting 25–100 simultaneous expensive requests, optimize public-job queries, indexes and search, and repeat on the target VPS. Current results do not establish acceptable latency at that load.
- No authenticated employer/admin flows, application writes, bcrypt login bursts, resume parsing/upload, Socket.IO fanout, external AI/email latency, browser JS/assets, TLS/reverse proxy, sustained soak or disk-growth test was performed.
- Run longer fixed-arrival-rate tests from a separate load generator against a staging VPS to establish deployment capacity. A single VPS remains a single point of failure.

## Reproduce

The benchmark script is `server/scripts/load-test.cjs`; it requires installed server/client dependencies, built server code and a separately built frontend. Keep the development frontend build directory separate.

```bash
npm --prefix server run build
```

Create a temporary copy of `client/` excluding `node_modules`, `.next`, and `.git`, and symlink its `node_modules` to the original installed client dependencies. For example:

```bash
python3 - <<'PYCODE'
from pathlib import Path
import shutil
target = Path('/tmp/hirenova-loadtest-client')
shutil.copytree('client', target, ignore=shutil.ignore_patterns('node_modules', '.next', '.git'))
(target / 'node_modules').symlink_to(Path('client/node_modules').resolve(), target_is_directory=True)
PYCODE
BACKEND_API_URL=http://127.0.0.1:4100/api/v1 NEXT_PUBLIC_REALTIME_URL=http://127.0.0.1:4100 npm --prefix /tmp/hirenova-loadtest-client run build
node server/scripts/load-test.cjs /tmp/hirenova-loadtest-client /tmp/hirenova-load-test.json
```

Use an unused temporary directory if it already exists. Ports 3100 and 4100 must be free; MongoDB and Redis must be reachable using `server/.env`. The harness starts and stops its own app processes and deletes only its generated temporary database on normal completion/failure. If forcibly terminated, inspect and clean up its test processes/database manually.

Raw results: [load-test-results.json](load-test-results.json). Diagnostic query plan: [load-test-query-plan.json](load-test-query-plan.json).
