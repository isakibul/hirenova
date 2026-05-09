import { NextResponse } from "next/server";
import { getFromBackend } from "@lib/backend";

export async function GET(_request, context) {
    const { token } = await context.params;

    if (!token) {
        return NextResponse.json({ message: "Confirmation token is required." }, { status: 400 });
    }

    const result = await getFromBackend(`/auth/confirm-email/${encodeURIComponent(token)}`);
    return NextResponse.json(result.body, { status: result.status });
}
