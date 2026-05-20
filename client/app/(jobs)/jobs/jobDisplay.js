export function formatJobType(value) {
  if (!value) {
    return "Not specified";
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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

export function formatExperience(job = {}) {
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

  return "Not specified";
}

export function getJobStatus(job = {}) {
  if (job.approvalStatus === "pending") {
    return "Under Review";
  }

  if (job.approvalStatus === "declined") {
    return "Declined";
  }

  if (job.expiresAt && new Date(job.expiresAt) <= new Date()) {
    return "Expired";
  }

  return job.status === "closed" ? "Closed" : "Open Role";
}
