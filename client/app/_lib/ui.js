const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
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

export function formatDateTime(value, fallback = "") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return dateTimeFormatter.format(date);
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

export function getDisplayName(user, fallback = "User") {
  return user?.username || user?.email || fallback;
}

export function getOtherParticipant(conversation, currentUserId) {
  return conversation?.participants?.find(
    (participant) => getRecordId(participant) !== currentUserId,
  );
}

export function getCandidateProfileHref(user) {
  const userId = getRecordId(user);
  return user?.role === "jobseeker" && userId
    ? `/candidates?candidate=${userId}`
    : "";
}

export function formatPresence(value) {
  if (!value) {
    return "Last seen not available";
  }

  const lastSeen = new Date(value);
  const diffMs = Date.now() - lastSeen.getTime();

  if (Number.isNaN(lastSeen.getTime())) {
    return "Last seen not available";
  }

  if (diffMs < 2 * 60 * 1000) {
    return "Online";
  }

  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `Last seen ${minutes} min ago`;
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
    return `Last seen ${hours} hr ago`;
  }

  return `Last seen ${formatDateTime(value)}`;
}

export function isOnline(value) {
  if (!value) {
    return false;
  }

  const lastSeen = new Date(value);

  return !Number.isNaN(lastSeen.getTime()) && Date.now() - lastSeen.getTime() < 2 * 60 * 1000;
}
