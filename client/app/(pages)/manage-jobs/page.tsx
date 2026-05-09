import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import ManageJobsClient from "./ManageJobsClient";

export default async function ManageJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/my-jobs");
  }

  return <ManageJobsClient />;
}
