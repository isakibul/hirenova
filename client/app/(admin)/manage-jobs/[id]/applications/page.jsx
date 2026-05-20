"use client";

import Link from "next/link";
import { requestJson } from "@lib/clientApi";
import { use, useEffect, useState } from "react";
import ApplicationsClient from "./ApplicationsClient";

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
        <Link href="/manage-jobs" className="site-link text-sm font-semibold">
          Back to jobs
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Applicants</h1>
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
