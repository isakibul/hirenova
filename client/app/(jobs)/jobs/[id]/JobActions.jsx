"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

function getMessage(body, fallback) {
    return body?.error ?? body?.message ?? fallback;
}

export default function JobActions({ jobId }) {
    const { data: session, status } = useSession();
    const role = session?.user?.role;
    const [coverLetter, setCoverLetter] = useState("");
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    async function apply() {
        setIsApplying(true);
        setNotice("");
        setError("");
        try {
            const response = await fetch(`/api/jobs/${jobId}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ coverLetter }),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(getMessage(body, "Unable to apply."));
            }
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
            const response = await fetch(`/api/jobs/${jobId}/save`, {
                method: "POST",
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(getMessage(body, "Unable to save job."));
            }
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
        return <p className="site-muted mt-4 text-sm">Loading actions...</p>;
    }

    if (!session) {
        return (<Link href="/login" className="site-button mt-4 inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium">
          Sign In to Apply
        </Link>);
    }

    if (role !== "jobseeker") {
        return (<Link href="/manage-jobs" className="site-button mt-4 inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium">
          Manage Jobs
        </Link>);
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
