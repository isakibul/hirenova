import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function PATCH(request) {
    const session = await getCurrentSession();
    if (!session) {
        return unauthorizedJson("You must be signed in to deactivate your account.");
    }

    try {
        const payload = await request.json();
        const result = await patchToBackend("/auth/deactivate", payload, {
            headers: getAuthHeaders(session.accessToken),
        });

        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to deactivate account right now." }, { status: 500 });
    }
}
