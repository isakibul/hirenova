import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "./auth";

export function getAuthHeaders(accessToken) {
  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;
}

export async function getCurrentSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return session;
}

export async function getAdminSession() {
  const session = await getCurrentSession();

  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    return null;
  }

  return session;
}

export async function getJobManagerSession() {
  const session = await getCurrentSession();

  if (!session || !["admin", "superadmin", "employer"].includes(session.user.role)) {
    return null;
  }

  return session;
}

export function unauthorizedJson(message) {
  return NextResponse.json({ message }, { status: 401 });
}
