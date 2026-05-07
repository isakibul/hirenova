import Icon from "@/app/components/Icon";
import { getFromBackend } from "@/app/lib/backend";
import Link from "next/link";

type JobSummary = {
  id: string;
  title: string;
  location?: string;
  jobType?: string;
  salary?: number;
  experienceRequired?: number;
  skillsRequired?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type JobsResponse = {
  data?: JobSummary[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPage: number;
  };
  message?: string;
  error?: string;
};

type JobsPageProps = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

function formatDate(value?: string) {
  if (!value) {
    return "Recently posted";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(response: JobsResponse) {
  return response.error ?? response.message ?? "Unable to load jobs right now.";
}

function formatJobType(value?: string) {
  if (!value) {
    return null;
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSalary(value?: number) {
  if (typeof value !== "number") {
    return null;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search?.trim() ?? "";
  const result = await getFromBackend<JobsResponse>("/jobs", {
    params: {
      search: search || undefined,
      limit: 12,
      page: 1,
    },
  });

  const jobs = result.ok ? result.body.data ?? [] : [];
  const pagination = result.body.pagination;

  return (
    <section className="px-5 md:px-[10vw] py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Jobs
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">
          Explore roles matched to your next move
        </h1>
        <p className="site-muted mx-auto mt-4 max-w-xl text-sm leading-6">
          Browse open roles published through HireNova and search by job title.
        </p>
      </div>

      <div className="site-border site-card mx-auto mt-8 max-w-3xl rounded-xl border p-3">
        <form
          action="/jobs"
          className="site-panel site-border mb-3 grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_120px]"
        >
          <label className="relative">
            <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Icon name="search" />
            </span>
            <input
              name="search"
              defaultValue={search}
              className="site-field w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
              placeholder="Search job title"
            />
          </label>
          <button className="site-button rounded-md px-3 py-2 text-sm font-medium">
            Search
          </button>
        </form>

        {pagination ? (
          <p className="site-muted mb-3 px-1 text-xs">
            Showing {jobs.length} of {pagination.totalItems} jobs
            {search ? ` for "${search}"` : ""}
          </p>
        ) : null}

        <div className="space-y-3">
          {!result.ok ? (
            <p className="site-danger rounded-md border px-3 py-2 text-sm">
              {getErrorMessage(result.body)}
            </p>
          ) : null}

          {result.ok && jobs.length === 0 ? (
            <div className="site-border site-panel rounded-lg border p-5 text-center">
              <p className="text-sm font-semibold">No jobs found</p>
              <p className="site-muted mt-1 text-xs">
                Try a different job title or clear the search.
              </p>
            </div>
          ) : null}

          {jobs.map((job) => {
            const postedDate = formatDate(job.createdAt);
            const updatedDate = formatDate(job.updatedAt);
            const jobDetails = [
              job.location,
              formatJobType(job.jobType),
              formatSalary(job.salary),
              typeof job.experienceRequired === "number"
                ? `${job.experienceRequired}+ years`
                : null,
            ].filter(Boolean);

            return (
              <article
                key={job.id}
                className="site-border site-panel flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex gap-3">
                  <span className="site-badge mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                    <Icon name="briefcase" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">{job.title}</h2>
                    <p className="site-muted mt-1 text-xs">
                      {jobDetails.length > 0
                        ? jobDetails.join(" · ")
                        : `Posted ${postedDate} · Updated ${updatedDate}`}
                    </p>
                    {job.skillsRequired && job.skillsRequired.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {job.skillsRequired.slice(0, 4).map((skill) => (
                          <span
                            key={`${job.id}-${skill}`}
                            className="site-badge rounded px-2 py-1 text-[11px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="site-button inline-flex justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition"
                >
                  View Details
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
