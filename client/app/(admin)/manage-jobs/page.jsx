import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import ManageJobsClient from "./ManageJobsClient";
export default async function ManageJobsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (!["admin", "employer"].includes(session.user.role)) {
        redirect("/my-jobs");
    }
    return <ManageJobsClient currentRole={session.user.role}/>;
}
