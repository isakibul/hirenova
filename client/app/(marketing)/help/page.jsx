import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import HelpClient from "./HelpClient";

export default async function HelpPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    return <HelpClient />;
}
