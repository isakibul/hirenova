import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@lib/auth";
export default async function HelpPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Help</h1>
        <div className="site-border site-card mt-8 rounded-lg border p-6">
          <h2 className="text-base font-semibold">Need Support?</h2>
          <p className="site-muted mt-2 text-sm leading-6">
            Visit the jobs page, review your account details, or contact your
            HireNova administrator for account-specific changes.
          </p>
          <Link href="/jobs" className="site-button mt-5 inline-flex rounded-md px-4 py-2 text-sm font-medium transition">
            Browse Jobs
          </Link>
        </div>
      </div>
    </section>);
}
