"use client";

import Icon from "@components/Icon";
import { CardListSkeleton, MetricSkeleton } from "@components/Skeleton";
import StatusNotice from "@components/StatusNotice";
import { requestJson } from "@lib/clientApi";
import { formatDate } from "@lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatSalary(value) {
  if (typeof value !== "number") return "Not disclosed";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSavedJobs() {
      setIsLoading(true);
      try {
        const body = await requestJson(
          "/api/saved-jobs/me",
          {},
          "Unable to load saved jobs.",
        );
        setSavedJobs(body.data ?? []);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load saved jobs.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadSavedJobs();
  }, []);

  return (
    <section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Shortlist
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Saved Jobs</h1>
        <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
          Compare roles you want to revisit before applying.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {isLoading ? (
            <MetricSkeleton count={3} />
          ) : (
            <>
              <div className="site-border site-panel rounded-lg border p-4">
                <p className="site-muted text-xs font-medium">Saved Roles</p>
                <p className="mt-2 text-2xl font-semibold">{savedJobs.length}</p>
              </div>
              <div className="site-border site-panel rounded-lg border p-4">
                <p className="site-muted text-xs font-medium">Latest Save</p>
                <p className="mt-2 text-2xl font-semibold">
                  {savedJobs[0] ? formatDate(savedJobs[0].createdAt) : "None"}
                </p>
              </div>
              <div className="site-border site-panel rounded-lg border p-4">
                <p className="site-muted text-xs font-medium">Next Step</p>
                <p className="mt-2 text-2xl font-semibold">Apply</p>
              </div>
            </>
          )}
        </div>

        <StatusNotice>{error}</StatusNotice>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <CardListSkeleton count={4} />
          ) : savedJobs.length === 0 ? (
            <div className="site-border site-card rounded-lg border p-6 md:col-span-2">
              <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                <Icon name="bell" />
              </div>
              <p className="mt-4 font-semibold">No saved jobs yet</p>
              <p className="site-muted mt-2 text-sm leading-6">
                Save interesting roles from job details and build a shortlist.
              </p>
            </div>
          ) : (
            savedJobs.map((savedJob) => {
              const job = savedJob.job ?? {};
              const jobId = job._id ?? job.id;

              return (
                <Link
                  key={savedJob.id ?? savedJob._id}
                  href={jobId ? `/jobs/${jobId}` : "/jobs"}
                  className="site-border site-card rounded-lg border p-5 transition hover:border-[var(--site-accent)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">
                        {job.title ?? "Untitled job"}
                      </p>
                      <p className="site-muted mt-2 text-sm">
                        {job.location ?? "Location not set"}
                      </p>
                    </div>
                    <span className="site-badge shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold">
                      Saved
                    </span>
                  </div>
                  <p className="site-muted mt-4 text-sm">
                    {formatSalary(job.salary)}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
