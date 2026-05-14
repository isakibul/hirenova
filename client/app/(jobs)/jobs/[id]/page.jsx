import FormattedText from "@components/FormattedText";
import Icon from "@components/Icon";
import { notFound } from "next/navigation";
import JobActions from "./JobActions";
function getBackendApiUrl() {
    return (process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") ??
        "http://localhost:4000/api/v1");
}
async function getJob(id) {
    const response = await fetch(`${getBackendApiUrl()}/jobs/${id}`, {
        cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    return { body, ok: response.ok, status: response.status };
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
function formatJobType(value) {
    if (!value) {
        return "Not specified";
    }
    return value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
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
function formatExperience(job) {
    const min = typeof job.experienceMin === "number"
        ? job.experienceMin
        : job.experienceRequired;
    const max = job.experienceMax;
    if (typeof min === "number" && typeof max === "number") {
        return min === max ? `${min} years` : `${min}-${max} years`;
    }
    if (typeof min === "number") {
        return `${min}+ years`;
    }
    if (typeof max === "number") {
        return `Up to ${max} years`;
    }
    return "Not specified";
}
function getJobStatus(job) {
    if (job.approvalStatus === "pending") {
        return "Under Review";
    }
    if (job.approvalStatus === "declined") {
        return "Declined";
    }
    if (job.expiresAt && new Date(job.expiresAt) <= new Date()) {
        return "Expired";
    }
    return job.status === "closed" ? "Closed" : "Open Role";
}
function getErrorMessage(response) {
    return response.error ?? response.message ?? "Unable to load this job.";
}
function DetailItem({ label, value, }) {
    return (<div className="site-border site-panel rounded-lg border p-4">
      <p className="site-muted text-xs font-medium">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>);
}
export default async function JobDetailsPage({ params }) {
    const { id } = await params;
    const result = await getJob(id);
    if (result.status === 404) {
        notFound();
    }
    const job = result.ok ? result.body.data : undefined;
    if (!result.ok || !job) {
        return (<section className="site-section py-12">
        <div className="site-container">
          <div className="site-danger rounded-lg border p-4 text-sm">
            {getErrorMessage(result.body)}
          </div>
        </div>
      </section>);
    }
    const skills = job.skillsRequired ?? [];
    const postedDate = formatDate(job.createdAt);
    const updatedDate = formatDate(job.updatedAt);
    const jobStatus = getJobStatus(job);
    const isClosed = jobStatus !== "Open Role";
    return (<section className="site-section py-12">
      <div className="site-container">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <article className="site-border site-card site-elevated rounded-lg border p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                  Job Details
                </p>
                <h1 className="mt-5 text-3xl font-semibold leading-tight">
                  {job.title ?? "Untitled job"}
                </h1>
                <p className="site-muted mt-3 text-sm">
                  Posted {postedDate} · Updated {updatedDate}
                </p>
              </div>
              <span className={`inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold ${isClosed ? "site-danger" : "site-success"}`}>
                <Icon name="briefcase"/>
                {jobStatus}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DetailItem label="Location" value={job.location ?? "Remote"}/>
              <DetailItem label="Job Type" value={formatJobType(job.jobType)}/>
              <DetailItem label="Salary" value={formatSalary(job.salary)}/>
              <DetailItem label="Experience" value={formatExperience(job)}/>
              <DetailItem label="Expires" value={job.expiresAt ? formatDate(job.expiresAt) : "No expiry set"}/>
            </div>

            <div className="site-border mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <div className="site-muted mt-3 text-sm">
                <FormattedText value={job.description} emptyText="No detailed description has been added for this role yet."/>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="site-border site-card rounded-lg border p-4">
              <h2 className="text-base font-semibold">Skills Required</h2>
              {skills.length > 0 ? (<div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (<span key={`${job._id ?? job.id ?? id}-${skill}`} className="site-badge rounded px-2.5 py-1.5 text-xs font-semibold">
                      {skill}
                    </span>))}
                </div>) : (<p className="site-muted mt-2 text-sm">
                  No skills have been listed.
                </p>)}
            </div>

            <div className="site-border site-card rounded-lg border p-4">
              <h2 className="text-base font-semibold">Ready to Apply?</h2>
              <p className="site-muted mt-2 text-sm leading-6">
                Review the role details and prepare your profile before
                applying.
              </p>
              <JobActions jobId={id} isClosed={isClosed}/>
            </div>
          </aside>
        </div>
      </div>
    </section>);
}
