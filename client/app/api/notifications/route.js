import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function GET(request) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorizedJson("You must be signed in.");
  }

  const { searchParams } = new URL(request.url);
  const result = await getFromBackend("/notifications", {
    headers: getAuthHeaders(session.accessToken),
    params: {
      limit: searchParams.get("limit") ?? "20",
    },
  });

  return NextResponse.json(result.body, { status: result.status });
}
