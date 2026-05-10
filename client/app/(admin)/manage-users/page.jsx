import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
import ManageUsersClient from "./ManageUsersClient";
export default async function ManageUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    const profileResult = await getFromBackend("/auth/profile", {
        headers: getAuthHeaders(session.accessToken),
    });
    const currentRole = profileResult.ok
        ? profileResult.body.data?.role ?? session.user.role
        : session.user.role;
    if (!["admin", "superadmin"].includes(currentRole)) {
        redirect("/my-jobs");
    }
    return <ManageUsersClient currentUserId={session.user.id} currentUserRole={currentRole}/>;
}
