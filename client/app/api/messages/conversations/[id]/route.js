import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function GET(_request, context) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorizedJson("You must be signed in to view messages.");
  }

  const { id } = await context.params;
  const result = await getFromBackend(`/messages/conversations/${id}`, {
    headers: getAuthHeaders(session.accessToken),
  });

  return NextResponse.json(result.body, { status: result.status });
}
