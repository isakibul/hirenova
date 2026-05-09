import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAuthHeaders, getJobManagerSession, unauthorizedJson } from "@lib/session";

export async function PATCH(request, context) {
    const session = await getJobManagerSession();
    if (!session) {
        return unauthorizedJson("You must be signed in as an employer or admin.");
    }

    try {
        const { id } = await context.params;
        const payload = await request.json();
        const result = await patchToBackend(`/applications/${id}/status`, payload, {
            headers: getAuthHeaders(session.accessToken),
        });

        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to update application status." }, { status: 500 });
    }
}
