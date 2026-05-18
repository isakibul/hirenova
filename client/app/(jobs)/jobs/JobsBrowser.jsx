"use client";

import Icon from "@components/Icon";
import SelectField from "@components/forms/SelectField";
import { backendFetch } from "@lib/clientApi";
import { getApiMessage } from "@lib/ui";
import { useRef, useState } from "react";
import ExperienceRangeFilter from "./ExperienceRangeFilter";
import JobsResults from "./JobsResults";
import SalaryRangeFilter from "./SalaryRangeFilter";

function compactObject(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== ""),
  );
}

function toUrlSearch(query) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}

function buildJobsRequest(query, sortValue) {
  const [sortBy = "createdAt", sortType = "dsc"] = sortValue.split(":");

  return {
    ...query,
    sort_by: sortBy,
    sort_type: sortType,
  };
}

function buildBrowserUrl(query, sortValue, smartMatch) {
  const params = toUrlSearch({
    ...query,
    sort: sortValue === "createdAt:dsc" ? undefined : sortValue,
    smart_match: smartMatch ? "1" : undefined,
  });
  const queryString = params.toString();

  return queryString ? `/jobs?${queryString}` : "/jobs";
}

async function fetchJobs(query, sortValue) {
  const params = toUrlSearch(buildJobsRequest(query, sortValue));
  const response = await backendFetch(`/jobs?${params.toString()}`);
  const body = await response.json().catch(() => ({}));

  return {
    body,
    ok: response.ok,
    status: response.status,
    message: getApiMessage(body, "Unable to load jobs right now."),
  };
}

