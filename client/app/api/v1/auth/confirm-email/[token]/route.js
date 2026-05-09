import { NextResponse } from "next/server";

export async function GET(request, context) {
    const { token } = await context.params;
    const redirectUrl = new URL("/confirm-email", request.url);
    redirectUrl.searchParams.set("token", token ?? "");

    return NextResponse.redirect(redirectUrl);
}
