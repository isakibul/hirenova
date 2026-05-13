"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getAccessToken, getUserFromAccessToken } from "@lib/backendToken";
import { backendFetch, requestBackendJson } from "@lib/clientApi";

const storageKey = "hirenova-auth";
const AuthContext = createContext(null);

function readStoredAuth() {
  if (typeof window === "undefined") {
    return { accessToken: "", user: null };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");

    if (!parsed.accessToken) {
      return { accessToken: "", user: null };
    }

    return {
      accessToken: parsed.accessToken,
      user: parsed.user ?? getUserFromAccessToken(parsed.accessToken),
    };
  } catch {
    return { accessToken: "", user: null };
  }
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [status, setStatus] = useState(
    auth.accessToken ? "authenticated" : "unauthenticated",
  );

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init) => {
      const path = typeof input === "string" ? input : input?.url;

      if (typeof path === "string" && path.startsWith("/api/")) {
        return backendFetch(path, init);
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const persistAuth = useCallback((nextAuth) => {
    setAuth(nextAuth);
    setStatus(nextAuth.accessToken ? "authenticated" : "unauthenticated");

    if (nextAuth.accessToken) {
      window.localStorage.setItem(storageKey, JSON.stringify(nextAuth));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const body = await requestBackendJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const accessToken = getAccessToken(body);

      if (!accessToken) {
        throw new Error("Login succeeded, but no access token was returned.");
      }

      const user = getUserFromAccessToken(accessToken, email);
      persistAuth({ accessToken, user });

      return { accessToken, user };
    },
    [persistAuth],
  );

  const logout = useCallback(async () => {
    const token = auth.accessToken;
    persistAuth({ accessToken: "", user: null });

    if (token) {
      await requestBackendJson("/auth/logout", {
        method: "POST",
        accessToken: token,
        body: JSON.stringify({}),
      }).catch(() => undefined);
    }
  }, [auth.accessToken, persistAuth]);

  const value = useMemo(
    () => ({
      accessToken: auth.accessToken,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      status,
      user: auth.user,
    }),
    [auth.accessToken, auth.user, login, logout, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
