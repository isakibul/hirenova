import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getFromBackend } from "@lib/backend";
import { authOptions } from "@lib/auth";
import { getAuthHeaders } from "@lib/session";

function formatStatus(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Submitted";
}

export default async function ApplicationsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role !== "jobseeker") {
        redirect("/manage-jobs");
    }

    const result = await getFromBackend("/applications/me", {
        headers: getAuthHeaders(session.accessToken),
    });
    const applications = result.ok ? (result.body.data ?? []) : [];

    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
        <div className="mt-6 space-y-3">
          {applications.length === 0 ? (<div className="site-border site-card rounded-lg border p-6">
              <p className="font-semibold">No applications yet</p>
              <Link href="/jobs" className="site-button mt-4 inline-flex rounded-md px-4 py-2 text-sm font-semibold">
                Browse Jobs
              </Link>
            </div>) : applications.map((application) => {
            const job = application.job ?? {};
            const jobId = job._id ?? job.id;
            return (<div key={application.id ?? application._id} className="site-border site-card rounded-lg border p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{job.title ?? "Untitled job"}</p>
                    <p className="site-muted mt-1 text-sm">{job.location ?? "Location not set"}</p>
                  </div>
                  <span className="site-badge w-fit rounded-md px-3 py-1.5 text-xs font-semibold">
                    {formatStatus(application.status)}
                  </span>
                </div>
                {jobId ? (<Link href={`/jobs/${jobId}`} className="site-link mt-4 inline-flex text-sm font-semibold">
                    View job
                  </Link>) : null}
              </div>);
        })}
        </div>
      </div>
    </section>);
}
