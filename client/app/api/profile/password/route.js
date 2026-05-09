import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in to change your password.";

export async function PATCH(request) {
    const session = await getCurrentSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    try {
        const payload = await request.json();
        const result = await patchToBackend("/auth/change-password", payload, {
            headers: getAuthHeaders(session.accessToken),
        });
        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to change password right now." }, { status: 500 });
    }
}
