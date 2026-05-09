import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAuthHeaders, getJobManagerSession, unauthorizedJson } from "@lib/session";

export async function PATCH(request, context) {
    const session = await getJobManagerSession();
    if (!session) {
        return unauthorizedJson("You must be signed in as an employer or admin to manage jobs.");
    }

    try {
        const { id } = await context.params;
        const payload = await request.json();
        const result = await patchToBackend(`/jobs/${id}/status`, payload, {
            headers: getAuthHeaders(session.accessToken),
        });

        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to update job status right now." }, { status: 500 });
    }
}
