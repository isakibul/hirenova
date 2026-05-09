import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import {
  deleteFromBackend,
  getFromBackend,
  patchToBackend,
} from "@/app/lib/backend";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getUnauthorizedResponse() {
  return NextResponse.json(
    { message: "You must be signed in as an admin to manage jobs." },
    { status: 401 }
  );
}

async function getAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
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

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return getUnauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await getFromBackend(`/jobs/${id}`);

  return NextResponse.json(result.body, { status: result.status });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return getUnauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const payload = await request.json();
    const result = await patchToBackend(`/jobs/${id}`, payload, {
      headers: getAuthHeaders(session.accessToken),
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to update job right now." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return getUnauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await deleteFromBackend(`/jobs/${id}`, {
    headers: getAuthHeaders(session.accessToken),
  });

  if (result.status === 204) {
    return new Response(null, { status: 204 });
  }

  return NextResponse.json(result.body, { status: result.status });
}
