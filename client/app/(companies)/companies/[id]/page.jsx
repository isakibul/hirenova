import Icon from "@components/Icon";
import { requestServerBackend } from "@lib/serverApi";
import { formatDate } from "@lib/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatExperience,
  formatJobType,
  formatSalary,
} from "../../../(jobs)/jobs/jobDisplay";

async function getCompany(id) {
  return requestServerBackend(`/companies/${id}`);
}

function getErrorMessage(response) {
  return response.error ?? response.message ?? "Unable to load this company.";
}

export default async function CompanyProfilePage({ params }) {
  const { id } = await params;
  const result = await getCompany(id);

  if (result.status === 404) {
    notFound();
  }

  const company = result.ok ? result.body.data : undefined;

  if (!result.ok || !company) {
    return (
      <section className="site-section py-12">
        <div className="site-container">
          <div className="site-danger rounded-lg border p-4 text-sm">
            {getErrorMessage(result.body)}
          </div>
        </div>
      </section>
    );
  }

  const jobs = company.jobs ?? [];

  return (
    <section className="site-section py-12">
      <div className="site-container">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <article className="site-border site-card site-elevated rounded-lg border p-5 md:p-6">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Company Profile
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              {company.name}
            </h1>
            <p className="site-muted mt-3 max-w-2xl text-sm leading-6">
              Explore company details and current open roles before applying.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="site-border site-panel rounded-lg border p-4">
                <p className="site-muted text-xs font-medium">Company Size</p>
                <p className="mt-1 text-sm font-semibold">
                  {company.size || "Not specified"}
                </p>
              </div>
              <div className="site-border site-panel rounded-lg border p-4">
                <p className="site-muted text-xs font-medium">Profile</p>
                <p className="mt-1 text-sm font-semibold">
                  {company.username || "Not specified"}
                </p>
              </div>
              <div className="site-border site-panel rounded-lg border p-4">
                <p className="site-muted text-xs font-medium">Updated</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(company.updatedAt)}
                </p>
              </div>
            </div>

            <div className="site-border mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold">About Company</h2>
              <p className="site-muted mt-3 text-sm leading-7">
                {company.about ||
                  "This company has not added an overview yet. Check open roles and visit the company website for more details."}
              </p>
            </div>

            <div className="site-border mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold">Open Roles</h2>
              {jobs.length ? (
                <div className="mt-4 space-y-3">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="site-border site-panel block rounded-lg border p-4 transition hover:border-[var(--site-accent)]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="site-muted mt-1 text-xs">
                            {[job.location || "Remote", formatJobType(job.jobType), formatExperience(job)]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <span className="site-badge w-fit rounded px-2.5 py-1 text-xs font-semibold">
                          {formatSalary(job.salary)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="site-muted mt-3 text-sm">
                  No open roles are listed right now.
                </p>
              )}
            </div>
          </article>

          <aside className="space-y-4">
            <div className="site-border site-card rounded-lg border p-4">
              <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                <Icon name="briefcase" />
              </div>
              <h2 className="mt-4 text-base font-semibold">Company Details</h2>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="site-link mt-3 inline-flex text-sm font-semibold"
                >
                  Visit website
                </a>
              ) : (
                <p className="site-muted mt-3 text-sm">
                  No website has been added.
                </p>
              )}
              <Link
                href={`/jobs?author=${company.id}`}
                className="site-button mt-4 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold"
              >
                View All Jobs
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
