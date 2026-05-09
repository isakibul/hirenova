import Icon from "@components/Icon";
import { getFromBackend } from "@lib/backend";
import { notFound } from "next/navigation";
import JobActions from "./JobActions";
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
    const result = await getFromBackend(`/jobs/${id}`);
    if (result.status === 404) {
        notFound();
    }
    const job = result.ok ? result.body.data : undefined;
    if (!result.ok || !job) {
        return (<section className="px-5 py-12 md:px-[10vw]">
        <div className="mx-auto max-w-3xl">
          <div className="site-danger rounded-lg border p-4 text-sm">
            {getErrorMessage(result.body)}
          </div>
        </div>
      </section>);
    }
    const skills = job.skillsRequired ?? [];
    const postedDate = formatDate(job.createdAt);
    const updatedDate = formatDate(job.updatedAt);
    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
              <span className="site-badge inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold">
                <Icon name="briefcase"/>
                Open Role
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DetailItem label="Location" value={job.location ?? "Remote"}/>
              <DetailItem label="Job Type" value={formatJobType(job.jobType)}/>
              <DetailItem label="Salary" value={formatSalary(job.salary)}/>
              <DetailItem label="Experience" value={formatExperience(job)}/>
            </div>

            <div className="site-border mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="site-muted mt-3 whitespace-pre-line text-sm leading-7">
                {job.description?.trim() ||
            "No detailed description has been added for this role yet."}
              </p>
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
              <JobActions jobId={id}/>
            </div>
          </aside>
        </div>
      </div>
    </section>);
}
