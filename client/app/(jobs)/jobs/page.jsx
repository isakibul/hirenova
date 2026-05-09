import Icon from "@components/Icon";
import SelectField from "@components/forms/SelectField";
import { getFromBackend } from "@lib/backend";
import Link from "next/link";
import ClearFiltersButton from "./ClearFiltersButton";
import ExperienceRangeFilter from "./ExperienceRangeFilter";
import SalaryRangeFilter from "./SalaryRangeFilter";
const jobTypes = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "remote", label: "Remote" },
  { value: "contract", label: "Contract" },
];
const sortOptions = [
  { value: "createdAt:dsc", label: "Newest" },
  { value: "createdAt:asc", label: "Oldest" },
  { value: "salary:dsc", label: "Highest Salary" },
  { value: "salary:asc", label: "Lowest Salary" },
  { value: "experienceMin:asc", label: "Entry Friendly" },
  { value: "title:asc", label: "Title A-Z" },
];
const limitOptions = [
  { value: "10", label: "10 Jobs" },
  { value: "20", label: "20 Jobs" },
  { value: "30", label: "30 Jobs" },
];
function getParam(params, key) {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}
function getParamList(params, key) {
  const value = params[key];
  if (!value) {
    return [];
  }
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}
function getPositiveNumber(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}
function formatDate(value) {
  if (!value) {
    return "Recently posted";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
function getErrorMessage(response) {
  return response.error ?? response.message ?? "Unable to load jobs right now.";
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
  const min =
    typeof job.experienceMin === "number"
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
  return "Experience not set";
}
function buildHref(params, overrides) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key in overrides) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          query.append(key, item);
        }
      });
      return;
    }
    if (value) {
      query.set(key, value);
    }
  });
  Object.entries(overrides).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    } else {
      query.delete(key);
    }
  });
  const queryString = query.toString();
  return queryString ? `/jobs?${queryString}` : "/jobs";
}
export default async function JobsPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const search = getParam(params, "search").trim();
  const location = getParam(params, "location").trim();
  const skills = getParam(params, "skills").trim();
  const minSalary = getParam(params, "min_salary").trim();
  const maxSalary = getParam(params, "max_salary").trim();
  const minExperience = getParam(params, "min_experience").trim();
  const maxExperience = getParam(params, "max_experience").trim();
  const selectedJobTypes = getParamList(params, "job_type");
  const page = getPositiveNumber(getParam(params, "page"), 1);
  const limit = Math.min(getPositiveNumber(getParam(params, "limit"), 10), 50);
  const sortValue = getParam(params, "sort") || "createdAt:dsc";
  const [sortBy = "createdAt", sortType = "dsc"] = sortValue.split(":");
  const result = await getFromBackend("/jobs", {
    params: {
      search: search || undefined,
      location: location || undefined,
      skills: skills || undefined,
      job_type: selectedJobTypes.length
        ? selectedJobTypes.join(",")
        : undefined,
      min_salary: minSalary || undefined,
      max_salary: maxSalary || undefined,
      min_experience: minExperience || undefined,
      max_experience: maxExperience || undefined,
      sort_by: sortBy,
      sort_type: sortType,
      limit,
      page,
    },
  });
  const jobs = result.ok ? (result.body.data ?? []) : [];
  const pagination = result.body.pagination;
  const totalItems = pagination?.totalItems ?? jobs.length;
  const totalPages = pagination?.totalPage ?? 1;
  const firstResult = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const lastResult = Math.min(page * limit, totalItems);
  return (
    <section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Jobs
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Find Your Next Role
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Search open roles by title, location, job type, skills, salary,
              and experience level.
            </p>
          </div>
        </div>

        <form action="/jobs" className="mt-6">
          <div className="site-border site-card site-panel grid gap-3 rounded-lg border p-4 lg:grid-cols-[1fr_1fr_170px_130px]">
            <label className="relative">
              <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Icon name="search" />
              </span>
              <input
                name="search"
                defaultValue={search}
                className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
                placeholder="Job title, keyword, or skill"
              />
            </label>

            <input
              name="location"
              defaultValue={location}
              className="site-field h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              placeholder="Location or remote"
            />

            <SelectField
              name="sort"
              defaultValue={sortValue}
              options={sortOptions}
              className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"
            />

            <button className="site-button h-10 rounded-md px-3 text-sm font-semibold transition">
              Search
            </button>
          </div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[260px_1fr]">
            <aside className="site-border site-card space-y-5 rounded-lg border p-4">
              <div>
                <p className="text-sm font-semibold">Job Type</p>
                <div className="mt-3 space-y-2">
                  {jobTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="job_type"
                        value={type.value}
                        defaultChecked={selectedJobTypes.includes(type.value)}
                        className="h-4 w-4"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="site-divider h-px" />

              <div>
                <p className="text-sm font-semibold">Salary Range</p>
                <SalaryRangeFilter
                  minSalary={minSalary}
                  maxSalaryValue={maxSalary}
                />
              </div>

              <div className="site-divider h-px" />

              <div>
                <p className="text-sm font-semibold">Experience</p>
                <ExperienceRangeFilter
                  minExperience={minExperience}
                  maxExperience={maxExperience}
                />
              </div>

              <div className="site-divider h-px" />

              <label className="block">
                <span className="text-sm font-semibold">Skills</span>
                <input
                  name="skills"
                  defaultValue={skills}
                  className="site-field mt-3 h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  placeholder="React, Node, Design"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Per Page</span>
                <SelectField
                  name="limit"
                  defaultValue={String(limit)}
                  options={limitOptions}
                  className="site-field mt-3 h-10 w-full rounded-md border px-3 text-sm focus:outline-none"
                />
              </label>

              <input type="hidden" name="page" value="1" />

              <div className="flex gap-2">
                <button className="site-button flex-1 rounded-md px-3 py-2 text-sm font-semibold transition">
                  Apply
                </button>
                <ClearFiltersButton />
              </div>
            </aside>

            <div className="site-border site-card min-w-0 rounded-lg border p-4">
              <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    {totalItems} {totalItems === 1 ? "Job" : "Jobs"} Found
                  </h2>
                  <p className="site-muted mt-1 text-xs">
                    Showing {firstResult}-{lastResult} of {totalItems}
                    {search ? ` for "${search}"` : ""}
                  </p>
                </div>
                <p className="site-muted text-xs">
                  Page {pagination?.page ?? page} of {totalPages}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {!result.ok ? (
                  <p className="site-danger rounded-md border px-3 py-2 text-sm">
                    {getErrorMessage(result.body)}
                  </p>
                ) : null}

                {result.ok && jobs.length === 0 ? (
                  <div className="site-border site-panel rounded-lg border p-8 text-center">
                    <p className="text-sm font-semibold">No jobs found</p>
                    <p className="site-muted mt-1 text-xs">
                      Try removing a filter, widening salary range, or searching
                      a broader skill.
                    </p>
                  </div>
                ) : null}

                {jobs.map((job) => {
                  const details = [
                    job.location ?? "Location not set",
                    formatJobType(job.jobType),
                    formatSalary(job.salary),
                    formatExperience(job),
                  ];
                  return (
                    <article
                      key={job.id}
                      className="site-border site-panel rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <span className="site-badge mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                            <Icon name="briefcase" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="transition"
                              >
                                {job.title}
                              </Link>
                            </h3>
                            <p className="site-muted mt-1 text-xs">
                              {details.join(" · ")}
                            </p>
                            {job.skillsRequired?.length ? (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {job.skillsRequired.slice(0, 6).map((skill) => (
                                  <span
                                    key={`${job.id}-${skill}`}
                                    className="site-badge rounded px-2 py-1 text-[11px] font-semibold"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 md:items-end">
                          <p className="site-muted text-xs">
                            Posted {formatDate(job.createdAt)}
                          </p>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="site-button inline-flex justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 ? (
                <div className="site-panel mt-4 flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="site-muted text-xs">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={buildHref(params, {
                        page: String(Math.max(page - 1, 1)),
                      })}
                      aria-disabled={page <= 1}
                      className={`site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                    >
                      Previous
                    </Link>
                    <Link
                      href={buildHref(params, {
                        page: String(Math.min(page + 1, totalPages)),
                      })}
                      aria-disabled={page >= totalPages}
                      className={`site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold ${
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    >
                      Next
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
