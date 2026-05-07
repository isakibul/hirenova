export type BackendResult<T = unknown> = {
  body: T;
  status: number;
  ok: boolean;
};

const API_BASE_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";

export async function postToBackend<T>(
  path: string,
  payload: unknown,
  init?: { headers?: Record<string, string> }
): Promise<BackendResult<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({
    message: "Unexpected backend response",
  }))) as T;

  return {
    body,
    status: response.status,
    ok: response.ok,
  };
}
