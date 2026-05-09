import Link from "next/link";
import { getFromBackend } from "@lib/backend";

function getToken(searchParams) {
    const token = searchParams?.token;

    if (Array.isArray(token)) {
        return token[0] ?? "";
    }

    return token ?? "";
}

function getMessage(body, fallback) {
    return body?.error ?? body?.message ?? fallback;
}

export default async function ConfirmEmailPage({ searchParams }) {
    const params = await searchParams;
    const token = getToken(params);
    const result = token
        ? await getFromBackend(`/auth/confirm-email/${encodeURIComponent(token)}`)
        : {
            ok: false,
            status: 400,
            body: { message: "Confirmation token is required." },
        };
    const isConfirmed = result.ok;

    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-2xl">
        <div className={`rounded-lg border p-6 ${isConfirmed ? "site-success" : "site-danger"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest">
            Email Confirmation
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            {isConfirmed ? "Your email is confirmed" : "We could not confirm this email"}
          </h1>
          <p className="mt-4 text-sm leading-6">
            {getMessage(result.body, isConfirmed
            ? "Email confirmed successfully."
            : "This confirmation link is invalid or expired.")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="site-button inline-flex rounded-md px-4 py-2 text-sm font-semibold transition">
              Sign In
            </Link>
            <Link href="/signup" className="site-border site-field inline-flex rounded-md border px-4 py-2 text-sm font-semibold">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </section>);
}
