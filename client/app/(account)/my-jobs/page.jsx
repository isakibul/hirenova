import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
import Icon from "@components/Icon";

function MetricCard({ href, icon, label, value, description }) {
    return (<Link href={href} className="site-border site-card rounded-lg border p-5 transition hover:border-[var(--site-accent)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="site-muted text-xs font-medium">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <span className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
          <Icon name={icon}/>
        </span>
      </div>
      <p className="site-muted mt-4 text-sm leading-6">{description}</p>
    </Link>);
}

export default async function MyJobsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role === "admin" || session.user.role === "superadmin") {
        redirect("/manage-jobs");
    }
    if (session.user.role === "employer") {
        redirect("/manage-jobs");
    }
    const result = await getFromBackend("/dashboard", {
        headers: getAuthHeaders(session.accessToken),
    });
    const summary = result.ok ? result.body.data : {};
    return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <div>
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Job Workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Jobs</h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Track applications, revisit saved roles, and keep your next move organized.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <MetricCard href="/applications" icon="file" label="Applications" value={summary.totalApplications ?? 0} description="Submitted roles and employer review status."/>
          <MetricCard href="/saved-jobs" icon="bell" label="Saved Jobs" value={summary.totalSavedJobs ?? 0} description="Roles you marked for later comparison."/>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="site-border site-card rounded-lg border p-5">
            <h2 className="font-semibold">Recommended Next Steps</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link href="/profile" className="site-border site-field rounded-lg border p-4 text-sm font-semibold">
                Complete profile
              </Link>
              <Link href="/saved-jobs" className="site-border site-field rounded-lg border p-4 text-sm font-semibold">
                Review saved roles
              </Link>
              <Link href="/applications" className="site-border site-field rounded-lg border p-4 text-sm font-semibold">
                Check statuses
              </Link>
            </div>
          </div>
          <div className="site-border site-panel rounded-lg border p-5">
            <p className="site-muted text-xs font-medium">Account</p>
            <p className="mt-2 text-lg font-semibold">{session.user.email ?? session.user.name}</p>
            <p className="site-muted mt-2 text-sm leading-6">
              Jobseeker workspace is synced with your applications and saves.
            </p>
          </div>
        </div>
      </div>
    </section>);
}
