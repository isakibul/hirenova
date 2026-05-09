import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getFromBackend } from "@lib/backend";
import { authOptions } from "@lib/auth";
import { getAuthHeaders } from "@lib/session";

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

    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">Saved Jobs</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {savedJobs.length === 0 ? (<div className="site-border site-card rounded-lg border p-6 md:col-span-2">
              <p className="font-semibold">No saved jobs yet</p>
              <Link href="/jobs" className="site-button mt-4 inline-flex rounded-md px-4 py-2 text-sm font-semibold">
                Browse Jobs
              </Link>
            </div>) : savedJobs.map((savedJob) => {
            const job = savedJob.job ?? {};
            const jobId = job._id ?? job.id;
            return (<Link key={savedJob.id ?? savedJob._id} href={jobId ? `/jobs/${jobId}` : "/jobs"} className="site-border site-card rounded-lg border p-5 transition hover:border-[var(--site-accent)]">
                <p className="text-lg font-semibold">{job.title ?? "Untitled job"}</p>
                <p className="site-muted mt-2 text-sm">{job.location ?? "Location not set"}</p>
                <p className="mt-4 text-sm font-semibold">{formatSalary(job.salary)}</p>
              </Link>);
        })}
        </div>
      </div>
    </section>);
}
