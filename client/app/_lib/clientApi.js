import { getApiMessage } from "./ui.js";

let memoryAccessToken = "";
let memoryCsrfToken = "";
const authStorageKey = "hirenova-auth";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const defaultTimeoutMs = 10_000;

export function getBackendApiUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") ??
    "http://localhost:4000/api/v1"
  );
}

export function getStoredAccessToken() {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }

  if (typeof window === "undefined") {
    return "";
  }

  try {
    return JSON.parse(window.localStorage.getItem(authStorageKey) ?? "{}")
      .accessToken ?? "";
  } catch {
    return "";
  }
}

export function setMemoryAccessToken(accessToken = "") {
  memoryAccessToken = accessToken;
}

export function setMemoryCsrfToken(csrfToken = "") {
  memoryCsrfToken = csrfToken;
}

function getRequestTimeoutMs() {
  const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : defaultTimeoutMs;
}

function createTimeoutController() {
  if (typeof AbortController === "undefined") {
    return { signal: undefined, clear: () => undefined };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getRequestTimeoutMs());

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

async function fetchWithTimeout(path, init = {}) {
  const timeout = init.signal
    ? { signal: init.signal, clear: () => undefined }
    : createTimeoutController();

  try {
    return await fetch(path, {
      ...init,
      signal: timeout.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timed out. Please check the server connection.");
    }

    throw error;
  } finally {
    timeout.clear();
  }
}

function isUnsafeMethod(method = "GET") {
  return unsafeMethods.has(String(method).toUpperCase());
}

async function getCsrfToken() {
  if (memoryCsrfToken) {
    return memoryCsrfToken;
  }

  const response = await fetchWithTimeout(getBackendPath("/auth/csrf"), {
    cache: "no-store",
    credentials: "include",
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiMessage(body, "Unable to prepare secure request."));
  }

  memoryCsrfToken = body.data?.csrfToken ?? "";
  return memoryCsrfToken;
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
  const { accessToken: explicitAccessToken, csrf = true, ...fetchInit } = init;
  const accessToken = explicitAccessToken ?? getStoredAccessToken();
  const headers = new Headers(fetchInit.headers);
  const method = fetchInit.method ?? "GET";

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (csrf !== false && isUnsafeMethod(method) && !headers.has("X-CSRF-Token")) {
    headers.set("X-CSRF-Token", await getCsrfToken());
  }

  if (
    fetchInit.body &&
    !(fetchInit.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetchWithTimeout(getBackendPath(path), {
    ...fetchInit,
    credentials: fetchInit.credentials ?? "include",
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
