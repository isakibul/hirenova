import { requestServerBackend } from "@lib/serverApi";
import { toSearchParams } from "@lib/url";

import JobsBrowser from "./JobsBrowser";
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
async function getJobs(params) {
  const query = toSearchParams(params);
  return requestServerBackend(`/jobs?${query.toString()}`);
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
  const author = getParam(params, "author").trim();
  const selectedJobTypes = getParamList(params, "job_type");
  const page = 1;
  const limit = Math.min(getPositiveNumber(getParam(params, "limit"), 10), 50);
  const smartMatch = ["1", "true", "on"].includes(
    getParam(params, "smart_match").toLowerCase(),
  );
  const requestedSortValue = getParam(params, "sort") || "createdAt:dsc";
  const sortValue = sortOptions.some((option) => option.value === requestedSortValue)
    ? requestedSortValue
    : "createdAt:dsc";
  const [sortBy = "createdAt", sortType = "dsc"] = sortValue.split(":");
  const jobsQuery = {
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
      author: author || undefined,
      limit,
      page,
  };
  const result = await getJobs({
      ...jobsQuery,
      sort_by: sortBy,
      sort_type: sortType,
  });
  const jobs = result.ok ? (result.body.data ?? []) : [];
  const pagination = result.body.pagination;
  return (
    <section className="site-section pb-12 pt-0 md:pb-14">
      <div className="site-container">
        <div className="jobs-hero relative overflow-hidden px-5 py-10 sm:px-8 md:px-10 md:py-14">
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="jobs-hero-dot h-2 w-2 rounded-full" />
              <p className="jobs-eyebrow text-xs font-bold uppercase tracking-[0.18em]">
                Opportunities, made simple
              </p>
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl md:text-[3.5rem]">
              Find work that moves
              <span className="block">your career forward.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
              Search roles from growing teams, filter by what matters to you,
              and take the next step with confidence.
            </p>
          </div>

          <div className="jobs-hero-note relative mt-8 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            New opportunities added regularly
          </div>
        </div>

        <JobsBrowser
          initialJobs={jobs}
          initialPagination={pagination}
          initialBody={result.body}
          initialOk={result.ok}
          initialQuery={jobsQuery}
          initialSortValue={sortValue}
          initialSmartMatch={smartMatch}
          jobTypes={jobTypes}
          sortOptions={sortOptions}
        />
      </div>
    </section>
  );
}
