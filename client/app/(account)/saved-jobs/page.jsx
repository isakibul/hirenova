import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getFromBackend } from "@lib/backend";
import { authOptions } from "@lib/auth";
import { getAuthHeaders } from "@lib/session";
import Icon from "@components/Icon";

function formatSalary(value) {
    if (typeof value !== "number") {
        return "Not disclosed";
    }
    return new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}
function formatDate(value) {
    if (!value) {
        return "Not available";
    }
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

export default async function SavedJobsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role !== "jobseeker") {
        redirect("/manage-jobs");
    }

    const result = await getFromBackend("/saved-jobs/me", {
        headers: getAuthHeaders(session.accessToken),
    });
    const savedJobs = result.ok ? (result.body.data ?? []) : [];

    return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <div>
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Shortlist
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Saved Jobs</h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Compare roles you want to revisit before applying.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Saved Roles</p>
            <p className="mt-2 text-2xl font-semibold">{savedJobs.length}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Latest Save</p>
            <p className="mt-2 text-2xl font-semibold">
              {savedJobs[0] ? formatDate(savedJobs[0].createdAt) : "None"}
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Next Step</p>
            <p className="mt-2 text-2xl font-semibold">Apply</p>
          </div>
        </div>

        {!result.ok ? (<div className="site-danger mt-6 rounded-lg border px-4 py-3 text-sm">
            {result.body.error ?? result.body.message ?? "Unable to load saved jobs."}
          </div>) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {savedJobs.length === 0 ? (<div className="site-border site-card rounded-lg border p-6 md:col-span-2">
              <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                <Icon name="bell"/>
              </div>
              <p className="mt-4 font-semibold">No saved jobs yet</p>
              <p className="site-muted mt-2 text-sm leading-6">
                Save interesting roles from job details and build a shortlist.
              </p>
            </div>) : savedJobs.map((savedJob) => {
            const job = savedJob.job ?? {};
            const jobId = job._id ?? job.id;
            return (<Link key={savedJob.id ?? savedJob._id} href={jobId ? `/jobs/${jobId}` : "/jobs"} className="site-border site-card rounded-lg border p-5 transition hover:border-[var(--site-accent)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{job.title ?? "Untitled job"}</p>
                    <p className="site-muted mt-2 text-sm">{job.location ?? "Location not set"}</p>
                  </div>
                  <span className="site-badge shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold">
                    Saved
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="site-muted text-xs font-medium">Salary</p>
                    <p className="mt-1 text-sm font-semibold">{formatSalary(job.salary)}</p>
                  </div>
                  <div>
                    <p className="site-muted text-xs font-medium">Saved</p>
                    <p className="mt-1 text-sm font-semibold">{formatDate(savedJob.createdAt)}</p>
                  </div>
                </div>
                {job.skillsRequired?.length ? (<div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skillsRequired.slice(0, 4).map((skill) => (<span key={`${savedJob.id ?? savedJob._id}-${skill}`} className="site-badge rounded px-2 py-1 text-[11px] font-semibold">
                        {skill}
                      </span>))}
                  </div>) : null}
              </Link>);
        })}
        </div>
      </div>
    </section>);
}
