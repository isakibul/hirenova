"use client";

import { Suspense } from "react";
import MessagesClient from "./MessagesClient";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="site-muted p-6 text-sm">Loading messages...</div>}>
      <MessagesClient />
    </Suspense>
  );
}
