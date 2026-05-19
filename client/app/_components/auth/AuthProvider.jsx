"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { requestBackendJson, setMemoryAccessToken } from "@lib/clientApi";

const AuthContext = createContext(null);
const authStorageKey = "hirenova-auth";

function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(authStorageKey);
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ accessToken: "", user: null });
  const [status, setStatus] = useState("loading");

  const persistAuth = useCallback((nextAuth) => {
    setAuth(nextAuth);
    setStatus(nextAuth.user ? "authenticated" : "unauthenticated");
    setMemoryAccessToken("");
    clearStoredAuth();
  }, []);

  const fetchSession = useCallback(
    async () => {
      try {
        const body = await requestBackendJson("/auth/session", {
          cache: "no-store",
        });
        const user = body.data ?? null;
        return { accessToken: "", user };
      } catch {
        return { accessToken: "", user: null };
      }
    },
    [],
  );

  const refreshSession = useCallback(
    async () => {
      const nextAuth = await fetchSession();
      persistAuth(nextAuth);
      return nextAuth;
    },
    [fetchSession, persistAuth],
  );

  useEffect(() => {
    let ignore = false;

    async function hydrateSession() {
      const nextAuth = await fetchSession();

      if (ignore) {
        return;
      }

      persistAuth(nextAuth);
    }

    void hydrateSession();

    return () => {
      ignore = true;
    };
  }, [fetchSession, persistAuth]);

  const login = useCallback(
    async ({ email, password }) => {
      await requestBackendJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      return refreshSession();
    },
    [refreshSession],
  );

  const logout = useCallback(async () => {
    persistAuth({ accessToken: "", user: null });

    await requestBackendJson("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    }).catch(() => undefined);
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      accessToken: auth.accessToken,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      refreshSession,
      status,
      user: auth.user,
    }),
    [auth.accessToken, auth.user, login, logout, refreshSession, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
