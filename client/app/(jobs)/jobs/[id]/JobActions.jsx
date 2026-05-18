"use client";

import Link from "next/link";
import { useAuth } from "@components/auth/AuthProvider";
import SkeletonBlock from "@components/Skeleton";
import { requestJson } from "@lib/clientApi";
import { useEffect, useState } from "react";

const finishedApplicationStatuses = new Set(["rejected", "hired"]);

function getApplicationJobId(application) {
    const job = application?.job;

    if (!job) {
        return "";
    }

    if (typeof job === "string") {
        return job;
    }

    return job._id ?? job.id ?? "";
}

function formatApplicationStatus(status) {
    if (!status) {
        return "Submitted";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function JobActions({ jobId, isClosed }) {
    const { isAuthenticated, status, user } = useAuth();
    const role = user?.role;
    const [coverLetter, setCoverLetter] = useState("");
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [application, setApplication] = useState(null);
    const [isLoadingApplication, setIsLoadingApplication] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadApplication() {
            if (!isAuthenticated || role !== "jobseeker") {
                setApplication(null);
                return;
            }

            setIsLoadingApplication(true);
            setError("");

            try {
                const body = await requestJson("/applications/me", {}, "Unable to load application status.");
                const matchingApplication = (body.data ?? []).find(
                    (item) => getApplicationJobId(item) === jobId,
                );

                if (isMounted) {
                    setApplication(matchingApplication ?? null);
                }
            }
            catch (caughtError) {
                if (isMounted) {
                    setError(caughtError instanceof Error ? caughtError.message : "Unable to load application status.");
                }
            }
            finally {
                if (isMounted) {
                    setIsLoadingApplication(false);
                }
            }
        }

        void loadApplication();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, jobId, role]);

    async function apply() {
        setIsApplying(true);
        setNotice("");
        setError("");
        try {
            const body = await requestJson(`/jobs/${jobId}/apply`, {
                method: "POST",
                body: JSON.stringify({ coverLetter }),
            }, "Unable to apply.");
            setApplication(body.data ?? null);
            setNotice("Application submitted.");
            setCoverLetter("");
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to apply.");
        }
        finally {
            setIsApplying(false);
        }
    }

    async function save() {
        setIsSaving(true);
        setNotice("");
        setError("");
        try {
            await requestJson(`/jobs/${jobId}/save`, {
                method: "POST",
            }, "Unable to save job.");
            setNotice("Job saved.");
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to save job.");
        }
        finally {
            setIsSaving(false);
        }
    }

    if (status === "loading") {
        return <SkeletonBlock className="mt-4 h-10 w-full" />;
    }

    if (isClosed) {
        return (<div className="site-danger mt-4 rounded-md border px-3 py-2 text-sm">
          This job is no longer accepting applications.
        </div>);
    }

    if (!isAuthenticated) {
        return (<Link href="/login" className="site-button mt-4 inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium">
          Sign In to Apply
        </Link>);
    }

    if (role !== "jobseeker") {
        return (<Link href="/manage-jobs" className="site-button mt-4 inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium">
          Manage Jobs
        </Link>);
    }

    if (isLoadingApplication) {
        return <SkeletonBlock className="mt-4 h-28 w-full" />;
    }

    if (application) {
        const applicationStatus = application.status ?? "submitted";
        const isFinished = finishedApplicationStatuses.has(applicationStatus);

        return (<div className="mt-4 space-y-3">
          {(notice || error) ? (<div className={`rounded-md border px-3 py-2 text-xs ${error ? "site-danger" : "site-success"}`}>
              {error || notice}
            </div>) : null}
          <div className={`rounded-md border px-3 py-3 text-sm ${isFinished ? "site-badge" : "site-success"}`}>
            <p className="font-semibold">
              {isFinished ? "Application process finished." : "Application in progress."}
            </p>
            <p className="mt-1 text-xs">
              Status: {formatApplicationStatus(applicationStatus)}
            </p>
          </div>
          <Link href="/applications" className="site-border site-field inline-flex w-full justify-center rounded-md border px-4 py-2 text-sm font-semibold">
            View Application
          </Link>
          <button type="button" onClick={save} disabled={isSaving} className="site-border site-field w-full rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-70">
            {isSaving ? "Saving..." : "Save Job"}
          </button>
        </div>);
    }

    return (<div className="mt-4 space-y-3">
      {(notice || error) ? (<div className={`rounded-md border px-3 py-2 text-xs ${error ? "site-danger" : "site-success"}`}>
          {error || notice}
        </div>) : null}
      <textarea value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} className="site-field min-h-28 w-full resize-y rounded-md border px-3 py-2 text-sm focus:outline-none" maxLength={3000} placeholder="Optional cover letter"/>
      <button type="button" onClick={apply} disabled={isApplying} className="site-button w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-70">
        {isApplying ? "Applying..." : "Apply Now"}
      </button>
      <button type="button" onClick={save} disabled={isSaving} className="site-border site-field w-full rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-70">
        {isSaving ? "Saving..." : "Save Job"}
      </button>
    </div>);
}
