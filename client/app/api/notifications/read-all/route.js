import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function PATCH() {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorizedJson("You must be signed in.");
  }

  const result = await patchToBackend(
    "/notifications/read-all",
    {},
    {
      headers: getAuthHeaders(session.accessToken),
    },
  );

  return NextResponse.json(result.body, { status: result.status });
}
