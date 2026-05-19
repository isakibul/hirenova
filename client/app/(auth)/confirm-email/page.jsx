"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import StatusNotice from "@components/StatusNotice";
import { useAuth } from "@components/auth/AuthProvider";
import { requestBackendJson } from "@lib/clientApi";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      window.setTimeout(() => setError("Confirmation token is missing."), 0);
      return;
    }

    async function confirmEmail() {
      try {
        await requestBackendJson(
          `/auth/confirm-email/${encodeURIComponent(token)}`,
        );
        await refreshSession();

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
  }, [refreshSession, router, searchParams]);

  return <StatusNotice>{error}</StatusNotice>;
}

export default function ConfirmEmailPage() {
  return (
    <section className="site-section py-16">
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
