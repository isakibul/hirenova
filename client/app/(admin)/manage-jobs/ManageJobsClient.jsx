"use client";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import FieldError from "@components/forms/FieldError";
import SelectField from "@components/forms/SelectField";
import Icon from "@components/Icon";
import { getVisibleErrors, hasValidationErrors, maxLengthError, minLengthError, optionalNumberError, touchAll, } from "@lib/formValidation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
const emptyForm = {
    title: "",
    description: "",
    location: "",
    jobType: "",
    skillsRequired: "",
    experienceMin: "",
    experienceMax: "",
    salary: "",
    expiresAt: "",
};
const jobTypes = [
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "remote", label: "Remote" },
    { value: "contract", label: "Contract" },
];
const jobSortOptions = [
    { value: "updatedAt", label: "Updated Date" },
    { value: "createdAt", label: "Created Date" },
    { value: "title", label: "Title" },
    { value: "salary", label: "Salary" },
];
const jobTypeOptions = [
    { value: "", label: "Select type" },
    ...jobTypes,
];
const statusFilterOptions = [
    { value: "all", label: "All statuses" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
];
const approvalFilterOptions = [
    { value: "all", label: "All approvals" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "declined", label: "Declined" },
];
function getMessage(response) {
    if (response.errors?.length) {
        return response.errors.join(" ");
    }
    return response.error ?? response.message ?? "Something went wrong.";
}
function formatDate(value) {
    if (!value) {
        return "Not available";
    }
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}
function formatDateTime(value) {
    if (!value) {
        return "Not available";
    }
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}
function formatSalary(value) {
    if (typeof value !== "number") {
        return "Not disclosed";
    }
    return new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}
function formatJobStatus(job) {
    if (job.expiresAt && new Date(job.expiresAt) <= new Date()) {
        return "Expired";
    }
    return job.status === "closed" ? "Closed" : "Open";
}
function getStatusClass(job) {
    const status = formatJobStatus(job);
    return status === "Open" ? "site-success" : "site-danger";
}
function formatApprovalStatus(value) {
    if (value === "declined") {
        return "Declined";
    }
    if (value === "pending") {
        return "Pending";
    }
    return "Approved";
}
function formatApprovalHistoryAction(value) {
    if (value === "resubmitted") {
        return "Resubmitted";
    }
    if (value === "submitted") {
        return "Submitted";
    }
    if (value === "declined") {
        return "Declined";
    }
    return "Approved";
}
function getApprovalHistoryClass(value) {
    if (value === "declined") {
        return "site-danger";
    }
    if (value === "approved") {
        return "site-success";
    }
    return "site-badge";
}
function formatApprovalStatusRole(value) {
    if (value === "superadmin") {
        return "super admin";
    }
    if (value === "jobseeker") {
        return "jobseeker";
    }
    return value ?? "user";
}
function getApprovalClass(value) {
    if (value === "declined") {
        return "site-danger";
    }
    if (value === "pending") {
        return "site-badge";
    }
    return "site-success";
}
function formatJobType(value) {
    if (!value) {
        return "Not set";
    }
    return value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
function formatExperience(job) {
    const min = typeof job.experienceMin === "number"
        ? job.experienceMin
        : job.experienceRequired;
    const max = job.experienceMax;
    if (typeof min === "number" && typeof max === "number") {
        return min === max ? `${min} years` : `${min}-${max} years`;
    }
    if (typeof min === "number") {
        return `${min}+ years`;
    }
    if (typeof max === "number") {
        return `Up to ${max} years`;
    }
    return "Experience not set";
}
function getJobId(job) {
    return job.id ?? job._id ?? "";
}
function validateJobForm(form) {
    const minExperience = form.experienceMin.trim() === ""
        ? undefined
        : Number(form.experienceMin);
    const maxExperience = form.experienceMax.trim() === ""
        ? undefined
        : Number(form.experienceMax);
    const errors = {
        title: minLengthError(form.title, "Title", 10) ||
            maxLengthError(form.title, "Title", 150),
        description: maxLengthError(form.description, "Description", 5000),
        location: maxLengthError(form.location, "Location", 100),
        jobType: form.jobType && !jobTypes.some((type) => type.value === form.jobType)
            ? "Choose a valid job type."
            : "",
        experienceMin: optionalNumberError(form.experienceMin, "Minimum experience", { min: 0 }),
        experienceMax: optionalNumberError(form.experienceMax, "Maximum experience", { min: 0 }),
        salary: optionalNumberError(form.salary, "Salary", { min: 0 }),
        skillsRequired: maxLengthError(form.skillsRequired, "Skills", 500),
        expiresAt: form.expiresAt &&
            Number.isNaN(new Date(form.expiresAt).getTime())
            ? "Choose a valid expiry date."
            : "",
    };
    if (!errors.experienceMin &&
        !errors.experienceMax &&
        typeof minExperience === "number" &&
        typeof maxExperience === "number" &&
        minExperience > maxExperience) {
        errors.experienceMax =
            "Maximum experience must be greater than or equal to minimum experience.";
    }
    return errors;
}
function buildPayload(form) {
    return {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        jobType: form.jobType || undefined,
        skillsRequired: form.skillsRequired
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        experienceMin: form.experienceMin.trim() === ""
            ? undefined
            : Number(form.experienceMin),
        experienceMax: form.experienceMax.trim() === ""
            ? undefined
            : Number(form.experienceMax),
        salary: form.salary.trim() === "" ? undefined : Number(form.salary),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
}
function getDateInputValue(value) {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toISOString().slice(0, 10);
}
function getFormFromJob(job) {
    return {
        title: job.title ?? "",
        description: job.description ?? "",
        location: job.location ?? "",
        jobType: job.jobType ?? "",
        skillsRequired: job.skillsRequired?.join(", ") ?? "",
        experienceMin: typeof job.experienceMin === "number"
            ? String(job.experienceMin)
            : typeof job.experienceRequired === "number"
            ? String(job.experienceRequired)
            : "",
        experienceMax: typeof job.experienceMax === "number"
            ? String(job.experienceMax)
            : "",
        salary: typeof job.salary === "number" ? String(job.salary) : "",
        expiresAt: getDateInputValue(job.expiresAt),
    };
}
export default function ManageJobsClient({ currentRole = "admin", initialApprovalFilter = "all" }) {
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("updatedAt");
    const [sortType, setSortType] = useState("dsc");
    const [statusFilter, setStatusFilter] = useState("all");
    const [approvalFilter, setApprovalFilter] = useState(approvalFilterOptions.some((option) => option.value === initialApprovalFilter)
        ? initialApprovalFilter
        : "all");
    const [form, setForm] = useState(emptyForm);
    const [formTouched, setFormTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingJobId, setLoadingJobId] = useState(null);
    const [statusUpdatingJobId, setStatusUpdatingJobId] = useState(null);
    const [reviewingJobId, setReviewingJobId] = useState(null);
    const [deletingJobId, setDeletingJobId] = useState(null);
    const [jobPendingDelete, setJobPendingDelete] = useState(null);
    const [jobPendingDecline, setJobPendingDecline] = useState(null);
    const [jobHistoryTarget, setJobHistoryTarget] = useState(null);
    const [rejectionNote, setRejectionNote] = useState("");
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState(null);
    const selectedJob = useMemo(() => jobs.find((job) => getJobId(job) === editingJobId), [editingJobId, jobs]);
    const approvalHistory = useMemo(() => [...(jobHistoryTarget?.approvalHistory ?? [])].sort((first, second) => new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()), [jobHistoryTarget]);
    const declinedHistory = useMemo(() => approvalHistory.filter((item) => item.action === "declined"), [approvalHistory]);
    const validationErrors = validateJobForm(form);
    const visibleErrors = getVisibleErrors(validationErrors, formTouched, submitAttempted);
    function updateFormField(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }
    function markFormTouched(field) {
        setFormTouched((current) => ({
            ...current,
            [field]: true,
        }));
    }
    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({
            page: String(page),
            limit: "10",
            sort_by: sortBy,
            sort_type: sortType,
        });
        if (search) {
            params.set("search", search);
        }
        if (statusFilter !== "all") {
            params.set("status", statusFilter);
        }
        if (approvalFilter !== "all") {
            params.set("approval_status", approvalFilter);
        }
        try {
            const response = await fetch(`/api/manage-jobs?${params.toString()}`);
            const body = (await response.json());
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
            setJobs(body.data ?? []);
            setPagination(body.pagination);
        }
        catch (caughtError) {
            setJobs([]);
            setPagination(undefined);
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to load jobs.");
        }
        finally {
            setIsLoading(false);
        }
    }, [approvalFilter, page, search, sortBy, sortType, statusFilter]);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadJobs();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadJobs]);
    useEffect(() => {
        if (!jobPendingDelete || deletingJobId) {
            return;
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setJobPendingDelete(null);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [deletingJobId, jobPendingDelete]);
    useEffect(() => {
        if (!jobPendingDecline || reviewingJobId) {
            return;
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setJobPendingDecline(null);
                setRejectionNote("");
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [jobPendingDecline, reviewingJobId]);
    useEffect(() => {
        if (!jobHistoryTarget) {
            return;
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setJobHistoryTarget(null);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [jobHistoryTarget]);
    function resetForm() {
        setForm(emptyForm);
        setFormTouched({});
        setSubmitAttempted(false);
        setEditingJobId(null);
        setIsFormOpen(true);
        setNotice(null);
        setError(null);
    }
    async function handleEdit(job) {
        const jobId = getJobId(job);
        if (!jobId) {
            return;
        }
        setLoadingJobId(jobId);
        setNotice(null);
        setError(null);
        try {
            const response = await fetch(`/api/manage-jobs/${jobId}`);
            const body = (await response.json());
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body));
            }
            setEditingJobId(jobId);
            setForm(getFormFromJob({ ...job, ...body.data, id: jobId }));
            setFormTouched({});
            setSubmitAttempted(false);
            setIsFormOpen(true);
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to load this job.");
        }
        finally {
            setLoadingJobId(null);
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitAttempted(true);
        setFormTouched(touchAll(validationErrors));
        setNotice(null);
        setError(null);
        if (hasValidationErrors(validationErrors)) {
            return;
        }
        setIsSubmitting(true);
        const payload = buildPayload(form);
        const isResubmission = !isAdmin && selectedJob?.approvalStatus === "declined";
        const target = editingJobId
            ? `/api/manage-jobs/${editingJobId}`
            : "/api/manage-jobs";
        const method = editingJobId ? "PATCH" : "POST";
        try {
            const response = await fetch(target, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const body = (await response.json());
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
            setNotice(editingJobId
                ? isResubmission
                    ? "Job updated and resubmitted for admin review."
                    : isAdmin
                    ? "Job updated."
                    : "Job updated and sent for admin review."
                : isAdmin
                    ? "Job created."
                    : "Job submitted for admin approval.");
            setForm(emptyForm);
            setFormTouched({});
            setSubmitAttempted(false);
            setEditingJobId(null);
            await loadJobs();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to save job.");
        }
        finally {
            setIsSubmitting(false);
        }
    }
    function handleDelete(job) {
        setJobPendingDelete(job);
    }
    async function updateJobStatus(job) {
        const jobId = getJobId(job);
        if (!jobId) {
            return;
        }
        const nextStatus = job.status === "closed" ? "open" : "closed";
        setStatusUpdatingJobId(jobId);
        setNotice(null);
        setError(null);
        try {
            const response = await fetch(`/api/manage-jobs/${jobId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: nextStatus }),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
            setNotice(nextStatus === "closed" ? "Job closed." : "Job reopened.");
            await loadJobs();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to update job status.");
        }
        finally {
            setStatusUpdatingJobId(null);
        }
    }
    async function reviewJob(job, approvalStatus, note = "") {
        const jobId = getJobId(job);
        if (!jobId) {
            return;
        }
        setReviewingJobId(jobId);
        setNotice(null);
        setError(null);
        try {
            const response = await fetch(`/api/manage-jobs/${jobId}/approval`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    approvalStatus,
                    rejectionNote: note,
                }),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
            setNotice(approvalStatus === "approved" ? "Job approved." : "Job declined.");
            setJobPendingDecline(null);
            setRejectionNote("");
            await loadJobs();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to review job.");
        }
        finally {
            setReviewingJobId(null);
        }
    }
    function handleDecline(job) {
        setJobPendingDecline(job);
        setRejectionNote(job.rejectionNote ?? "");
        setNotice(null);
        setError(null);
    }
    async function confirmDecline(event) {
        event.preventDefault();
        if (!jobPendingDecline) {
            return;
        }
        if (!rejectionNote.trim()) {
            setError("Write a note so the employer knows what to fix.");
            return;
        }
        await reviewJob(jobPendingDecline, "declined", rejectionNote.trim());
    }
    async function confirmDelete() {
        if (!jobPendingDelete) {
            return;
        }
        const jobId = getJobId(jobPendingDelete);
        if (!jobId) {
            setJobPendingDelete(null);
            return;
        }
        setDeletingJobId(jobId);
        setNotice(null);
        setError(null);
        try {
            const response = await fetch(`/api/manage-jobs/${jobId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const body = (await response.json());
                throw new Error(getMessage(body));
            }
            if (editingJobId === jobId) {
                resetForm();
            }
            setJobPendingDelete(null);
            setNotice("Job deleted.");
            await loadJobs();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to delete job.");
        }
        finally {
            setDeletingJobId(null);
        }
    }
    function handleSearch(event) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }
    const totalItems = pagination?.totalItems ?? jobs.length;
    const totalPages = pagination?.totalPage ?? 1;
    const isAdmin = currentRole === "admin" || currentRole === "superadmin";
    return (<section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              {currentRole === "superadmin" ? "Super Admin" : isAdmin ? "Admin" : "Employer"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Manage Jobs
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              {isAdmin
            ? "Create, review, update, and remove job listings."
            : "Create, review, update, and remove your job listings."}
            </p>
          </div>
          <button type="button" onClick={resetForm} className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition">
            <Icon name="plus"/>
            New Job
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Total Results</p>
            <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Current Page</p>
            <p className="mt-2 text-2xl font-semibold">
              {pagination?.page ?? page}
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Sort</p>
            <p className="mt-2 text-2xl font-semibold">
              {sortType === "dsc" ? "Newest" : "Oldest"}
            </p>
          </div>
        </div>

        {(notice || error) && (<div className={`mt-5 rounded-lg border px-4 py-3 text-sm ${error ? "site-danger" : "site-success"}`}>
            {error ?? notice}
          </div>)}

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_415px]">
          <div className="site-border site-card min-w-0 overflow-hidden rounded-lg border">
            <div className="site-panel border-b border-[var(--site-border)] p-4">
              <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_160px_150px_160px_120px]">
                <label className="relative">
                  <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="search"/>
                  </span>
                  <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none" placeholder="Search by job title"/>
                </label>
                <SelectField value={sortBy} onChange={(nextValue) => {
            setPage(1);
            setSortBy(nextValue);
        }} options={jobSortOptions} className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"/>
                <SelectField value={statusFilter} onChange={(nextValue) => {
            setPage(1);
            setStatusFilter(nextValue);
        }} options={statusFilterOptions} className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"/>
                <SelectField value={approvalFilter} onChange={(nextValue) => {
            setPage(1);
            setApprovalFilter(nextValue);
        }} options={approvalFilterOptions} className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"/>
                <button className="site-button h-10 rounded-md px-3 text-sm font-semibold transition">
                  Search
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => {
            setPage(1);
            setSortType((current) => current === "dsc" ? "asc" : "dsc");
        }} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold">
                  {sortType === "dsc" ? "Descending" : "Ascending"}
                </button>
                {search || statusFilter !== "all" || approvalFilter !== "all" ? (<button type="button" onClick={() => {
                setSearch("");
                setSearchInput("");
                setStatusFilter("all");
                setApprovalFilter("all");
                setPage(1);
            }} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold">
                    Clear Filters
                  </button>) : null}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1420px] table-fixed border-collapse text-left text-sm">
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
                    <th className="w-[500px] whitespace-nowrap px-4 py-3 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (<tr>
                      <td colSpan={6} className="site-muted px-4 py-10 text-center">
                        Loading jobs...
                      </td>
                    </tr>) : jobs.length === 0 ? (<tr>
                      <td colSpan={6} className="px-4 py-10 text-center">
                        <p className="font-semibold">No jobs found</p>
                        <p className="site-muted mt-1 text-xs">
                          Create a new listing or adjust your search.
                        </p>
                      </td>
                    </tr>) : (jobs.map((job) => {
            const jobId = getJobId(job);
            const isSelected = editingJobId === jobId;
            return (<tr key={jobId} className={isSelected ? "bg-[var(--site-panel)]" : ""}>
                          <td className="border-t border-[var(--site-border)] px-4 py-3 align-top">
                            <div className="flex gap-3">
                              <span className="site-badge mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                                <Icon name="briefcase"/>
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold">
                                  {job.title ?? "Untitled job"}
                                </p>
                                <p className="site-muted mt-1 text-xs">
                                  {job.location ?? "Location not set"} ·{" "}
                                  {formatExperience(job)}
                                </p>
                                {job.skillsRequired?.length ? (<div className="mt-2 flex flex-wrap gap-1.5">
                                    {job.skillsRequired
                        .slice(0, 3)
                        .map((skill) => (<span key={`${jobId}-${skill}`} className="site-badge rounded px-2 py-1 text-[11px]">
                                          {skill}
                                        </span>))}
                                  </div>) : null}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-t border-[var(--site-border)] px-4 py-3 align-top">
                            {formatJobType(job.jobType)}
                          </td>
                          <td className="whitespace-nowrap border-t border-[var(--site-border)] px-4 py-3 align-top">
                            {formatSalary(job.salary)}
                          </td>
                          <td className="whitespace-nowrap border-t border-[var(--site-border)] px-4 py-3 align-top text-xs">
                            <span className={`inline-flex rounded-md border px-2 py-1 font-semibold ${getStatusClass(job)}`}>
                              {formatJobStatus(job)}
                            </span>
                            {job.expiresAt ? (<p className="site-muted mt-1">
                                Expires {formatDate(job.expiresAt)}
                              </p>) : null}
                          </td>
                          <td className="border-t border-[var(--site-border)] px-4 py-3 align-top text-xs">
                            <span className={`inline-flex max-w-full rounded-md border px-2 py-1 font-semibold ${getApprovalClass(job.approvalStatus)}`}>
                              {formatApprovalStatus(job.approvalStatus)}
                            </span>
                            {job.approvalStatus === "declined" && job.rejectionNote ? (<p className="site-muted mt-1 line-clamp-2 whitespace-normal">
                                {job.rejectionNote}
                              </p>) : null}
                          </td>
                          <td className="border-t border-[var(--site-border)] px-4 py-3 pr-8 align-top">
                            <div className="flex flex-wrap justify-start gap-2">
                              <Link href={`/jobs/${jobId}`} className="site-border site-field inline-flex min-w-[64px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold">
                                View
                              </Link>
                              <Link href={`/manage-jobs/${jobId}/applications`} className="site-border site-field inline-flex min-w-[96px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold">
                                Applicants
                              </Link>
                              <button type="button" onClick={() => handleEdit(job)} disabled={loadingJobId === jobId} className="site-border site-field inline-flex min-w-[64px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60">
                                {loadingJobId === jobId
                    ? "Loading"
                    : !isAdmin && job.approvalStatus === "declined"
                        ? "Fix & Resubmit"
                        : "Edit"}
                              </button>
                              <button type="button" onClick={() => updateJobStatus(job)} disabled={statusUpdatingJobId === jobId} className="site-border site-field inline-flex min-w-[72px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60">
                                {statusUpdatingJobId === jobId
                    ? "Saving"
                    : job.status === "closed"
                        ? "Reopen"
                        : "Close"}
                              </button>
                              {isAdmin && job.approvalStatus !== "approved" ? (<button type="button" onClick={() => reviewJob(job, "approved")} disabled={reviewingJobId === jobId} className="inline-flex min-w-[82px] justify-center rounded-md border border-[var(--site-success-border)] bg-[var(--site-success-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-success-text)] disabled:opacity-60">
                                  {reviewingJobId === jobId ? "Saving" : "Approve"}
                                </button>) : null}
                              {isAdmin && job.approvalStatus !== "declined" ? (<button type="button" onClick={() => handleDecline(job)} disabled={reviewingJobId === jobId} className="inline-flex min-w-[76px] justify-center rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-60">
                                  Decline
                                </button>) : null}
                              <button type="button" onClick={() => setJobHistoryTarget(job)} className="site-border site-field inline-flex min-w-[74px] justify-center rounded-md border px-3 py-1.5 text-xs font-semibold">
                                History
                              </button>
                              <button type="button" onClick={() => handleDelete(job)} disabled={deletingJobId === jobId} className="inline-flex min-w-[72px] justify-center rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-60">
                                {deletingJobId === jobId
                    ? "Deleting"
                    : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>);
        }))}
                </tbody>
              </table>
            </div>

            <div className="site-panel flex flex-col gap-3 border-t border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="site-muted text-xs">
                Page {pagination?.page ?? page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1 || isLoading} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                  Previous
                </button>
                <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages))} disabled={page >= totalPages || isLoading} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>

          <aside className="site-border site-card self-start rounded-lg border">
            <div className="flex items-center justify-between border-b border-[var(--site-border)] px-4 py-3">
              <div>
                <h2 className="font-semibold">
                  {editingJobId ? "Edit Job" : "Create Job"}
                </h2>
                <p className="site-muted mt-1 text-xs">
                  {editingJobId
            ? (selectedJob?.title ?? "Update selected listing")
            : isAdmin
                ? "Publish a new listing"
                : "Submit a new listing for admin approval"}
                </p>
              </div>
              <button type="button" onClick={() => setIsFormOpen((current) => !current)} className="site-border site-field rounded-md border p-2" aria-label={isFormOpen ? "Collapse form" : "Expand form"}>
                <Icon name={isFormOpen ? "x" : "plus"}/>
              </button>
            </div>

            {isFormOpen ? (<form onSubmit={handleSubmit} noValidate className="space-y-4 p-4">
                {!isAdmin ? (<div className="site-border site-panel rounded-lg border p-3 text-xs leading-5">
                    New and edited jobs enter admin review before appearing in public job search.
                  </div>) : null}
                {selectedJob?.approvalStatus === "declined" && selectedJob.rejectionNote ? (<div className="site-danger rounded-lg border p-3 text-xs leading-5">
                    <span className="font-semibold">Admin note: </span>
                    {selectedJob.rejectionNote}
                    {!isAdmin ? (<p className="mt-2 font-semibold">
                        Update the job details and resubmit it for admin review.
                      </p>) : null}
                  </div>) : null}
                <label className="block">
                  <span className="text-sm font-medium">Title</span>
                  <input value={form.title} onChange={(event) => updateFormField("title", event.target.value)} onBlur={() => markFormTouched("title")} aria-invalid={Boolean(visibleErrors.title)} aria-describedby={visibleErrors.title ? "job-title-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={10} maxLength={150} required placeholder="Senior Product Designer"/>
                  <FieldError id="job-title-error" message={visibleErrors.title}/>
                </label>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <label className="block">
                    <span className="text-sm font-medium">Location</span>
                    <input value={form.location} onChange={(event) => updateFormField("location", event.target.value)} onBlur={() => markFormTouched("location")} aria-invalid={Boolean(visibleErrors.location)} aria-describedby={visibleErrors.location ? "job-location-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" maxLength={100} placeholder="Dhaka or Remote"/>
                    <FieldError id="job-location-error" message={visibleErrors.location}/>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Job Type</span>
                    <SelectField value={form.jobType} onChange={(nextValue) => updateFormField("jobType", nextValue)} onBlur={() => markFormTouched("jobType")} options={jobTypeOptions} className="site-field mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" ariaInvalid={Boolean(visibleErrors.jobType)} ariaDescribedBy={visibleErrors.jobType ? "job-type-error" : undefined}/>
                    <FieldError id="job-type-error" message={visibleErrors.jobType}/>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <span className="text-sm font-medium">Experience Range</span>
                    <div className="mt-1 grid gap-3 sm:grid-cols-2">
                      <input value={form.experienceMin} onChange={(event) => updateFormField("experienceMin", event.target.value)} onBlur={() => markFormTouched("experienceMin")} aria-invalid={Boolean(visibleErrors.experienceMin)} aria-describedby={visibleErrors.experienceMin ? "job-experience-min-error" : undefined} className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none" min={0} type="number" placeholder="Min"/>
                      <input value={form.experienceMax} onChange={(event) => updateFormField("experienceMax", event.target.value)} onBlur={() => markFormTouched("experienceMax")} aria-invalid={Boolean(visibleErrors.experienceMax)} aria-describedby={visibleErrors.experienceMax ? "job-experience-max-error" : undefined} className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none" min={0} type="number" placeholder="Max"/>
                    </div>
                    <FieldError id="job-experience-min-error" message={visibleErrors.experienceMin}/>
                    <FieldError id="job-experience-max-error" message={visibleErrors.experienceMax}/>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium">Salary</span>
                    <input value={form.salary} onChange={(event) => updateFormField("salary", event.target.value)} onBlur={() => markFormTouched("salary")} aria-invalid={Boolean(visibleErrors.salary)} aria-describedby={visibleErrors.salary ? "job-salary-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" min={0} type="number" placeholder="90000"/>
                    <FieldError id="job-salary-error" message={visibleErrors.salary}/>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium">Expiry Date</span>
                  <input value={form.expiresAt} onChange={(event) => updateFormField("expiresAt", event.target.value)} onBlur={() => markFormTouched("expiresAt")} aria-invalid={Boolean(visibleErrors.expiresAt)} aria-describedby={visibleErrors.expiresAt ? "job-expires-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" type="date"/>
                  <FieldError id="job-expires-error" message={visibleErrors.expiresAt}/>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Skills Required</span>
                  <input value={form.skillsRequired} onChange={(event) => updateFormField("skillsRequired", event.target.value)} onBlur={() => markFormTouched("skillsRequired")} aria-invalid={Boolean(visibleErrors.skillsRequired)} aria-describedby={visibleErrors.skillsRequired ? "job-skills-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="React, Node.js, Product Design"/>
                  <FieldError id="job-skills-error" message={visibleErrors.skillsRequired}/>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Description</span>
                  <textarea value={form.description} onChange={(event) => updateFormField("description", event.target.value)} onBlur={() => markFormTouched("description")} aria-invalid={Boolean(visibleErrors.description)} aria-describedby={visibleErrors.description ? "job-description-error" : undefined} className="site-field mt-1 min-h-36 w-full resize-y rounded-md border px-3 py-2 text-sm leading-6 focus:outline-none" maxLength={5000} placeholder="Describe responsibilities, outcomes, and requirements."/>
                  <FieldError id="job-description-error" message={visibleErrors.description}/>
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="submit" disabled={isSubmitting} className="site-button inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70">
                    <Icon name="check"/>
                    {isSubmitting
                ? "Saving..."
                : editingJobId
                    ? !isAdmin && selectedJob?.approvalStatus === "declined"
                        ? "Resubmit for Review"
                        : "Save Changes"
                    : "Create Job"}
                  </button>
                  {editingJobId ? (<button type="button" onClick={resetForm} className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold">
                      Cancel
                    </button>) : null}
                </div>
              </form>) : null}
          </aside>
        </div>
      </div>

      {jobPendingDecline ? (<Modal ariaLabelledBy="decline-job-title" ariaDescribedBy="decline-job-description" onClose={reviewingJobId === getJobId(jobPendingDecline) ? undefined : () => {
            setJobPendingDecline(null);
            setRejectionNote("");
        }} panelClassName="max-w-md">
          <form onSubmit={confirmDecline}>
            <div className="flex items-start gap-3 border-b border-[var(--site-border)] p-5">
              <span className="rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] p-2 text-[var(--site-danger-text)]">
                <Icon name="x"/>
              </span>
              <div className="min-w-0">
                <h2 id="decline-job-title" className="text-lg font-semibold">
                  Decline job post?
                </h2>
                <p id="decline-job-description" className="site-muted mt-1 text-sm leading-6">
                  Send a clear note to the employer explaining what needs to be
                  fixed before approval.
                </p>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <label className="block">
                <span className="text-sm font-medium">Decline note</span>
                <textarea value={rejectionNote} onChange={(event) => setRejectionNote(event.target.value)} className="site-field mt-1 min-h-32 w-full resize-y rounded-md border px-3 py-2 text-sm leading-6 focus:outline-none" maxLength={1000} required placeholder="Example: Please include a clearer responsibilities section and salary range."/>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--site-border)] p-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => {
            setJobPendingDecline(null);
            setRejectionNote("");
        }} disabled={reviewingJobId === getJobId(jobPendingDecline)} className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={reviewingJobId === getJobId(jobPendingDecline)} className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--site-danger-text)] disabled:opacity-60">
                <Icon name="x"/>
                {reviewingJobId === getJobId(jobPendingDecline)
                ? "Declining..."
                : "Decline Job"}
              </button>
            </div>
          </form>
        </Modal>) : null}

      {jobHistoryTarget ? (<Modal ariaLabelledBy="job-history-title" onClose={() => setJobHistoryTarget(null)} panelClassName="max-h-[90vh] max-w-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--site-border)] p-5">
              <div className="min-w-0">
                <h2 id="job-history-title" className="text-lg font-semibold">
                  Review History
                </h2>
                <p className="site-muted mt-1 truncate text-sm">
                  {jobHistoryTarget.title ?? "Selected job"}
                </p>
              </div>
              <button type="button" onClick={() => setJobHistoryTarget(null)} className="site-border site-field rounded-md border p-2" aria-label="Close history">
                <Icon name="x"/>
              </button>
            </div>

            <div className="max-h-[calc(90vh-92px)] space-y-5 overflow-y-auto p-5">
              <section>
                <h3 className="text-sm font-semibold">Declined Messages</h3>
                {declinedHistory.length > 0 ? (<div className="mt-3 space-y-3">
                    {declinedHistory.map((item, index) => (<div key={`declined-${item.createdAt ?? index}`} className="site-danger rounded-md border p-3 text-sm leading-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span>Declined</span>
                          <span>{formatDateTime(item.createdAt)}</span>
                          {item.actorRole ? (<span>
                              by {formatApprovalStatusRole(item.actorRole)}
                            </span>) : null}
                        </div>
                        <p className="mt-2">{item.note || "No note provided."}</p>
                      </div>))}
                  </div>) : (<p className="site-muted mt-2 text-sm">
                    No declined messages yet.
                  </p>)}
              </section>

              <section>
                <h3 className="text-sm font-semibold">Full Timeline</h3>
                {approvalHistory.length > 0 ? (<div className="mt-3 space-y-3">
                    {approvalHistory.map((item, index) => (<div key={`${item.action}-${item.createdAt ?? index}`} className="site-border site-panel rounded-md border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${getApprovalHistoryClass(item.action)}`}>
                            {formatApprovalHistoryAction(item.action)}
                          </span>
                          <span className="site-muted text-xs">
                            {formatDateTime(item.createdAt)}
                          </span>
                          {item.actorRole ? (<span className="site-muted text-xs">
                              by {formatApprovalStatusRole(item.actorRole)}
                            </span>) : null}
                        </div>
                        {item.note ? (<p className="site-muted mt-2 text-sm leading-6">
                            {item.note}
                          </p>) : null}
                      </div>))}
                  </div>) : (<p className="site-muted mt-2 text-sm">
                    No review history recorded yet.
                  </p>)}
              </section>
            </div>
        </Modal>) : null}

      {jobPendingDelete ? (<ConfirmDialog title="Delete job?" icon="trash" tone="danger" confirmLabel="Delete Job" pendingLabel="Deleting..." isPending={deletingJobId === getJobId(jobPendingDelete)} onCancel={() => setJobPendingDelete(null)} onConfirm={confirmDelete}>
          This will permanently delete{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {jobPendingDelete.title ?? "this job"}
          </span>
          . This action cannot be undone.
        </ConfirmDialog>) : null}
    </section>);
}
