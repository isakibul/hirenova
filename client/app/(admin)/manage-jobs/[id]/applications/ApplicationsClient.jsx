"use client";

import SelectField from "@components/forms/SelectField";
import { requestJson } from "@lib/clientApi";
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

export default function ApplicationsClient({ initialApplications }) {
    const [applications, setApplications] = useState(initialApplications);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

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

    return (<div className="mt-6 space-y-4">
      {error ? (<div className="site-danger rounded-lg border px-4 py-3 text-sm">{error}</div>) : null}
      {applications.length === 0 ? (<div className="site-border site-card rounded-lg border p-6">
          <p className="font-semibold">No applicants yet</p>
        </div>) : applications.map((application) => {
        const applicant = application.applicant ?? {};
        const id = getApplicationId(application);
        return (<div key={id} className="site-border site-card rounded-lg border p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_190px] md:items-start">
              <div>
                <p className="text-lg font-semibold">{applicant.username ?? applicant.email ?? "Applicant"}</p>
                <p className="site-muted mt-1 text-sm">{applicant.email ?? "No email"}</p>
                {application.coverLetter ? (<p className="site-muted mt-4 whitespace-pre-line text-sm leading-6">{application.coverLetter}</p>) : null}
              </div>
              <SelectField value={application.status ?? "submitted"} onChange={(nextStatus) => updateStatus(application, nextStatus)} options={statusOptions} disabled={updatingId === id} className="site-field min-h-10 rounded-md border px-3 py-2 text-sm focus:outline-none"/>
            </div>
          </div>);
    })}
    </div>);
}
