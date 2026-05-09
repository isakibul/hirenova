import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAccessToken, getUserFromAccessToken } from "@lib/backendToken";
import { getNextAuthSecret, getNextAuthUrl } from "@lib/env";

const sessionMaxAge = 60 * 60 * 24 * 7;

function getCookieName() {
    const nextAuthUrl = getNextAuthUrl();
    const usesSecureCookies = nextAuthUrl?.startsWith("https://");

    return usesSecureCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";
}

function getRedirectUrl(request, pathname) {
    return new URL(pathname, request.url);
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(getRedirectUrl(request, "/login"));
    }

    const result = await getFromBackend(`/auth/confirm-email/${encodeURIComponent(token)}`);
    const accessToken = result.ok ? getAccessToken(result.body) : undefined;

    if (!accessToken) {
        return NextResponse.redirect(getRedirectUrl(request, "/login"));
    }

    const user = getUserFromAccessToken(accessToken);
    const sessionToken = await encode({
        secret: getNextAuthSecret(),
        token: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: user.accessToken,
        },
        maxAge: sessionMaxAge,
    });
    const response = NextResponse.redirect(getRedirectUrl(request, "/jobs"));

    response.cookies.set(getCookieName(), sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: getCookieName().startsWith("__Secure-"),
        path: "/",
        maxAge: sessionMaxAge,
    });

    return response;
}
