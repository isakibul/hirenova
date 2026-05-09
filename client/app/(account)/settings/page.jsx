import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <div className="site-border site-card mt-8 rounded-lg border p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-base font-semibold">Account Access</h2>
              <p className="site-muted mt-1 text-sm">
                Signed in as {session.user.email ?? session.user.name}.
              </p>
            </div>
            <span className="site-badge shrink-0 rounded-full px-3 py-1 text-xs font-medium">
              Active
            </span>
          </div>
        </div>
      </div>
    </section>);
}
