"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import StatusNotice from "@components/StatusNotice";
import { getAccessToken, getUserFromAccessToken } from "@lib/backendToken";
import { requestBackendJson } from "@lib/clientApi";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      window.setTimeout(() => setError("Confirmation token is missing."), 0);
      return;
    }

    async function confirmEmail() {
      try {
        const body = await requestBackendJson(
          `/auth/confirm-email/${encodeURIComponent(token)}`,
        );
        const accessToken = getAccessToken(body);

        if (accessToken) {
          const user = getUserFromAccessToken(accessToken);
          window.localStorage.setItem(
            "hirenova-auth",
            JSON.stringify({ accessToken, user }),
          );
        }

        router.replace("/jobs");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to confirm email.",
        );
      }
    }

    void confirmEmail();
  }, [router, searchParams]);

  return <StatusNotice>{error}</StatusNotice>;
}

export default function ConfirmEmailPage() {
  return (
    <section className="px-5 py-16 md:px-[8vw]">
      <div className="mx-auto max-w-xl">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Confirming Email
        </h1>
        <p className="site-muted mt-2 text-sm leading-6">
          Please wait while HireNova activates your account.
        </p>
        <Suspense fallback={null}>
          <ConfirmEmailContent />
        </Suspense>
      </div>
    </section>
  );
}
