import { getApiMessage } from "./ui";

export function getBackendApiUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") ??
    "http://localhost:4000/api/v1"
  );
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return JSON.parse(window.localStorage.getItem("hirenova-auth") ?? "{}")
      .accessToken ?? "";
  } catch {
    return "";
  }
}

export function getBackendPath(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const [pathname, search = ""] = path.split("?");
  const mappedPath = mapLegacyApiPath(pathname);

  return `${getBackendApiUrl()}${mappedPath}${search ? `?${search}` : ""}`;
}

function mapLegacyApiPath(pathname) {
  if (pathname === "/api/profile") return "/auth/profile";
  if (pathname === "/api/profile/password") return "/auth/change-password";
  if (pathname === "/api/profile/resume") return "/auth/profile/resume";
  if (pathname === "/api/profile/resume/parse") return "/auth/profile/resume/parse";
  if (pathname === "/api/account/deactivate") return "/auth/deactivate";
  if (pathname === "/api/applications/me") return "/applications/me";
  if (pathname === "/api/manage-jobs") return "/jobs";
  if (pathname === "/api/manage-users") return "/admin/users";
  if (pathname === "/api/manage-newsletter") return "/admin/newsletter";
  if (pathname === "/api/operations-summary") return "/admin/operations-summary";
  if (pathname === "/api/system-monitor-summary") return "/admin/system-monitor-summary";
  if (pathname === "/api/audit-logs") return "/admin/audit-logs";
  if (pathname === "/api/email-events") return "/admin/email-events";
  if (pathname === "/api/assistant/chat") return "/assistant/chat";

  let match = pathname.match(/^\/api\/manage-jobs\/([^/]+)$/);
  if (match) return `/jobs/${match[1]}`;
  match = pathname.match(/^\/api\/manage-jobs\/([^/]+)\/status$/);
  if (match) return `/jobs/${match[1]}/status`;
  match = pathname.match(/^\/api\/manage-jobs\/([^/]+)\/approval$/);
  if (match) return `/jobs/${match[1]}/approval`;
  match = pathname.match(/^\/api\/manage-users\/([^/]+)$/);
  if (match) return `/admin/users/${match[1]}`;
  match = pathname.match(/^\/api\/manage-users\/([^/]+)\/make-admin$/);
  if (match) return `/admin/users/make-admin/${match[1]}`;
  match = pathname.match(/^\/api\/manage-newsletter\/([^/]+)$/);
  if (match) return `/admin/newsletter/${match[1]}`;

  return pathname.replace(/^\/api/, "");
}

export async function backendFetch(path, init = {}) {
  const accessToken = init.accessToken ?? getStoredAccessToken();
  const headers = new Headers(init.headers);

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(getBackendPath(path), {
    ...init,
    headers,
  });
}

export async function requestBackendJson(
  path,
  init,
  fallback = "Something went wrong.",
) {
  const response = await backendFetch(path, init);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiMessage(body, fallback));
  }

  return body;
}

export async function requestJson(path, init, fallback = "Something went wrong.") {
  const response = path.startsWith("/api/")
    ? await backendFetch(path, init)
    : await fetch(path, init);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiMessage(body, fallback));
  }

  return body;
}
