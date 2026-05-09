import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";

export async function PATCH(request) {
    try {
        const payload = await request.json();
        const result = await patchToBackend("/auth/forgot-password", payload);

        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to request password reset right now." }, { status: 500 });
    }
}
