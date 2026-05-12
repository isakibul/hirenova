import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
import ManageNewsletterClient from "./ManageNewsletterClient";

export default async function ManageNewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  if (!["admin", "superadmin"].includes(session.user.role)) {
    redirect("/my-jobs");
  }

  const result = await getFromBackend("/admin/newsletter", {
    headers: getAuthHeaders(session.accessToken),
    params: {
      page: 1,
      limit: 10,
      sort_by: "createdAt",
      sort_type: "dsc",
    },
  });

  return (
    <ManageNewsletterClient
      initialSubscriptions={result.ok ? (result.body.data ?? []) : []}
      initialPagination={result.ok ? result.body.pagination : undefined}
      initialError={
        result.ok
          ? ""
          : (result.body.message ??
            result.body.error ??
            "Unable to load newsletter subscriptions.")
      }
    />
  );
}
