import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
import Icon from "@components/Icon";

function Metric({ label, value, helper, icon = "chart" }) {
    return (<div className="site-border site-card rounded-lg border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="site-muted text-xs font-medium">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value ?? 0}</p>
        </div>
        <span className="site-badge flex h-10 w-10 items-center justify-center rounded-md">
          <Icon name={icon}/>
        </span>
      </div>
      {helper ? <p className="site-muted mt-3 text-xs leading-5">{helper}</p> : null}
    </div>);
}

function formatDate(value) {
    if (!value) {
        return "No date";
    }
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

function isExpired(job) {
    return job.expiresAt && new Date(job.expiresAt) <= new Date();
}

function getJobStatus(job) {
    if (job.status === "closed") {
        return "Closed";
    }
    if (isExpired(job)) {
        return "Expired";
    }
    return "Open";
}

function getStatusClass(job) {
    if (job.status === "closed" || isExpired(job)) {
        return "site-danger";
    }
    return "site-success";
}

function ProgressBar({ value }) {
    const width = Math.max(0, Math.min(Number(value) || 0, 100));
    return (<div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--site-border)]">
      <div className="h-full rounded-full bg-[var(--site-button-bg)]" style={{ width: `${width}%` }}/>
    </div>);
}

function QuickAction({ href, icon, title, description }) {
    return (<Link href={href} className="site-border site-panel flex items-center gap-3 rounded-lg border p-4 transition hover:border-[var(--site-accent)]">
      <span className="site-border site-card flex h-10 w-10 shrink-0 items-center justify-center rounded-md border">
        <Icon name={icon}/>
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="site-muted mt-1 block text-xs leading-5">{description}</span>
      </span>
    </Link>);
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const result = await getFromBackend("/dashboard", {
        headers: getAuthHeaders(session.accessToken),
    });
    const summary = result.ok ? result.body.data : {};
    const isAdmin = session.user.role === "admin";
    const jobsResult = !isAdmin
        ? await getFromBackend("/jobs", {
            headers: getAuthHeaders(session.accessToken),
            params: {
                author: session.user.id,
                include_closed: "true",
                limit: 5,
                page: 1,
                sort_by: "updatedAt",
                sort_type: "dsc",
            },
        })
        : null;
    const recentJobs = jobsResult?.ok ? (jobsResult.body.data ?? []) : [];
    const totalJobs = summary.totalJobs ?? 0;
    const totalApplications = summary.totalApplications ?? 0;
    const openJobs = summary.openJobs ?? 0;
    const closedJobs = summary.closedJobs ?? 0;
    const expiredJobs = summary.expiredJobs ?? 0;
    const inactiveJobs = closedJobs + expiredJobs;
    const applicationRate = totalJobs ? Math.round(totalApplications / totalJobs) : 0;
    const openRate = totalJobs
        ? Math.round((openJobs / totalJobs) * 100)
        : 0;

    if (!isAdmin) {
        return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Employer
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Hiring Dashboard
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Monitor your active roles, review candidate movement, and jump back
              into the work that keeps hiring moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/manage-jobs" className="site-button inline-flex rounded-md px-4 py-2 text-sm font-semibold">
              Manage Jobs
            </Link>
            <Link href="/manage-jobs?mode=create" className="rounded-md border border-[var(--site-border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--site-accent)]">
              Post Job
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Posted Jobs" value={totalJobs} helper="Total roles created by your account." icon="briefcase"/>
          <Metric label="Applications" value={totalApplications} helper="Candidates submitted across your jobs." icon="file"/>
          <Metric label="Open Roles" value={openJobs} helper="Active roles accepting applicants." icon="check"/>
          <Metric label="Avg. Applications" value={applicationRate} helper="Applications per posted role." icon="chart"/>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="site-border site-card rounded-lg border">
            <div className="flex flex-col gap-3 border-b border-[var(--site-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recent Job Activity</h2>
                <p className="site-muted mt-1 text-sm">
                  Latest roles updated in your workspace.
                </p>
              </div>
              <Link href="/manage-jobs" className="site-link text-sm font-semibold">
                View all
              </Link>
            </div>

            <div className="divide-y divide-[var(--site-border)]">
              {recentJobs.length === 0 ? (<div className="p-6">
                  <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                    <Icon name="briefcase"/>
                  </div>
                  <p className="mt-4 font-semibold">No jobs posted yet</p>
                  <p className="site-muted mt-2 text-sm leading-6">
                    Create your first role to start collecting applications.
                  </p>
                </div>) : recentJobs.map((job) => (<div key={job.id} className="grid gap-4 p-5 md:grid-cols-[1fr_160px_110px] md:items-center">
                  <div className="min-w-0">
                    <Link href={`/jobs/${job.id}`} className="font-semibold transition hover:text-[var(--site-accent)]">
                      {job.title}
                    </Link>
                    <p className="site-muted mt-1 text-sm">
                      {job.location || "Location not set"} · Updated {formatDate(job.updatedAt)}
                    </p>
                    {job.expiresAt ? (<p className="site-muted mt-1 text-xs">
                        Expires {formatDate(job.expiresAt)}
                      </p>) : null}
                  </div>
                  <span className={`w-fit rounded-md border px-3 py-1.5 text-xs font-semibold ${getStatusClass(job)}`}>
                    {getJobStatus(job)}
                  </span>
                  <Link href={`/manage-jobs/${job.id}/applications`} className="site-link text-sm font-semibold">
                    Applicants
                  </Link>
                </div>))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="site-border site-card rounded-lg border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Pipeline Health</h2>
                  <p className="site-muted mt-1 text-sm leading-6">
                    Open-role share from your latest postings.
                  </p>
                </div>
                <span className="site-badge rounded-md px-2.5 py-1 text-xs font-semibold">
                  {openRate}%
                </span>
              </div>
              <ProgressBar value={openRate}/>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="site-border site-panel rounded-lg border p-3">
                  <p className="site-muted text-xs">Open</p>
                  <p className="mt-1 text-xl font-semibold">{openJobs}</p>
                </div>
                <div className="site-border site-panel rounded-lg border p-3">
                  <p className="site-muted text-xs">Closed/Expired</p>
                  <p className="mt-1 text-xl font-semibold">{inactiveJobs}</p>
                </div>
              </div>
              {expiredJobs ? (<p className="site-muted mt-3 text-xs leading-5">
                  {expiredJobs} role{expiredJobs === 1 ? "" : "s"} expired and may
                  need attention.
                </p>) : null}
            </section>

            <section className="site-border site-card rounded-lg border p-5">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <div className="mt-4 space-y-3">
                <QuickAction href="/manage-jobs" icon="briefcase" title="Review job board" description="Edit postings, close roles, and check status."/>
                <QuickAction href="/notifications" icon="bell" title="Open notifications" description="See application and job updates."/>
                <QuickAction href="/profile" icon="user" title="Company profile" description="Keep employer details ready for candidates."/>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>);
    }

    return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              {isAdmin ? "Admin" : "Employer"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <Link href={isAdmin ? "/manage-users" : "/manage-jobs"} className="site-button inline-flex rounded-md px-4 py-2 text-sm font-semibold">
            {isAdmin ? "Manage Users" : "Manage Jobs"}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Users" value={summary.totalUsers} icon="user"/>
          <Metric label="Jobs" value={summary.totalJobs} icon="briefcase"/>
          <Metric label="Applications" value={summary.totalApplications} icon="file"/>
          <Metric label="Saved Jobs" value={summary.totalSavedJobs} icon="bell"/>
          <Metric label="Pending Users" value={summary.pendingUsers} icon="target"/>
          <Metric label="Active Users" value={summary.activeUsers} icon="check"/>
          <Metric label="Suspended Users" value={summary.suspendedUsers} icon="x"/>
        </div>
      </div>
    </section>);
}
