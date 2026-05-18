"use client";

import Icon from "@components/Icon";
import { useAuth } from "@components/auth/AuthProvider";
import { requestJson } from "@lib/clientApi";
import { formatDate, getApiMessage } from "@lib/ui";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

function getErrorMessage(response) {
  return getApiMessage(response, "Unable to load jobs right now.");
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

function buildRecommendedPath(query) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return `/jobs/smart-match/recommendations?${params.toString()}`;
}

export default function JobsResults({
  initialJobs,
  initialPagination,
  initialBody,
  initialOk,
  params,
  query,
  page,
  limit,
  totalItems,
  totalPages,
  search,
  useSmartMatch,
  isRefreshing = false,
  onPageChange,
}) {
  const { isAuthenticated, status } = useAuth();
  const stableQuery = useMemo(() => JSON.stringify(query), [query]);
  const [smartMatchPreference, setSmartMatchPreference] = useState(null);
  const [recommendationState, setRecommendationState] = useState(null);
  const smartMatchEnabled =
    smartMatchPreference?.key === stableQuery
      ? smartMatchPreference.enabled
      : useSmartMatch;
  const shouldUseSmartMatch =
    smartMatchEnabled &&
    status === "authenticated" &&
    isAuthenticated;
  const isRecommendationLoading =
    shouldUseSmartMatch && recommendationState?.key !== stableQuery;
  const isLoading = isRefreshing || isRecommendationLoading;
  const activeState =
    shouldUseSmartMatch && recommendationState?.key === stableQuery
      ? recommendationState
      : {
          jobs: shouldUseSmartMatch ? [] : initialJobs,
          pagination: initialPagination,
          body: initialBody,
          isOk: initialOk,
        };
  const { body, isOk, jobs, pagination } = activeState;
  const activeTotalItems = pagination?.totalItems ?? totalItems;
  const activeTotalPages = pagination?.totalPage ?? totalPages;
  const activePage = pagination?.page ?? page;
  const activeLimit = pagination?.limit ?? limit;
  const activeFirstResult =
    activeTotalItems === 0 ? 0 : (activePage - 1) * activeLimit + 1;
  const activeLastResult = Math.min(activePage * activeLimit, activeTotalItems);
  const updateSmartMatch = (event) => {
    if (event.currentTarget.checked && status === "unauthenticated") {
      const returnPath =
        typeof window === "undefined"
          ? "/jobs?smart_match=1"
          : `${window.location.pathname}${window.location.search}`;
      const separator = returnPath.includes("?") ? "&" : "?";

      window.location.assign(
        `/login?next=${encodeURIComponent(`${returnPath}${separator}smart_match=1`)}`,
      );
      return;
    }

    setSmartMatchPreference({
      key: stableQuery,
      enabled: event.currentTarget.checked,
    });
  };

  useEffect(() => {
    if (!shouldUseSmartMatch) {
      return;
    }

    let ignore = false;

    async function loadRecommendations() {
      try {
        const nextBody = await requestJson(
          buildRecommendedPath(query),
          {},
          "Unable to load Smart Match jobs.",
        );

        if (ignore) {
          return;
        }

        setRecommendationState({
          key: stableQuery,
          jobs: nextBody.data ?? [],
          pagination: nextBody.pagination,
          body: nextBody,
          recommendation: nextBody.recommendation ?? null,
          isOk: true,
        });
      } catch (caughtError) {
        if (ignore) {
          return;
        }
        setRecommendationState({
          key: stableQuery,
          jobs: [],
          pagination: {
            page,
            limit,
            totalItems: 0,
            totalPage: 0,
          },
          recommendation: null,
          isOk: false,
          body: {
            message:
              caughtError instanceof Error
                ? caughtError.message
                : "Unable to load Smart Match jobs.",
          },
        });
      }
    }

    void loadRecommendations();

    return () => {
      ignore = true;
    };
  }, [initialJobs, initialPagination, limit, page, query, shouldUseSmartMatch, stableQuery]);

  return (
    <div className="site-border site-card min-w-0 rounded-lg border p-4">
      <div className="flex flex-col gap-2 border-b border-(--site-border)/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">
              {activeTotalItems} {activeTotalItems === 1 ? "Job" : "Jobs"} Found
            </h2>
            {shouldUseSmartMatch ? (
              <span className="site-badge inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold">
                <Icon name="spark" />
                Smart Match
              </span>
            ) : null}
          </div>
          <p className="site-muted mt-1 text-xs">
            Showing {activeFirstResult}-{activeLastResult} of {activeTotalItems}
            {search ? ` for "${search}"` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <label className="site-field inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold">
            <input
              type="checkbox"
              name="smart_match"
              value="1"
              checked={smartMatchEnabled}
              onChange={updateSmartMatch}
              className="h-4 w-4"
            />
            <span className="inline-flex items-center gap-1">
              <Icon name="spark" />
              AI Smart Matching
            </span>
          </label>
          <p className="site-muted text-xs">
          {isLoading
            ? shouldUseSmartMatch
              ? "Ranking relevant matches..."
              : "Updating jobs..."
            : `Page ${activePage} of ${activeTotalPages}`}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="site-border site-panel rounded-lg border p-6">
            <div className="flex items-start gap-3">
              <span className="site-badge inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                <Icon name={shouldUseSmartMatch ? "spark" : "search"} />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {shouldUseSmartMatch ? "Finding your best matches" : "Updating jobs"}
                </p>
                <p className="site-muted mt-1 text-sm leading-6">
                  {shouldUseSmartMatch
                    ? "Smart Match is filtering jobs by your profile, skills, experience, and search criteria before showing recommendations."
                    : "Applying your filters without reloading the page."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!isOk ? (
          <p className="site-danger rounded-md border px-3 py-2 text-sm">
            {getErrorMessage(body)}
          </p>
        ) : null}

        {isOk && !isLoading && jobs.length === 0 ? (
          <div className="site-border site-panel rounded-lg border p-8 text-center">
            <p className="text-sm font-semibold">
              {shouldUseSmartMatch ? "No strong matches found" : "No jobs found"}
            </p>
            <p className="site-muted mt-1 text-xs">
              {shouldUseSmartMatch
                ? "Update your profile skills or turn off AI Smart Matching to browse every open job."
                : "Try removing a filter, widening salary range, or searching a broader skill."}
            </p>
          </div>
        ) : null}

        {!isLoading && jobs.map((job) => {
          const company = job.company;
          const companyId = company?.id ?? job.author;
          const companyHref = companyId ? `/companies/${companyId}` : "";
          const location = job.location ?? "Location not set";
          const details = [
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
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">
                        <Link href={`/jobs/${job.id}`} className="transition">
                          {job.title}
                        </Link>
                      </h3>
                      {job.match ? (
                        <span className="site-badge rounded px-2 py-1 text-[11px] font-semibold">
                          {job.match.score}% · {job.match.label}
                        </span>
                      ) : null}
                    </div>
                    <div className="site-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="mapPin" />
                        {location}
                      </span>
                      <span>{details.join(" · ")}</span>
                    </div>
                    {company?.name ? (
                      <Link
                        href={companyHref || `/jobs/${job.id}`}
                        className="site-link mt-2 inline-flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Icon name="briefcase" />
                        {company.name}
                      </Link>
                    ) : null}
                    {job.match?.reason ? (
                      <div className="site-border mt-3 max-w-3xl rounded-md border p-3">
                        <p className="site-accent text-[11px] font-semibold uppercase tracking-wide">
                          {job.match.source === "ai"
                            ? "Smart Match insight"
                            : "Smart Match insight"}
                        </p>
                        <p className="site-muted mt-1 text-sm leading-6">
                          {job.match.reason}
                        </p>
                      </div>
                    ) : null}
                    {job.skillsRequired?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skillsRequired.slice(0, 6).map((skill) => (
                          <span
                            key={`${job.id}-${skill}`}
                            className={`site-badge rounded px-2 py-1 text-[11px] font-semibold ${
                              job.match?.matchedSkills?.includes(
                                String(skill).toLowerCase(),
                              )
                                ? "ring-1 ring-[var(--site-accent)]"
                                : ""
                            }`}
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
                    Posted {formatDate(job.createdAt, "Recently posted")}
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

      {activeTotalPages > 1 ? (
        <div className="site-panel mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="site-muted text-xs">
            Page {activePage} of {activeTotalPages}
          </p>
          <div className="flex gap-2">
            <PaginationControl
              href={buildHref(params, {
                page: String(Math.max(activePage - 1, 1)),
              })}
              onClick={onPageChange ? () => onPageChange(Math.max(activePage - 1, 1)) : undefined}
              aria-disabled={activePage <= 1}
              disabled={activePage <= 1}
            >
              Previous
            </PaginationControl>
            <PaginationControl
              href={buildHref(params, {
                page: String(Math.min(activePage + 1, activeTotalPages)),
              })}
              onClick={onPageChange ? () => onPageChange(Math.min(activePage + 1, activeTotalPages)) : undefined}
              aria-disabled={activePage >= activeTotalPages}
              disabled={activePage >= activeTotalPages}
            >
              Next
            </PaginationControl>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PaginationControl({ href, onClick, disabled, children }) {
  const className = `site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold ${
    disabled ? "pointer-events-none opacity-50" : ""
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href} aria-disabled={disabled} className={className}>
      {children}
    </Link>
  );
}
