import { NextResponse } from "next/server";
import { postToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function POST(request, context) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorizedJson("You must be signed in to send messages.");
  }

  try {
    const { id } = await context.params;
    const payload = await request.json();
    const result = await postToBackend(
      `/messages/conversations/${id}/messages`,
      payload,
      {
        headers: getAuthHeaders(session.accessToken),
      },
    );

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to send message right now." },
      { status: 500 },
    );
  }
}
