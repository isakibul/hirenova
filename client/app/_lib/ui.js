const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function getApiMessage(body, fallback = "Something went wrong.") {
  if (Array.isArray(body?.errors) && body.errors.length) {
    return body.errors.join(" ");
  }

  return body?.error ?? body?.message ?? fallback;
}

export function getRecordId(record) {
  return record?.id ?? record?._id ?? "";
}

export function formatDate(value, fallback = "Not available") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return dateFormatter.format(date);
}

export function formatTitle(value, fallback = "Not set") {
  if (!value) {
    return fallback;
  }

  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export function formatExperienceYears(value, fallback = "Not set") {
  if (typeof value !== "number") {
    return fallback;
  }

  return `${value} year${value === 1 ? "" : "s"}`;
}
