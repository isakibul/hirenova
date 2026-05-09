export function decodeBackendToken(token) {
    const [, payload] = token.split(".");
    if (!payload) {
        return {};
    }
    try {
        const normalizedPayload = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(payload.length / 4) * 4, "=");
        return JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8"));
    }
    catch {
        return {};
    }
}

export function getAccessToken(body) {
    return body.data?.accessToken ?? body.data?.access_token;
}

export function getUserFromAccessToken(accessToken, fallbackEmail) {
    const tokenPayload = decodeBackendToken(accessToken);
    return {
        id: tokenPayload.id ?? tokenPayload.sub ?? fallbackEmail,
        name: tokenPayload.name ?? tokenPayload.username ?? fallbackEmail,
        email: tokenPayload.email ?? fallbackEmail,
        role: tokenPayload.role,
        accessToken,
    };
}
