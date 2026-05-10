import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";
import { getAdminSession, getAuthHeaders, unauthorizedJson } from "@lib/session";

export async function PATCH(request, context) {
  const session = await getAdminSession();
  if (!session) {
    return unauthorizedJson("You must be signed in as an admin to review jobs.");
  }

  try {
    const { id } = await context.params;
    const payload = await request.json();
    const result = await patchToBackend(`/jobs/${id}/approval`, payload, {
      headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to review job right now." },
      { status: 500 },
    );
  }
}
