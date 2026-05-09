import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import ManageUsersClient from "./ManageUsersClient";
export default async function ManageUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role !== "admin") {
        redirect("/my-jobs");
    }
    return <ManageUsersClient currentUserId={session.user.id}/>;
}
