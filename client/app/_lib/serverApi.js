import axios from "axios";
import { getApiMessage } from "./ui.js";

export function getServerBackendApiUrl() {
  return (
    process.env.BACKEND_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") ||
    "http://localhost:4000/api/v1"
  );
}

export function getServerBackendPath(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const [pathname, search = ""] = path.split("?");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${getServerBackendApiUrl()}${normalizedPath}${search ? `?${search}` : ""}`;
}

export async function requestServerBackend(path, init = {}) {
  const response = await axios.request({
    method: init.method ?? "GET",
    timeout: Number(process.env.BACKEND_API_TIMEOUT_MS || 10_000),
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
