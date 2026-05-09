import { NextResponse } from "next/server";
import { getFromBackend, patchToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in to manage your profile.";

export async function GET() {
    const session = await getCurrentSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    const result = await getFromBackend("/auth/profile", {
        headers: getAuthHeaders(session.accessToken),
    });
    return NextResponse.json(result.body, { status: result.status });
}
export async function PATCH(request) {
    const session = await getCurrentSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    try {
        const payload = await request.json();
        const result = await patchToBackend("/auth/profile", payload, {
            headers: getAuthHeaders(session.accessToken),
        });
        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to update profile right now." }, { status: 500 });
    }
}
