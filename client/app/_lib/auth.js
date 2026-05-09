import CredentialsProvider from "next-auth/providers/credentials";
import { postToBackend } from "./backend";
import { getAccessToken, getUserFromAccessToken } from "./backendToken";
import { getNextAuthSecret, getNextAuthUrl } from "./env";

const nextAuthUrl = getNextAuthUrl();
if (!process.env.NEXTAUTH_URL && nextAuthUrl) {
    process.env.NEXTAUTH_URL = nextAuthUrl;
}

function getAuthError(body) {
    return body.error ?? body.message ?? "Invalid email or password";
}
export const authOptions = {
    secret: getNextAuthSecret(),
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
                const result = await postToBackend("/auth/login", {
                    email,
                    password,
                });
                if (!result.ok) {
                    throw new Error(getAuthError(result.body));
                }
                const accessToken = getAccessToken(result.body);
                if (!accessToken) {
                    throw new Error("Login succeeded, but no access token was returned");
                }
                return getUserFromAccessToken(accessToken, email);
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
                const authUser = user;
                token.id = authUser.id;
                token.role = authUser.role;
                token.accessToken = authUser.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            session.accessToken = token.accessToken;
            return session;
        },
    },
    events: {
        async signOut({ token }) {
            const accessToken = token?.accessToken;
            if (!accessToken) {
                return;
            }
            await postToBackend("/auth/logout", {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }).catch(() => undefined);
        },
    },
};
