"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getAccessToken, getUserFromAccessToken } from "@lib/backendToken";
import { requestBackendJson, setMemoryAccessToken } from "@lib/clientApi";

const AuthContext = createContext(null);
const authStorageKey = "hirenova-auth";

function getStoredAuth() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(authStorageKey) ?? "{}");
  } catch {
    return {};
  }
}

function storeAccessToken(accessToken) {
  if (accessToken) {
    window.localStorage.setItem(authStorageKey, JSON.stringify({ accessToken }));
    return;
  }

  window.localStorage.removeItem(authStorageKey);
}

function getInitialAuth() {
  const accessToken = getStoredAuth().accessToken ?? "";

  return {
    accessToken,
    user: accessToken ? getUserFromAccessToken(accessToken) : null,
  };
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth);
  const [status, setStatus] = useState(() =>
    getInitialAuth().accessToken ? "authenticated" : "loading",
  );

  const persistAuth = useCallback((nextAuth) => {
    setAuth(nextAuth);
    setStatus(nextAuth.accessToken || nextAuth.user ? "authenticated" : "unauthenticated");
    setMemoryAccessToken(nextAuth.accessToken);
    storeAccessToken(nextAuth.accessToken);
  }, []);

  useEffect(() => {
    let ignore = false;
    const storedAccessToken = getStoredAuth().accessToken ?? "";

    if (storedAccessToken) {
      setMemoryAccessToken(storedAccessToken);
    }

    async function hydrateSession() {
      try {
        const body = await requestBackendJson("/auth/profile", {
          cache: "no-store",
        });

        if (!ignore) {
          persistAuth({
            accessToken: storedAccessToken,
            user: body.data ?? getUserFromAccessToken(storedAccessToken),
          });
        }
      } catch {
        if (!ignore) {
          persistAuth({ accessToken: "", user: null });
        }
      }
    }

    void hydrateSession();

    return () => {
      ignore = true;
    };
  }, [persistAuth]);

  const authenticateWithToken = useCallback(
    (accessToken, fallbackEmail) => {
      const user = getUserFromAccessToken(accessToken, fallbackEmail);
      persistAuth({ accessToken, user });
      return { accessToken, user };
    },
    [persistAuth],
  );

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

      return authenticateWithToken(accessToken, email);
    },
    [authenticateWithToken],
  );

  const logout = useCallback(async () => {
    const token = auth.accessToken;
    persistAuth({ accessToken: "", user: null });

    await requestBackendJson("/auth/logout", {
      method: "POST",
      accessToken: token,
      body: JSON.stringify({}),
    }).catch(() => undefined);
  }, [auth.accessToken, persistAuth]);

  const value = useMemo(
    () => ({
      accessToken: auth.accessToken,
      authenticateWithToken,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      status,
      user: auth.user,
    }),
    [auth.accessToken, auth.user, authenticateWithToken, login, logout, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
