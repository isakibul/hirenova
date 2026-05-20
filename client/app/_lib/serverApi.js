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
  const response = await fetch(getServerBackendPath(path), {
    cache: "no-store",
    ...init,
  });
  const body = await response.json().catch(() => ({}));

  return {
    body,
    data: body.data,
    message: getApiMessage(body),
    ok: response.ok,
    status: response.status,
  };
}
