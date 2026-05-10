import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import ManageJobsClient from "./ManageJobsClient";
export default async function ManageJobsPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (!["admin", "superadmin", "employer"].includes(session.user.role)) {
        redirect("/my-jobs");
    }
    const params = (await searchParams) ?? {};
    const approvalStatus = Array.isArray(params.approval_status)
        ? params.approval_status[0]
        : params.approval_status;
    return <ManageJobsClient currentRole={session.user.role} initialApprovalFilter={approvalStatus}/>;
}
