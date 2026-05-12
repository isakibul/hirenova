import { NextResponse } from "next/server";
import { postToBackend } from "@lib/backend";

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await postToBackend("/newsletter", payload);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to subscribe right now." },
      { status: 500 },
    );
  }
}
