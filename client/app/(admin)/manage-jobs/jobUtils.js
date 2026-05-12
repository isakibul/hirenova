import {
  maxLengthError,
  minLengthError,
  optionalNumberError,
} from "@lib/formValidation";

export const emptyForm = {
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

export const jobTypes = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "remote", label: "Remote" },
  { value: "contract", label: "Contract" },
];

export const jobSortOptions = [
  { value: "updatedAt", label: "Updated Date" },
  { value: "createdAt", label: "Created Date" },
  { value: "title", label: "Title" },
  { value: "salary", label: "Salary" },
];

export const jobTypeOptions = [{ value: "", label: "Select type" }, ...jobTypes];

export const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

export const approvalFilterOptions = [
  { value: "all", label: "All approvals" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

export function formatSalary(value) {
  if (typeof value !== "number") {
    return "Not disclosed";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatJobStatus(job) {
  if (job.expiresAt && new Date(job.expiresAt) <= new Date()) {
    return "Expired";
  }

  return job.status === "closed" ? "Closed" : "Open";
}

export function getStatusClass(job) {
  return formatJobStatus(job) === "Open" ? "site-success" : "site-danger";
}

export function formatApprovalStatus(value) {
  if (value === "declined") {
    return "Declined";
  }

  if (value === "pending") {
    return "Pending";
  }

  return "Approved";
}

export function formatApprovalHistoryAction(value) {
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

export function getApprovalHistoryClass(value) {
  if (value === "declined") {
    return "site-danger";
  }

  if (value === "approved") {
    return "site-success";
  }

  return "site-badge";
}

export function formatApprovalStatusRole(value) {
  if (value === "superadmin") {
    return "super admin";
  }

  if (value === "jobseeker") {
    return "jobseeker";
  }

  return value ?? "user";
}

export function getApprovalClass(value) {
  if (value === "declined") {
    return "site-danger";
  }

  if (value === "pending") {
    return "site-badge";
  }

  return "site-success";
}

export function formatJobType(value) {
  if (!value) {
    return "Not set";
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatExperience(job) {
  const min =
    typeof job.experienceMin === "number"
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

export function validateJobForm(form) {
  const minExperience =
    form.experienceMin.trim() === "" ? undefined : Number(form.experienceMin);
  const maxExperience =
    form.experienceMax.trim() === "" ? undefined : Number(form.experienceMax);
  const errors = {
    title:
      minLengthError(form.title, "Title", 10) ||
      maxLengthError(form.title, "Title", 150),
    description: maxLengthError(form.description, "Description", 5000),
    location: maxLengthError(form.location, "Location", 100),
    jobType:
      form.jobType && !jobTypes.some((type) => type.value === form.jobType)
        ? "Choose a valid job type."
        : "",
    experienceMin: optionalNumberError(
      form.experienceMin,
      "Minimum experience",
      { min: 0 },
    ),
    experienceMax: optionalNumberError(
      form.experienceMax,
      "Maximum experience",
      { min: 0 },
    ),
    salary: optionalNumberError(form.salary, "Salary", { min: 0 }),
    skillsRequired: maxLengthError(form.skillsRequired, "Skills", 500),
    expiresAt:
      form.expiresAt && Number.isNaN(new Date(form.expiresAt).getTime())
        ? "Choose a valid expiry date."
        : "",
  };

  if (
    !errors.experienceMin &&
    !errors.experienceMax &&
    typeof minExperience === "number" &&
    typeof maxExperience === "number" &&
    minExperience > maxExperience
  ) {
    errors.experienceMax =
      "Maximum experience must be greater than or equal to minimum experience.";
  }

  return errors;
}

export function buildPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    location: form.location.trim() || undefined,
    jobType: form.jobType || undefined,
    skillsRequired: form.skillsRequired
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    experienceMin:
      form.experienceMin.trim() === "" ? undefined : Number(form.experienceMin),
    experienceMax:
      form.experienceMax.trim() === "" ? undefined : Number(form.experienceMax),
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

export function getFormFromJob(job) {
  return {
    title: job.title ?? "",
    description: job.description ?? "",
    location: job.location ?? "",
    jobType: job.jobType ?? "",
    skillsRequired: job.skillsRequired?.join(", ") ?? "",
    experienceMin:
      typeof job.experienceMin === "number"
        ? String(job.experienceMin)
        : typeof job.experienceRequired === "number"
          ? String(job.experienceRequired)
          : "",
    experienceMax:
      typeof job.experienceMax === "number" ? String(job.experienceMax) : "",
    salary: typeof job.salary === "number" ? String(job.salary) : "",
    expiresAt: getDateInputValue(job.expiresAt),
  };
}
