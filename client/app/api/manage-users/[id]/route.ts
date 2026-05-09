import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { deleteFromBackend, getFromBackend } from "@/app/lib/backend";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getUnauthorizedResponse() {
  return NextResponse.json(
    { message: "You must be signed in as an admin to manage users." },
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
  const result = await getFromBackend(`/admin/users/${id}`, {
    headers: getAuthHeaders(session.accessToken),
  });

  return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return getUnauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await deleteFromBackend(`/admin/users/${id}`, {
    headers: getAuthHeaders(session.accessToken),
  });

  if (result.status === 204) {
    return new Response(null, { status: 204 });
  }

  return NextResponse.json(result.body, { status: result.status });
}
