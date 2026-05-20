"use client";

import ConfirmDialog from "@components/ConfirmDialog";
import SelectField from "@components/forms/SelectField";
import Icon from "@components/Icon";
import { requestJson } from "@lib/clientApi";
import { getCandidateProfileHref } from "@lib/ui";
import Link from "next/link";
import { useState } from "react";

const statusOptions = [
    { value: "submitted", label: "Submitted" },
    { value: "reviewing", label: "Reviewing" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "rejected", label: "Rejected" },
    { value: "hired", label: "Hired" },
];

function getApplicationId(application) {
    return application.id ?? application._id ?? "";
}

function getStatusLabel(status) {
    return statusOptions.find((option) => option.value === status)?.label ?? status;
}

function getApplicantName(application) {
    const applicant = application?.applicant ?? {};
    return applicant.username ?? applicant.email ?? "this applicant";
}

export default function ApplicationsClient({ initialApplications, isLoading = false, jobId }) {
    const [applications, setApplications] = useState(initialApplications);
    const [rankedApplications, setRankedApplications] = useState([]);
    const [isRankingEnabled, setIsRankingEnabled] = useState(false);
    const [isRankingLoading, setIsRankingLoading] = useState(false);
    const [rankingSummary, setRankingSummary] = useState(null);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
    const visibleApplications = isRankingEnabled ? rankedApplications : applications;

    async function loadRankedApplications() {
        setIsRankingLoading(true);
        setIsRankingEnabled(true);
        setError("");
        try {
            const body = await requestJson(`/jobs/${jobId}/applications/ranking`, {}, "Unable to rank applicants.");
            setRankedApplications(body.data ?? []);
            setRankingSummary(body.ranking ?? null);
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to rank applicants.");
            setIsRankingEnabled(false);
        }
        finally {
            setIsRankingLoading(false);
        }
    }

    function turnOffRanking() {
        setIsRankingEnabled(false);
        setError("");
    }

    async function updateRankingMode(event) {
        if (event.target.checked) {
            await loadRankedApplications();
            return;
        }

        turnOffRanking();
    }

    async function updateStatus(application, status) {
        const id = getApplicationId(application);
        setUpdatingId(id);
        setError("");
        try {
            const body = await requestJson(`/applications/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }, "Unable to update status.");
            setApplications((current) => current.map((item) => getApplicationId(item) === id
                ? { ...item, status: body.data?.status ?? status }
                : item));
            setRankedApplications((current) => current.map((item) => getApplicationId(item) === id
                ? { ...item, status: body.data?.status ?? status }
                : item));
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to update status.");
        }
        finally {
            setUpdatingId("");
        }
    }

    function requestStatusChange(application, status) {
        if ((application.status ?? "submitted") === status) {
            return;
        }

        setPendingStatusChange({ application, status });
    }

    async function confirmStatusChange() {
        if (!pendingStatusChange) {
            return;
        }

        const { application, status } = pendingStatusChange;
        await updateStatus(application, status);
        setPendingStatusChange(null);
    }

    return (<div className="mt-6">
      <div className="site-border site-card rounded-lg border">
        <div className="flex flex-col gap-3 border-b border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">
                {isLoading
                    ? "Loading Candidates"
                    : `${visibleApplications.length} ${visibleApplications.length === 1 ? "Candidate" : "Candidates"}`}
              </h2>
              {isRankingEnabled ? (<span className="site-badge inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold">
                  <Icon name="spark"/>
                  AI Ranking
                </span>) : null}
            </div>
            <p className="site-muted mt-1 text-xs">
              {isLoading
                  ? "Loading applicants..."
                  : isRankingLoading
                  ? "Ranking applicants by fit signals..."
                  : isRankingEnabled
                      ? `${rankingSummary?.totalItems ?? rankedApplications.length} ranked by profile, skills, experience, and cover letter.`
                      : "Review applicants in the default application order."}
            </p>
          </div>
          <label className="site-field inline-flex h-9 w-fit items-center gap-2 rounded-md border px-3 text-xs font-semibold">
            <input type="checkbox" checked={isRankingEnabled} onChange={updateRankingMode} disabled={isLoading || isRankingLoading || applications.length === 0} className="h-4 w-4"/>
            <span className="inline-flex items-center gap-1">
              <Icon name="spark"/>
              AI Ranking
            </span>
          </label>
        </div>
        <div className="p-4">
      {error ? (<div className="site-danger rounded-lg border px-4 py-3 text-sm">{error}</div>) : null}
      {isLoading || isRankingLoading ? (<div className="site-border site-panel rounded-lg border p-6">
          <p className="font-semibold">{isRankingLoading ? "Ranking applicants..." : "Loading applicants..."}</p>
        </div>) : visibleApplications.length === 0 ? (<div className="site-border site-panel rounded-lg border p-6">
          <p className="font-semibold">No applicants yet</p>
        </div>) : <div className="space-y-3">{visibleApplications.map((application) => {
        const applicant = application.applicant ?? {};
        const applicantHref = getCandidateProfileHref(applicant);
        const id = getApplicationId(application);
        const ranking = application.aiRanking;
        return (<div key={id} className="site-border rounded-lg border bg-[var(--site-bg)] p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_190px] md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {ranking ? (<span className="site-badge rounded-md px-2 py-1 text-xs font-semibold">
                      #{ranking.rank} · {ranking.score}/100 · {ranking.label}
                    </span>) : null}
                  {applicantHref ? (<Link href={applicantHref} className="site-link text-lg font-semibold">
                      {applicant.username ?? applicant.email ?? "Applicant"}
                    </Link>) : (<p className="text-lg font-semibold">{applicant.username ?? applicant.email ?? "Applicant"}</p>)}
                </div>
                <p className="site-muted mt-1 text-sm">{applicant.email ?? "No email"}</p>
                {ranking ? (<div className="mt-4 rounded-md border border-[var(--site-border)] bg-[var(--site-panel)] p-3 text-sm">
                    <p className="font-semibold">{ranking.source === "ai" ? "AI reason" : "Ranking reason"}</p>
                    <p className="site-muted mt-1 leading-6">{ranking.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {ranking.matchedSkills?.map((skill) => (<span key={skill} className="site-badge rounded px-2 py-1 font-semibold">
                          {skill}
                        </span>))}
                      {ranking.missingSkills?.slice(0, 3).map((skill) => (<span key={skill} className="site-border rounded border px-2 py-1">
                          Review {skill}
                        </span>))}
                    </div>
                  </div>) : null}
                {application.coverLetter ? (<p className="site-muted mt-4 whitespace-pre-line text-sm leading-6">{application.coverLetter}</p>) : null}
              </div>
              <div className="w-32 justify-self-end">
                <SelectField value={application.status ?? "submitted"} onChange={(nextStatus) => requestStatusChange(application, nextStatus)} options={statusOptions} disabled={updatingId === id} className="site-field min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"/>
              </div>
            </div>
          </div>);
    })}</div>}
        </div>
      </div>
      {pendingStatusChange ? (<ConfirmDialog title="Update application status?" icon="check" confirmLabel="Update Status" pendingLabel="Updating..." isPending={updatingId === getApplicationId(pendingStatusChange.application)} onCancel={() => setPendingStatusChange(null)} onConfirm={confirmStatusChange}>
          Change {getApplicantName(pendingStatusChange.application)} from{" "}
          <span className="font-semibold">
            {getStatusLabel(pendingStatusChange.application.status ?? "submitted")}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {getStatusLabel(pendingStatusChange.status)}
          </span>
          ?
        </ConfirmDialog>) : null}
    </div>);
}
