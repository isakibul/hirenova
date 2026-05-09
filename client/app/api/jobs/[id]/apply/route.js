import { NextResponse } from "next/server";
import { postToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function POST(request, context) {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "jobseeker") {
        return unauthorizedJson("You must be signed in as a jobseeker to apply.");
    }

    try {
        const { id } = await context.params;
        const payload = await request.json();
        const result = await postToBackend(`/jobs/${id}/apply`, payload, {
            headers: getAuthHeaders(session.accessToken),
        });

        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to apply right now." }, { status: 500 });
    }
}
