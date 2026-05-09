import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@lib/auth";
export default async function MyJobsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role === "admin") {
        redirect("/manage-jobs");
    }
    if (session.user.role === "employer") {
        redirect("/manage-jobs");
    }
    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">My Jobs</h1>
        <div className="site-border site-card mt-8 rounded-lg border p-6">
          <h2 className="text-base font-semibold">Your Job Workspace</h2>
          <p className="site-muted mt-2 text-sm leading-6">
            Keep track of jobs connected to your HireNova account.
          </p>
          <Link href="/jobs" className="site-button mt-5 inline-flex rounded-md px-4 py-2 text-sm font-medium transition">
            Browse Jobs
          </Link>
        </div>
      </div>
    </section>);
}
