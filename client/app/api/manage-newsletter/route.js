import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAdminSession, getAuthHeaders, unauthorizedJson } from "@lib/session";

const unauthorizedMessage =
  "You must be signed in as an admin to manage newsletter subscriptions.";

export async function GET(request) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedJson(unauthorizedMessage);
  }

  const { searchParams } = new URL(request.url);
  const result = await getFromBackend("/admin/newsletter", {
    headers: getAuthHeaders(session.accessToken),
    params: {
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      sort_by: searchParams.get("sort_by") ?? "createdAt",
      sort_type: searchParams.get("sort_type") ?? "dsc",
      status: searchParams.get("status") ?? undefined,
    },
  });

  return NextResponse.json(result.body, { status: result.status });
}
