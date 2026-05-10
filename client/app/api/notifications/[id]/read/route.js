import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function PATCH(_request, { params }) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorizedJson("You must be signed in.");
  }

  const result = await patchToBackend(
    `/notifications/${params.id}/read`,
    {},
    {
      headers: getAuthHeaders(session.accessToken),
    },
  );

  return NextResponse.json(result.body, { status: result.status });
}
