import { NextResponse } from "next/server";
import { deleteFromBackend, getFromBackend, patchToBackend, } from "@lib/backend";
import { getAdminSession, getAuthHeaders, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in as an admin to manage jobs.";

export async function GET(_request, context) {
    const session = await getAdminSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    const { id } = await context.params;
    const result = await getFromBackend(`/jobs/${id}`);
    return NextResponse.json(result.body, { status: result.status });
}
export async function PATCH(request, context) {
    const session = await getAdminSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    try {
        const { id } = await context.params;
        const payload = await request.json();
        const result = await patchToBackend(`/jobs/${id}`, payload, {
            headers: getAuthHeaders(session.accessToken),
        });
        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to update job right now." }, { status: 500 });
    }
}
export async function DELETE(_request, context) {
    const session = await getAdminSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    const { id } = await context.params;
    const result = await deleteFromBackend(`/jobs/${id}`, {
        headers: getAuthHeaders(session.accessToken),
    });
    if (result.status === 204) {
        return new Response(null, { status: 204 });
    }
    return NextResponse.json(result.body, { status: result.status });
}
