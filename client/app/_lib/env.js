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
  return requireUrlEnv("BACKEND_API_URL", "http://localhost:4000/api/v1");
}

export function getNextAuthSecret() {
  return process.env.NEXTAUTH_SECRET?.trim()
    || (process.env.NODE_ENV !== "production"
      ? "hirenova-local-development-secret"
      : undefined);
}

export function getNextAuthUrl() {
  const value = process.env.NEXTAUTH_URL?.trim();

  if (value) {
    try {
      return new URL(value).toString().replace(/\/$/, "");
    } catch {
      throw new Error("Environment variable NEXTAUTH_URL must be a valid URL");
    }
  }

  return process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : undefined;
}
