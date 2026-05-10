import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders, getJobManagerSession, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in as an employer or admin to view candidates.";

export async function GET(request) {
    const session = await getJobManagerSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    const { searchParams } = new URL(request.url);
    const result = await getFromBackend("/candidates", {
        headers: getAuthHeaders(session.accessToken),
        params: {
            search: searchParams.get("search") ?? undefined,
            page: Number(searchParams.get("page")) || 1,
            limit: Number(searchParams.get("limit")) || 10,
            sort_by: searchParams.get("sort_by") ?? "updatedAt",
            sort_type: searchParams.get("sort_type") ?? "dsc",
        },
    });
    return NextResponse.json(result.body, { status: result.status });
}
