import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders, getJobManagerSession, unauthorizedJson } from "@lib/session";

export async function GET(_request, context) {
    const session = await getJobManagerSession();
    if (!session) {
        return unauthorizedJson("You must be signed in as an employer or admin.");
    }

    const { id } = await context.params;
    const result = await getFromBackend(`/jobs/${id}/applications`, {
        headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
}
