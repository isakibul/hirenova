import { NextResponse } from "next/server";
import { patchToBackend } from "@lib/backend";

export async function PATCH(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ message: "Reset token is required." }, { status: 400 });
        }

        const payload = await request.json();
        const result = await patchToBackend(`/auth/reset-password?token=${encodeURIComponent(token)}`, payload);

        return NextResponse.json(result.body, { status: result.status });
    }
    catch {
        return NextResponse.json({ message: "Unable to reset password right now." }, { status: 500 });
    }
}
