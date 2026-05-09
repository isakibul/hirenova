import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { getFromBackend, patchToBackend } from "@/app/lib/backend";

function getUnauthorizedResponse() {
  return NextResponse.json(
    { message: "You must be signed in to manage your profile." },
    { status: 401 }
  );
}

async function getSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return session;
}

function getAuthHeaders(accessToken?: string) {
  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return getUnauthorizedResponse();
  }

  const result = await getFromBackend("/auth/profile", {
    headers: getAuthHeaders(session.accessToken),
  });

  return NextResponse.json(result.body, { status: result.status });
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return getUnauthorizedResponse();
  }

  try {
    const payload = await request.json();
    const result = await patchToBackend("/auth/profile", payload, {
      headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to update profile right now." },
      { status: 500 }
    );
  }
}
