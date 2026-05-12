import { NextResponse } from "next/server";
import { deleteFromBackend } from "@lib/backend";
import { getAdminSession, getAuthHeaders, unauthorizedJson } from "@lib/session";

const unauthorizedMessage =
  "You must be signed in as an admin to manage newsletter subscriptions.";

export async function DELETE(_request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedJson(unauthorizedMessage);
  }

  const { id } = await params;
  const result = await deleteFromBackend(
    `/admin/newsletter/${encodeURIComponent(id)}`,
    {
      headers: getAuthHeaders(session.accessToken),
    },
  );

  return NextResponse.json(result.body, { status: result.status });
}
