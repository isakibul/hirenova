"use client";

import { requestJson } from "@lib/clientApi";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { formatJobStatus } from "../../jobUtils";
import ApplicationsClient from "./ApplicationsClient";

function countByStatus(applications, status) {
  return applications.filter(
    (application) => (application.status ?? "submitted") === status,
  ).length;
}

function StatCard({ label, value }) {
  return (
    <div className="site-border site-panel rounded-lg border p-4">
      <p className="site-muted text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function JobApplicationsPage({ params }) {
  const { id } = use(params);
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setIsLoading(true);
      try {
        const [applicationsBody, jobBody] = await Promise.all([
          requestJson(
            `/jobs/${id}/applications`,
            {},
            "Unable to load applicants.",
          ),
          requestJson(`/jobs/${id}`, {}, "Unable to load job details."),
        ]);
        setApplications(applicationsBody.data ?? []);
        setJob(jobBody.data ?? null);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load applicants.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadApplications();
  }, [id]);

  return (
    <section className="site-section py-12">
      <div className="site-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="site-link text-xs font-bold uppercase tracking-[0.18em]">
              Employer
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Applicants
            </h1>
            <p className="site-muted mt-4">
              Review candidates, update application statuses, and rank fit for{" "}
              {job?.title ?? "this job"}.
            </p>
          </div>
          <Link
            href="/manage-jobs"
            className="site-button inline-flex h-11 w-fit items-center rounded-md px-4 text-sm font-semibold"
          >
            Back to Jobs
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Total Candidates" value={applications.length} />
          <StatCard
            label="In Review"
            value={
              countByStatus(applications, "reviewing") +
              countByStatus(applications, "shortlisted")
            }
          />
          <StatCard
            label="Job Status"
            value={job ? formatJobStatus(job) : "Loading"}
          />
        </div>
        {error ? (
          <div className="site-danger mt-6 rounded-lg border px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}
        <ApplicationsClient
          key={applications.length}
          jobId={id}
          job={job}
          initialApplications={applications}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
