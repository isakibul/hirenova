import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAdminSession, getAuthHeaders, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in as an admin to manage users.";

export async function PATCH(_request, context) {
    const session = await getAdminSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    const { id } = await context.params;
    const result = await patchToBackend(`/admin/users/make-admin/${id}`, null, {
        headers: getAuthHeaders(session.accessToken),
    });
    return NextResponse.json(result.body, { status: result.status });
}
