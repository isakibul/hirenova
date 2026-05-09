import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { getFromBackend, postToBackend } from "@/app/lib/backend";

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

export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return getUnauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const result = await getFromBackend("/jobs", {
    params: {
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      sort_by: searchParams.get("sort_by") ?? "updatedAt",
      sort_type: searchParams.get("sort_type") ?? "dsc",
    },
  });

  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session?.user) {
    return getUnauthorizedResponse();
  }

  try {
    const payload = await request.json();
    const result = await postToBackend(
      "/jobs",
      {
        ...payload,
        author: session.user.id,
      },
      session.accessToken
        ? {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        : undefined
    );

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to create job right now." },
      { status: 500 }
    );
  }
}
