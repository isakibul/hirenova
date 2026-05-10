import Icon from "@components/Icon";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatStatus(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Submitted";
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
function getStatusClass(status) {
  if (status === "hired" || status === "shortlisted") {
    return "site-success";
  }
  if (status === "rejected") {
    return "site-danger";
  }
  return "site-badge";
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
  const activeCount = applications.filter(
    (application) => !["rejected", "hired"].includes(application.status),
  ).length;

  return (
    <section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <div>
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Jobseeker
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Applications
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Follow each role from submission through final decision.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Total</p>
            <p className="mt-2 text-2xl font-semibold">{applications.length}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Active</p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Latest</p>
            <p className="mt-2 text-2xl font-semibold">
              {applications[0] ? formatDate(applications[0].createdAt) : "None"}
            </p>
          </div>
        </div>

        {!result.ok ? (
          <div className="site-danger mt-6 rounded-lg border px-4 py-3 text-sm">
            {result.body.error ??
              result.body.message ??
              "Unable to load applications."}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {applications.length === 0 ? (
            <div className="site-border site-card rounded-lg border p-6">
              <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                <Icon name="file" />
              </div>
              <p className="mt-4 font-semibold">No applications yet</p>
              <p className="site-muted mt-2 text-sm leading-6">
                Apply to roles that match your profile and they will appear
                here.
              </p>
            </div>
          ) : (
            applications.map((application) => {
              const job = application.job ?? {};
              const jobId = job._id ?? job.id;
              return (
                <div
                  key={application.id ?? application._id}
                  className="site-border site-card rounded-lg border p-5"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_180px] md:items-start">
                    <div>
                      <p className="text-lg font-semibold">
                        {job.title ?? "Untitled job"}
                      </p>
                      <p className="site-muted mt-1 text-sm">
                        {job.location ?? "Location not set"} · Applied{" "}
                        {formatDate(application.createdAt)}
                      </p>
                      {application.coverLetter ? (
                        <p className="site-muted mt-3 line-clamp-2 text-sm leading-6">
                          {application.coverLetter}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`w-fit rounded-md border px-3 py-1.5 text-xs font-semibold ${getStatusClass(application.status)}`}
                    >
                      {formatStatus(application.status)}
                    </span>
                  </div>
                  {jobId ? (
                    <Link
                      href={`/jobs/${jobId}`}
                      className="site-link mt-4 inline-flex text-sm font-semibold"
                    >
                      View Job
                    </Link>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
