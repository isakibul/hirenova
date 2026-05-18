"use client";

import ConfirmDialog from "@components/ConfirmDialog";
import SelectField from "@components/forms/SelectField";
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

export default function ApplicationsClient({ initialApplications }) {
    const [applications, setApplications] = useState(initialApplications);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");
    const [pendingStatusChange, setPendingStatusChange] = useState(null);

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

    return (<div className="mt-6 space-y-4">
      {error ? (<div className="site-danger rounded-lg border px-4 py-3 text-sm">{error}</div>) : null}
      {applications.length === 0 ? (<div className="site-border site-card rounded-lg border p-6">
          <p className="font-semibold">No applicants yet</p>
        </div>) : applications.map((application) => {
        const applicant = application.applicant ?? {};
        const applicantHref = getCandidateProfileHref(applicant);
        const id = getApplicationId(application);
        return (<div key={id} className="site-border site-card rounded-lg border p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_190px] md:items-start">
              <div>
                {applicantHref ? (<Link href={applicantHref} className="site-link text-lg font-semibold">
                    {applicant.username ?? applicant.email ?? "Applicant"}
                  </Link>) : (<p className="text-lg font-semibold">{applicant.username ?? applicant.email ?? "Applicant"}</p>)}
                <p className="site-muted mt-1 text-sm">{applicant.email ?? "No email"}</p>
                {application.coverLetter ? (<p className="site-muted mt-4 whitespace-pre-line text-sm leading-6">{application.coverLetter}</p>) : null}
              </div>
              <div className="w-32 justify-self-end">
                <SelectField value={application.status ?? "submitted"} onChange={(nextStatus) => requestStatusChange(application, nextStatus)} options={statusOptions} disabled={updatingId === id} className="site-field min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"/>
              </div>
            </div>
          </div>);
    })}
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
