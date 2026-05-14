"use client";

import Link from "next/link";
import { requestJson } from "@lib/clientApi";
import { use, useEffect, useState } from "react";
import ApplicationsClient from "./ApplicationsClient";

export default function JobApplicationsPage({ params }) {
  const { id } = use(params);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const body = await requestJson(
          `/jobs/${id}/applications`,
          {},
          "Unable to load applicants.",
        );
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
          initialApplications={applications}
        />
      </div>
    </section>
  );
}
