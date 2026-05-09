import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function GET() {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "jobseeker") {
        return unauthorizedJson("You must be signed in as a jobseeker.");
    }

    const result = await getFromBackend("/applications/me", {
        headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
}
