import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders, getJobManagerSession, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in as an employer or admin to view candidates.";

export async function GET(_request, context) {
    const session = await getJobManagerSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    const { id } = await context.params;
    const result = await getFromBackend(`/candidates/${id}`, {
        headers: getAuthHeaders(session.accessToken),
    });
    return NextResponse.json(result.body, { status: result.status });
}
