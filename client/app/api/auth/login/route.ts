import { NextResponse } from "next/server";
import { postToBackend } from "@/app/lib/backend";

type LoginResponse = {
  message?: string;
  data?: {
    accessToken?: string;
  };
};

const AUTH_COOKIE = "hirenova_token";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await postToBackend<LoginResponse>("/auth/login", payload);

    if (!result.ok) {
      return NextResponse.json(result.body, { status: result.status });
    }

    const token = result.body.data?.accessToken;

    if (!token) {
      return NextResponse.json(
        { message: "Login succeeded, but no access token was returned" },
        { status: 502 }
      );
    }

    const response = NextResponse.json(
      { message: result.body.message ?? "Login successful" },
      { status: result.status }
    );

    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to login right now" },
      { status: 500 }
    );
  }
}
