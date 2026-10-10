"use client";

import Icon from "@components/Icon";
import PaginationControls from "@components/PaginationControls";
import { TableRowsSkeleton } from "@components/Skeleton";
import { formatDate, getRecordId as getJobId } from "@lib/ui";
import Link from "next/link";
import {
  formatApprovalStatus,
  formatExperience,
  formatJobStatus,
  formatJobType,
  formatSalary,
  getApprovalClass,
  getStatusClass,
} from "./jobUtils";

export default function ManageJobsTable({
  deletingJobId,
  editingJobId,
  isAdmin,
  isLoading,
  jobs,
  loadingJobId,
  onDelete,
  onEdit,
  onOpenHistory,
  onPageChange,
  onReview,
  onStatusChange,
  pagination,
  page,
  reviewingJobId,
  statusUpdatingJobId,
  totalPages,
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1540px] table-fixed border-collapse text-left text-sm">
          <thead className="site-panel text-xs uppercase tracking-wide">
            <tr>
              <th className="w-[30%] px-4 py-3 font-semibold">Job</th>
              <th className="w-[120px] whitespace-nowrap px-4 py-3 font-semibold">
                Type
              </th>
              <th className="w-[130px] whitespace-nowrap px-4 py-3 font-semibold">
                Salary
              </th>
              <th className="w-[140px] whitespace-nowrap px-4 py-3 font-semibold">
                Status
              </th>
              <th className="w-[170px] whitespace-nowrap px-4 py-3 font-semibold">
                Approval
              </th>
              <th className="w-[620px] whitespace-nowrap px-4 py-3 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRowsSkeleton columns={6} rows={6} />
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <p className="font-semibold">No jobs found</p>
                  <p className="site-muted mt-1 text-xs">
                    Create a new listing or adjust your search.
                  </p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const jobId = getJobId(job);
                const isSelected = editingJobId === jobId;

                return (
                  <tr
                    key={jobId}
                    className={isSelected ? "bg-[var(--site-panel)]" : ""}
                  >
                    <td className="border-t border-[var(--site-border)] px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="site-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                          <Icon name="briefcase" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {job.title ?? "Untitled job"}
                          </p>
                          <p className="site-muted mt-1 text-xs">
                            {job.location ?? "Location not set"} ·{" "}
                            {formatExperience(job)}
                          </p>
                          {job.skillsRequired?.length ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {job.skillsRequired.slice(0, 3).map((skill) => (
                                <span
                                  key={`${jobId}-${skill}`}
                                  className="site-badge rounded px-2 py-1 text-[11px]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-t border-[var(--site-border)] px-4 py-3 align-middle">
                      {formatJobType(job.jobType)}
                    </td>
                    <td className="whitespace-nowrap border-t border-[var(--site-border)] px-4 py-3 align-middle">
                      {formatSalary(job.salary)}
                    </td>
                    <td className="whitespace-nowrap border-t border-[var(--site-border)] px-4 py-3 align-middle text-xs">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 font-semibold ${getStatusClass(job)}`}
                      >
                        {formatJobStatus(job)}
                      </span>
                      {job.expiresAt ? (
                        <p className="site-muted mt-1">
                          Expires {formatDate(job.expiresAt)}
                        </p>
                      ) : null}
                    </td>
                    <td className="border-t border-[var(--site-border)] px-4 py-3 align-middle text-xs">
                      <span
                        className={`inline-flex max-w-full rounded-md border px-2 py-1 font-semibold ${getApprovalClass(job.approvalStatus)}`}
                      >
                        {formatApprovalStatus(job.approvalStatus)}
                      </span>
                      {job.approvalStatus === "declined" && job.rejectionNote ? (
                        <p className="site-muted mt-1 line-clamp-2 whitespace-normal">
                          {job.rejectionNote}
                        </p>
                      ) : null}
                    </td>
                    <td className="border-t border-[var(--site-border)] px-4 py-3 align-middle">
                      <div className="flex flex-nowrap items-center justify-start gap-2">
                        <Link
                          href={`/jobs/${jobId}`}
                          className="site-border site-field inline-flex min-w-[64px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold"
                        >
                          View
                        </Link>
                        <Link
                          href={`/manage-jobs/${jobId}/applications`}
                          className="site-border site-field inline-flex min-w-[96px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold"
                        >
                          Applicants
                        </Link>
                        <button
                          type="button"
                          onClick={() => onEdit(job)}
                          disabled={loadingJobId === jobId}
                          className="site-border site-field inline-flex min-w-[64px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                        >
                          {loadingJobId === jobId
                            ? "Loading"
                            : !isAdmin && job.approvalStatus === "declined"
                              ? "Fix & Resubmit"
                              : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(job)}
                          disabled={statusUpdatingJobId === jobId}
                          className="site-border site-field inline-flex min-w-[72px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                        >
                          {statusUpdatingJobId === jobId
                            ? "Saving"
                            : job.status === "closed"
                              ? "Reopen"
                              : "Close"}
                        </button>
                        {isAdmin && job.approvalStatus !== "approved" ? (
                          <button
                            type="button"
                            onClick={() => onReview(job, "approved")}
                            disabled={reviewingJobId === jobId}
                            className="inline-flex min-w-[82px] justify-center rounded-md border border-[var(--site-success-border)] bg-[var(--site-success-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-success-text)] disabled:opacity-60"
                          >
                            {reviewingJobId === jobId ? "Saving" : "Approve"}
                          </button>
                        ) : null}
                        {isAdmin && job.approvalStatus !== "declined" ? (
                          <button
                            type="button"
                            onClick={() => onReview(job, "declined")}
                            disabled={reviewingJobId === jobId}
                            className="inline-flex min-w-[76px] justify-center rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-60"
                          >
                            Decline
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onOpenHistory(job)}
                          className="site-border site-field inline-flex min-w-[74px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold"
                        >
                          History
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(job)}
                          disabled={deletingJobId === jobId}
                          className="inline-flex min-w-[72px] justify-center rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-60"
                        >
                          {deletingJobId === jobId ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={pagination?.page ?? page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </>
  );
}
