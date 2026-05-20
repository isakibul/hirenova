import axios from "axios";
import { getApiMessage } from "./ui.js";

const defaultServerTimeoutMs = 10_000;

function getServerRequestTimeoutMs() {
  const timeout = Number(process.env.BACKEND_API_TIMEOUT_MS);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : defaultServerTimeoutMs;
}

export function getServerBackendApiUrl() {
  return (
    process.env.BACKEND_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") ||
    "http://localhost:4000/api/v1"
  );
}

export function getServerBackendPath(path) {
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) {
    throw new Error("Server backend requests must use internal API paths.");
  }

  const [pathname, search = ""] = path.split("?");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${getServerBackendApiUrl()}${normalizedPath}${search ? `?${search}` : ""}`;
}

export async function requestServerBackend(path, init = {}) {
  const response = await axios.request({
    method: init.method ?? "GET",
    timeout: getServerRequestTimeoutMs(),
    validateStatus: () => true,
    ...init,
    data: init.body ?? init.data,
    url: getServerBackendPath(path),
  });
  const body = response.data ?? {};

  return {
    body,
    data: body.data,
    message: getApiMessage(body),
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
  };
}
