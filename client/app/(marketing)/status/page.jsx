import { getBackendBaseUrl } from "@lib/env";

async function getHealth() {
    try {
        const response = await fetch(`${getBackendBaseUrl()}/health`, {
            cache: "no-store",
        });
        const body = await response.json().catch(() => ({}));

        return {
            ok: response.ok,
            statusCode: response.status,
            body,
        };
    }
    catch {
        return {
            ok: false,
            statusCode: 503,
            body: { status: "DOWN", message: "Unable to reach backend health check." },
        };
    }
}

function formatUptime(value) {
    if (typeof value !== "number") {
        return "Not available";
    }

    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);

    if (minutes <= 0) {
        return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}

export default async function StatusPage() {
    const health = await getHealth();
    const status = health.body.status ?? (health.ok ? "OK" : "DOWN");

    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-3xl">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          System Status
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Backend Health
        </h1>
        <div className={`mt-8 rounded-lg border p-6 ${health.ok ? "site-success" : "site-danger"}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">API Status</p>
              <p className="mt-2 text-3xl font-semibold">{status}</p>
            </div>
            <div className="text-sm sm:text-right">
              <p>HTTP {health.statusCode}</p>
              <p className="mt-1">Uptime {formatUptime(health.body.uptime)}</p>
            </div>
          </div>
          {health.body.message ? (<p className="mt-4 text-sm">{health.body.message}</p>) : null}
        </div>
      </div>
    </section>);
}
