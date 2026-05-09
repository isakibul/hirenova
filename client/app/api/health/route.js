import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@lib/env";

export async function GET() {
    try {
        const response = await fetch(`${getBackendBaseUrl()}/health`, {
            cache: "no-store",
        });
        const body = await response.json().catch(() => ({
            message: "Unexpected backend response",
        }));

        return NextResponse.json(body, { status: response.status });
    }
    catch {
        return NextResponse.json({ status: "DOWN", message: "Unable to reach backend health check." }, { status: 503 });
    }
}
