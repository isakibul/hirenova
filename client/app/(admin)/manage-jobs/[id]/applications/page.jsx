"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import ApplicationsClient from "./ApplicationsClient";

export default function JobApplicationsPage({ params }) {
  const { id } = use(params);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch(`/api/jobs/${id}/applications`);
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.error ?? body.message ?? "Unable to load applicants.");
        }

        setApplications(body.data ?? []);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load applicants.",
        );
      }
    }

    void loadApplications();
  }, [id]);

  return (
    <section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-5xl">
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
          initialApplications={applications}
        />
      </div>
    </section>
  );
}
