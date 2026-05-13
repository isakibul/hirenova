"use client";

import Icon from "@components/Icon";
import StatusNotice from "@components/StatusNotice";
import { formatDate, getApiMessage } from "@lib/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

function getStatusClass(status) {
  if (status === "hired" || status === "shortlisted") return "site-success";
  if (status === "rejected") return "site-danger";
  return "site-badge";
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/applications/me");
        const body = await response.json();

        if (!response.ok) {
          throw new Error(getApiMessage(body, "Unable to load applications."));
        }

        setApplications(body.data ?? []);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load applications.",
        );
      }
    }

    void loadApplications();
  }, []);

  const activeCount = applications.filter(
    (application) => !["rejected", "hired"].includes(application.status),
  ).length;

  return (
    <section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Jobseeker
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Applications
        </h1>
        <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
          Follow each role from submission through final decision.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Total</p>
            <p className="mt-2 text-2xl font-semibold">{applications.length}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Active</p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Latest</p>
            <p className="mt-2 text-2xl font-semibold">
              {applications[0] ? formatDate(applications[0].createdAt) : "None"}
            </p>
          </div>
        </div>

        <StatusNotice>{error}</StatusNotice>

        <div className="mt-6 space-y-4">
          {applications.length === 0 ? (
            <div className="site-border site-card rounded-lg border p-6">
              <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                <Icon name="file" />
              </div>
              <p className="mt-4 font-semibold">No applications yet</p>
              <p className="site-muted mt-2 text-sm leading-6">
                Apply to roles that match your profile and they will appear here.
              </p>
            </div>
          ) : (
            applications.map((application) => {
              const job = application.job ?? {};
              const jobId = job._id ?? job.id;

              return (
                <div
                  key={application.id ?? application._id}
                  className="site-border site-card rounded-lg border p-5"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_180px] md:items-start">
                    <div>
                      <p className="text-lg font-semibold">
                        {job.title ?? "Untitled job"}
                      </p>
                      <p className="site-muted mt-1 text-sm">
                        {job.location ?? "Location not set"} · Applied{" "}
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${getStatusClass(application.status)}`}
                    >
                      {application.status ?? "submitted"}
                    </span>
                  </div>
                  {jobId ? (
                    <Link
                      href={`/jobs/${jobId}`}
                      className="site-link mt-4 inline-block text-sm font-semibold"
                    >
                      View job
                    </Link>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
