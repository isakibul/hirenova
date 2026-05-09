import { NextResponse } from "next/server";
import { deleteFromBackend, postToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in as a jobseeker to save jobs.";

export async function POST(_request, context) {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "jobseeker") {
        return unauthorizedJson(unauthorizedMessage);
    }

    const { id } = await context.params;
    const result = await postToBackend(`/jobs/${id}/save`, {}, {
        headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(_request, context) {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "jobseeker") {
        return unauthorizedJson(unauthorizedMessage);
    }

    const { id } = await context.params;
    const result = await deleteFromBackend(`/jobs/${id}/save`, {
        headers: getAuthHeaders(session.accessToken),
    });

    if (result.status === 204) {
        return new Response(null, { status: 204 });
    }

    return NextResponse.json(result.body, { status: result.status });
}
