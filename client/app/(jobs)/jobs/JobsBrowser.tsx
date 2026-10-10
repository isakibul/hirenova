"use client";

import Icon from "@components/Icon";
import SelectField from "@components/forms/SelectField";
import { backendFetch } from "@lib/clientApi";
import { getApiMessage } from "@lib/ui";
import { toSearchParams } from "@lib/url";
import { useRef, useState } from "react";
import ExperienceRangeFilter from "./ExperienceRangeFilter";
import JobsResults from "./JobsResults";
import SalaryRangeFilter from "./SalaryRangeFilter";

function compactObject(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== ""),
  );
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
  const params = toSearchParams({
    ...query,
    limit: Number(query.limit) === 10 ? undefined : query.limit,
    page: Number(query.page) === 1 ? undefined : query.page,
    sort: sortValue === "createdAt:dsc" ? undefined : sortValue,
    smart_match: smartMatch ? "1" : undefined,
  });
  const queryString = params.toString();

  return queryString ? `/jobs?${queryString}` : "/jobs";
}

async function fetchJobs(query, sortValue) {
  const params = toSearchParams(buildJobsRequest(query, sortValue));
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
  initialSortValue,
  initialSmartMatch,
  jobTypes,
  sortOptions,
}) {
  const formRef = useRef(null);
  const isLoadingMoreRef = useRef(false);
  const [resetKey, setResetKey] = useState(0);
  const [browserState, setBrowserState] = useState({
    jobs: initialJobs,
    pagination: initialPagination,
    body: initialBody,
    isOk: initialOk,
    query: initialQuery,
    sortValue: initialSortValue,
    smartMatch: initialSmartMatch,
    isLoading: false,
    isLoadingMore: false,
  });
  const totalItems = browserState.pagination?.totalItems ?? browserState.jobs.length;

  async function applyQuery(nextQuery, nextSortValue, nextSmartMatch) {
    setBrowserState((current) => ({
      ...current,
      query: nextQuery,
      sortValue: nextSortValue,
      smartMatch: nextSmartMatch,
      isLoading: true,
      isLoadingMore: false,
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
        isLoadingMore: false,
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
        isLoadingMore: false,
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
        limit: 10,
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

  async function loadMoreJobs() {
    const nextPage = browserState.pagination?.next;

    if (!nextPage || browserState.isLoading || isLoadingMoreRef.current) {
      return;
    }

    isLoadingMoreRef.current = true;
    setBrowserState((current) => ({ ...current, isLoadingMore: true }));

    try {
      const result = await fetchJobs(
        { ...browserState.query, page: nextPage },
        browserState.sortValue,
      );

      setBrowserState((current) => {
        if (!result.ok) {
          return {
            ...current,
            body: { message: result.message },
            isOk: false,
            isLoadingMore: false,
          };
        }

        const knownIds = new Set(current.jobs.map((job) => job.id));
        const nextJobs = (result.body.data ?? []).filter((job) => !knownIds.has(job.id));

        return {
          ...current,
          jobs: [...current.jobs, ...nextJobs],
          pagination: result.body.pagination,
          body: result.body,
          isOk: true,
          isLoadingMore: false,
        };
      });
    } catch (caughtError) {
      setBrowserState((current) => ({
        ...current,
        body: {
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load more jobs right now.",
        },
        isOk: false,
        isLoadingMore: false,
      }));
    } finally {
      isLoadingMoreRef.current = false;
    }
  }

  return (
    <form ref={formRef} action="/jobs" className="relative z-10 -mt-4 sm:-mt-5" onSubmit={handleSubmit}>
      <div className="jobs-search-bar site-border grid gap-3 rounded-xl border p-3 sm:p-4 lg:grid-cols-[1fr_1fr_170px_130px_130px]">
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
        <aside className="jobs-filter site-border site-card space-y-4 border p-5 lg:sticky lg:top-16">
          <div className="jobs-filter-heading flex items-center justify-between">
            <div>
              <span className="site-accent text-[10px] font-bold uppercase tracking-[0.16em]">Job search</span>
              <p className="mt-0.5 text-base font-semibold">Refine your search</p>
            </div>
            <span className="jobs-filter-count">Filters</span>
          </div>
          <div>
            <p className="jobs-filter-label">Job Type</p>
            <div className="mt-2.5 space-y-2">
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
            <p className="jobs-filter-label">Salary Range</p>
            <SalaryRangeFilter
              key={`salary-${resetKey}`}
              minSalary={browserState.query.min_salary ?? ""}
              maxSalaryValue={browserState.query.max_salary ?? ""}
            />
          </div>

          <div className="site-divider h-px" />

          <div>
            <p className="jobs-filter-label">Experience</p>
            <ExperienceRangeFilter
              key={`experience-${resetKey}`}
              minExperience={browserState.query.min_experience ?? ""}
              maxExperience={browserState.query.max_experience ?? ""}
            />
          </div>

          <label className="block">
            <span className="jobs-filter-label">Skills</span>
            <input
              key={`skills-${resetKey}`}
              name="skills"
              defaultValue={browserState.query.skills ?? ""}
              className="site-field mt-2 h-9 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              placeholder="React, Node, Design"
            />
          </label>

          <input type="hidden" name="page" value="1" />

          <div className="flex gap-2 pt-1">
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
          query={browserState.query}
          totalItems={totalItems}
          search={browserState.query.search ?? ""}
          useSmartMatch={browserState.smartMatch}
          isRefreshing={browserState.isLoading}
          hasMore={Boolean(browserState.pagination?.next)}
          isLoadingMore={browserState.isLoadingMore}
          onLoadMore={loadMoreJobs}
        />
      </div>
    </form>
  );
}
