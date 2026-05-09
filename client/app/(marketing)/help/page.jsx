import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import { getBackendBaseUrl } from "@lib/env";
import HelpClient from "./HelpClient";

async function getHealth() {
    try {
        const response = await fetch(`${getBackendBaseUrl()}/health`, {
            cache: "no-store",
        });
        const body = await response.json().catch(() => ({}));
        return {
            ok: response.ok,
            status: body.status ?? (response.ok ? "OK" : "DOWN"),
        };
    }
    catch {
        return {
            ok: false,
            status: "DOWN",
        };
    }
}
export default async function HelpPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    const health = await getHealth();
    return <HelpClient health={health}/>;
}
