import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function GET() {
    const session = await getCurrentSession();
    if (!session) {
        return unauthorizedJson("You must be signed in to view dashboard data.");
    }

    const result = await getFromBackend("/dashboard", {
        headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
}