export default function JobsBrowser({
  initialJobs,
  initialPagination,
  initialBody,
  initialOk,
  initialQuery,
  initialParams,
  initialSortValue,
  initialSmartMatch,
  jobTypes,
  sortOptions,
  limitOptions,
}) {
  const formRef = useRef(null);
  const [resetKey, setResetKey] = useState(0);
  const [browserState, setBrowserState] = useState({
    jobs: initialJobs,
    pagination: initialPagination,
    body: initialBody,
    isOk: initialOk,
    query: initialQuery,
    params: initialParams,
    sortValue: initialSortValue,
    smartMatch: initialSmartMatch,
    isLoading: false,
  });
  const page = Number(browserState.query.page) || 1;
  const limit = Number(browserState.query.limit) || 10;
  const totalItems = browserState.pagination?.totalItems ?? browserState.jobs.length;
  const totalPages = browserState.pagination?.totalPage ?? 1;

  async function applyQuery(nextQuery, nextSortValue, nextSmartMatch) {
    setBrowserState((current) => ({
      ...current,
      query: nextQuery,
      params: compactObject({
        ...nextQuery,
        sort: nextSortValue === "createdAt:dsc" ? undefined : nextSortValue,
        smart_match: nextSmartMatch ? "1" : undefined,
      }),
      sortValue: nextSortValue,
      smartMatch: nextSmartMatch,
      isLoading: true,
    }));

    window.history.replaceState(
      null,
      "",
      buildBrowserUrl(nextQuery, nextSortValue, nextSmartMatch),
    );

    try {
      const result = await fetchJobs(nextQuery, nextSortValue);
      setBrowserState((current) => ({
        ...current,
        jobs: result.ok ? (result.body.data ?? []) : [],
        pagination: result.body.pagination,
        body: result.ok ? result.body : { message: result.message },
        isOk: result.ok,
        isLoading: false,
      }));
    } catch (caughtError) {
      setBrowserState((current) => ({
        ...current,
        jobs: [],
        pagination: { page: nextQuery.page, limit: nextQuery.limit, totalItems: 0, totalPage: 0 },
        body: {
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load jobs right now.",
        },
        isOk: false,
        isLoading: false,
      }));
    }
  }

  function buildQueryFromForm(form) {
    const formData = new FormData(form);
    const selectedJobTypes = formData.getAll("job_type").filter(Boolean);
    const sortValue = String(formData.get("sort") || "createdAt:dsc");
    const smartMatch = formData.get("smart_match") === "1";

    return {
      query: compactObject({
        search: String(formData.get("search") || "").trim() || undefined,
        location: String(formData.get("location") || "").trim() || undefined,
        skills: String(formData.get("skills") || "").trim() || undefined,
        job_type: selectedJobTypes.length ? selectedJobTypes.join(",") : undefined,
        min_salary: formData.get("min_salary") || undefined,
        max_salary: formData.get("max_salary") || undefined,
        min_experience: formData.get("min_experience") || undefined,
        max_experience: formData.get("max_experience") || undefined,
        limit: Number(formData.get("limit")) || 10,
        page: 1,
      }),
      sortValue,
      smartMatch,
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const { query, sortValue, smartMatch } = buildQueryFromForm(event.currentTarget);
    void applyQuery(query, sortValue, smartMatch);
  }

  function clearFilters() {
    const query = { limit: 10, page: 1 };

    formRef.current?.reset();
    setResetKey((current) => current + 1);
    void applyQuery(query, "createdAt:dsc", false);
  }

  function clearSearch() {
    const form = formRef.current;

    if (!form) {
      const { search, location, ...queryWithoutSearch } = browserState.query;
      void applyQuery({ ...queryWithoutSearch, page: 1 }, browserState.sortValue, browserState.smartMatch);
      return;
    }

    const searchInput = form.elements.namedItem("search");
    const locationInput = form.elements.namedItem("location");

    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = "";
    }

    if (locationInput instanceof HTMLInputElement) {
      locationInput.value = "";
    }

    const { query, sortValue, smartMatch } = buildQueryFromForm(form);
    void applyQuery(query, sortValue, smartMatch);
  }

  function changePage(nextPage) {
    void applyQuery(
      {
        ...browserState.query,
        page: nextPage,
      },
      browserState.sortValue,
      browserState.smartMatch,
    );
  }

  return (
    <form ref={formRef} action="/jobs" className="mt-6" onSubmit={handleSubmit}>
      <div className="site-border site-card site-panel grid gap-3 rounded-lg border p-4 lg:grid-cols-[1fr_1fr_170px_130px_130px]">
        <label className="relative">
          <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Icon name="search" />
          </span>
          <input
            key={`search-${resetKey}`}
            name="search"
            defaultValue={browserState.query.search ?? ""}
            className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
            placeholder="Job title, keyword, or skill"
          />
        </label>

        <label className="relative">
          <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Icon name="mapPin" />
          </span>
          <input
            key={`location-${resetKey}`}
            name="location"
            defaultValue={browserState.query.location ?? ""}
            className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
            placeholder="Location or remote"
          />
        </label>

        <SelectField
          key={`sort-${resetKey}`}
          name="sort"
          defaultValue={browserState.sortValue}
          options={sortOptions}
          className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"
        />

        <button className="site-button h-10 rounded-md px-3 text-sm font-semibold transition">
          Search
        </button>

        <button
          type="button"
          onClick={clearSearch}
          className="site-border site-field h-10 rounded-md border px-3 text-sm font-semibold"
        >
          Clear Search
        </button>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="site-border site-card space-y-5 rounded-lg border p-4">
          <div>
            <p className="text-sm font-semibold">Job Type</p>
            <div className="mt-3 space-y-2">
              {jobTypes.map((type) => (
                <label key={type.value} className="flex items-center gap-2 text-sm">
                  <input
                    key={`job-type-${resetKey}-${type.value}`}
                    type="checkbox"
                    name="job_type"
                    value={type.value}
                    defaultChecked={String(browserState.query.job_type ?? "")
                      .split(",")
                      .includes(type.value)}
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
              key={`salary-${resetKey}`}
              minSalary={browserState.query.min_salary ?? ""}
              maxSalaryValue={browserState.query.max_salary ?? ""}
            />
          </div>

          <div className="site-divider h-px" />

          <div>
            <p className="text-sm font-semibold">Experience</p>
            <ExperienceRangeFilter
              key={`experience-${resetKey}`}
              minExperience={browserState.query.min_experience ?? ""}
              maxExperience={browserState.query.max_experience ?? ""}
            />
          </div>

          <div className="site-divider h-px" />

          <label className="block">
            <span className="text-sm font-semibold">Skills</span>
            <input
              key={`skills-${resetKey}`}
              name="skills"
              defaultValue={browserState.query.skills ?? ""}
              className="site-field mt-3 h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              placeholder="React, Node, Design"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Per Page</span>
            <SelectField
              key={`limit-${resetKey}`}
              name="limit"
              defaultValue={String(browserState.query.limit ?? 10)}
              options={limitOptions}
              className="site-field mt-3 h-10 w-full rounded-md border px-3 text-sm focus:outline-none"
            />
          </label>

          <input type="hidden" name="page" value="1" />

          <div className="flex gap-2">
            <button className="site-button flex-1 rounded-md px-3 py-2 text-sm font-semibold transition">
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="site-border site-field rounded-md border px-3 py-2 text-sm font-semibold"
            >
              Clear Filter
            </button>
          </div>
        </aside>

        <JobsResults
          initialJobs={browserState.jobs}
          initialPagination={browserState.pagination}
          initialBody={browserState.isLoading ? {} : browserState.body}
          initialOk={browserState.isLoading ? true : browserState.isOk}
          params={browserState.params}
          query={browserState.query}
          page={page}
          limit={limit}
          totalItems={totalItems}
          totalPages={totalPages}
          search={browserState.query.search ?? ""}
          useSmartMatch={browserState.smartMatch}
          isRefreshing={browserState.isLoading}
          onPageChange={changePage}
        />
      </div>
    </form>
  );
}
