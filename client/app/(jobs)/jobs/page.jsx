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
function getBackendApiUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") ??
    "http://localhost:4000/api/v1"
  );
}
async function getJobs(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });
  const response = await fetch(`${getBackendApiUrl()}/jobs?${query.toString()}`, {
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  return { body, ok: response.ok, status: response.status };
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
  const page = getPositiveNumber(getParam(params, "page"), 1);
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
    <section className="site-section py-8">
      <div className="site-container">
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

        <JobsBrowser
          initialJobs={jobs}
          initialPagination={pagination}
          initialBody={result.body}
          initialOk={result.ok}
          initialQuery={jobsQuery}
          initialParams={params}
          initialSortValue={sortValue}
          initialSmartMatch={smartMatch}
          jobTypes={jobTypes}
          sortOptions={sortOptions}
          limitOptions={limitOptions}
        />
      </div>
    </section>
  );
}
