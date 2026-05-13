export function requireEnv(name, fallback) {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV !== "production" && fallback) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function requireUrlEnv(name, fallback) {
  const value = requireEnv(name, fallback);

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL`);
  }
}

export function getBackendApiUrl() {
  return requireUrlEnv("NEXT_PUBLIC_BACKEND_API_URL", "http://localhost:4000/api/v1");
}

export function getBackendBaseUrl() {
  const apiUrl = new URL(getBackendApiUrl());
  const normalizedPathname = apiUrl.pathname.replace(/\/api\/v1\/?$/, "");

  apiUrl.pathname = normalizedPathname || "/";
  apiUrl.search = "";
  apiUrl.hash = "";

  return apiUrl.toString().replace(/\/$/, "");
}
