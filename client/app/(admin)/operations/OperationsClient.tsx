"use client";

import LoadingCircle from "@components/LoadingCircle";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OperationsClient() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/system-monitor");
  }, [router]);

  return (
    <section className="site-section py-16">
      <div className="mx-auto flex max-w-xl items-center gap-3 text-sm">
        <LoadingCircle />
        Redirecting to System Monitor...
      </div>
    </section>
  );
}
