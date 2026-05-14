import { getApiMessage } from "./ui.js";

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
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${getBackendApiUrl()}${normalizedPath}${search ? `?${search}` : ""}`;
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
  const response =
    path.startsWith("http://") || path.startsWith("https://")
      ? await fetch(path, init)
      : await backendFetch(path, init);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiMessage(body, fallback));
  }

  return body;
}
