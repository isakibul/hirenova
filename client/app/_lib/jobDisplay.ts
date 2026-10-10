export const jobTypes = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "remote", label: "Remote" },
  { value: "contract", label: "Contract" },
];

export function formatJobType(value, fallback = "Not specified") {
  if (!value) {
    return fallback;
  }

  return String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSalary(value, fallback = "Not disclosed") {
  if (typeof value !== "number") {
    return fallback;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatExperience(job = {}, fallback = "Not specified") {
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

  return fallback;
}

export function getJobStatus(job = {}, { openLabel = "Open Role" } = {}) {
  if (job.approvalStatus === "pending") {
    return "Under Review";
  }

  if (job.approvalStatus === "declined") {
    return "Declined";
  }

  if (job.expiresAt && new Date(job.expiresAt) <= new Date()) {
    return "Expired";
  }

  return job.status === "closed" ? "Closed" : openLabel;
}
