import { NextResponse } from "next/server";
import { getFromBackend, postToBackend } from "@lib/backend";
import { getAuthHeaders, getCurrentSession, unauthorizedJson } from "@lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorizedJson("You must be signed in to view messages.");
  }

  const result = await getFromBackend("/messages/conversations", {
    headers: getAuthHeaders(session.accessToken),
  });

  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorizedJson("You must be signed in to start a conversation.");
  }

  try {
    const payload = await request.json();
    const result = await postToBackend("/messages/conversations", payload, {
      headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to start conversation right now." },
      { status: 500 },
    );
  }
}
