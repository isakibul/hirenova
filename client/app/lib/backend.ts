import axios from "axios";

export type BackendResult<T = unknown> = {
  body: T;
  status: number;
  ok: boolean;
};

const API_BASE_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";

const backendApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getUnexpectedBody<T>() {
  return {
    message: "Unexpected backend response",
  } as T;
}

export async function postToBackend<T>(
  path: string,
  payload: unknown,
  init?: { headers?: Record<string, string> }
): Promise<BackendResult<T>> {
  try {
    const response = await backendApi.post<T>(path, payload, {
      headers: init?.headers,
    });

    return {
      body: response.data,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        body: (error.response.data ?? getUnexpectedBody<T>()) as T,
        status: error.response.status,
        ok: false,
      };
    }

    return {
      body: getUnexpectedBody<T>(),
      status: 500,
      ok: false,
    };
  }
}

export async function getFromBackend<T>(
  path: string,
  init?: {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined>;
  }
): Promise<BackendResult<T>> {
  try {
    const response = await backendApi.get<T>(path, {
      headers: init?.headers,
      params: init?.params,
    });

    return {
      body: response.data,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        body: (error.response.data ?? getUnexpectedBody<T>()) as T,
        status: error.response.status,
        ok: false,
      };
    }

    return {
      body: getUnexpectedBody<T>(),
      status: 500,
      ok: false,
    };
  }
}
