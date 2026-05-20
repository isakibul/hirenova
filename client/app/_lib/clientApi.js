import axios from "axios";
import { getJsonStorageItem } from "./storage.js";
import { getApiMessage } from "./ui.js";

let memoryAccessToken = "";
let memoryCsrfToken = "";
const authStorageKey = "hirenova-auth";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const defaultTimeoutMs = 10_000;

export function getBackendApiUrl() {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_DIRECT_BACKEND_API !== "true"
  ) {
    return "/api/v1";
  }

  return (
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") ??
    "/api/v1"
  );
}

export function getStoredAccessToken() {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return getJsonStorageItem(authStorageKey, {}).accessToken ?? "";
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

function isUnsafeMethod(method = "GET") {
  return unsafeMethods.has(String(method).toUpperCase());
}

function toHeaderObject(headers = {}) {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return { ...headers };
}

function hasHeader(headers, name) {
  const normalizedName = name.toLowerCase();

  return Object.keys(headers).some((key) => key.toLowerCase() === normalizedName);
}

function setHeader(headers, name, value) {
  if (!hasHeader(headers, name)) {
    headers[name] = value;
  }
}

function createResponseLike(response) {
  return {
    data: response.data,
    headers: response.headers,
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    statusText: response.statusText,
    json: async () => response.data,
  };
}

async function requestWithAxios(path, config = {}) {
  try {
    const response = await axios.request({
      timeout: getRequestTimeoutMs(),
      validateStatus: () => true,
      ...config,
      url: path,
    });

    return createResponseLike(response);
  } catch (error) {
    if (error?.code === "ECONNABORTED" || error?.name === "CanceledError") {
      throw new Error("Request timed out. Please check the server connection.");
    }

    throw error;
  }
}

async function getCsrfToken() {
  if (memoryCsrfToken) {
    return memoryCsrfToken;
  }

  const response = await requestWithAxios(getBackendPath("/auth/csrf"), {
    withCredentials: true,
  });
  const body = response.data ?? {};

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
  const headers = toHeaderObject(fetchInit.headers);
  const method = fetchInit.method ?? "GET";
  const body = fetchInit.body ?? fetchInit.data;

  if (accessToken) {
    setHeader(headers, "Authorization", `Bearer ${accessToken}`);
  }

  if (csrf !== false && isUnsafeMethod(method)) {
    setHeader(headers, "X-CSRF-Token", await getCsrfToken());
  }

  if (
    body &&
    !(body instanceof FormData) &&
    !hasHeader(headers, "Content-Type")
  ) {
    headers["Content-Type"] = "application/json";
  }

  return requestWithAxios(getBackendPath(path), {
    data: body,
    headers,
    method,
    signal: fetchInit.signal,
    withCredentials: fetchInit.credentials !== "omit",
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
  let response;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    const headers = toHeaderObject(init?.headers);
    const body = init?.body ?? init?.data;

    if (
      body &&
      !(body instanceof FormData) &&
      !hasHeader(headers, "Content-Type")
    ) {
      headers["Content-Type"] = "application/json";
    }

    response = await requestWithAxios(path, {
      data: body,
      headers,
      method: init?.method ?? "GET",
      signal: init?.signal,
      withCredentials: init?.credentials === "include",
    });
  } else {
    response = await backendFetch(path, init);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiMessage(body, fallback));
  }

  return body;
}
