import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { postToBackend } from "./backend";

type LoginResponse = {
  message?: string;
  error?: string;
  data?: {
    accessToken?: string;
  };
};

type BackendJwtPayload = {
  id?: string;
  sub?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
};

type AuthUser = User & {
  role?: string;
  accessToken: string;
};

function decodeBackendToken(token: string): BackendJwtPayload {
  const [, payload] = token.split(".");

  if (!payload) {
    return {};
  }

  try {
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");

    return JSON.parse(
      Buffer.from(normalizedPayload, "base64").toString("utf8")
    ) as BackendJwtPayload;
  } catch {
    return {};
  }
}

function getAuthError(body: LoginResponse) {
  return body.error ?? body.message ?? "Invalid email or password";
}

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "hirenova-local-development-secret"
      : undefined),
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const result = await postToBackend<LoginResponse>("/auth/login", {
          email,
          password,
        });

        if (!result.ok) {
          throw new Error(getAuthError(result.body));
        }

        const accessToken = result.body.data?.accessToken;

        if (!accessToken) {
          throw new Error("Login succeeded, but no access token was returned");
        }

        const tokenPayload = decodeBackendToken(accessToken);

        return {
          id: tokenPayload.id ?? tokenPayload.sub ?? email,
          name: tokenPayload.name ?? tokenPayload.username ?? email,
          email: tokenPayload.email ?? email,
          role: tokenPayload.role,
          accessToken,
        } satisfies AuthUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;

        token.id = authUser.id;
        token.role = authUser.role;
        token.accessToken = authUser.accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
      }

      session.accessToken = token.accessToken as string | undefined;

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const accessToken = token?.accessToken;

      if (!accessToken) {
        return;
      }

      await postToBackend(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ).catch(() => undefined);
    },
  },
};
