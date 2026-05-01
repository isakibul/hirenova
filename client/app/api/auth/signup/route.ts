import { NextResponse } from "next/server";
import { postToBackend } from "@/app/lib/backend";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await postToBackend("/auth/signup", payload);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to create account right now" },
      { status: 500 }
    );
  }
}
