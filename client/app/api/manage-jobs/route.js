import { NextResponse } from "next/server";
import { getFromBackend, postToBackend } from "@lib/backend";
import { getAdminSession, getAuthHeaders, unauthorizedJson } from "@lib/session";

const unauthorizedMessage = "You must be signed in as an admin to manage jobs.";

export async function GET(request) {
    const session = await getAdminSession();
    if (!session) {
        return unauthorizedJson(unauthorizedMessage);
    }
    const { searchParams } = new URL(request.url);
    const result = await getFromBackend("/jobs", {
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
export async function POST(request) {
    const session = await getAdminSession();
    if (!session?.user) {
        return unauthorizedJson(unauthorizedMessage);
    }
    try {
        const payload = await request.json();
        const result = await postToBackend("/jobs", {
            ...payload,
            author: session.user.id,
        }, {
            headers: getAuthHeaders(session.accessToken),
        });
        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to create job right now." }, { status: 500 });
    }
}
