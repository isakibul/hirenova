import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
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
    const result = await getFromBackend("/dashboard", {
        headers: getAuthHeaders(session.accessToken),
    });
    const summary = result.ok ? result.body.data : {};
    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">My Jobs</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/applications" className="site-border site-card rounded-lg border p-6 transition hover:border-[var(--site-accent)]">
            <p className="site-muted text-xs font-medium">Applications</p>
            <p className="mt-2 text-3xl font-semibold">{summary.totalApplications ?? 0}</p>
          </Link>
          <Link href="/saved-jobs" className="site-border site-card rounded-lg border p-6 transition hover:border-[var(--site-accent)]">
            <p className="site-muted text-xs font-medium">Saved Jobs</p>
            <p className="mt-2 text-3xl font-semibold">{summary.totalSavedJobs ?? 0}</p>
          </Link>
        </div>
        <Link href="/jobs" className="site-button mt-6 inline-flex rounded-md px-4 py-2 text-sm font-medium transition">
          Browse Jobs
        </Link>
      </div>
    </section>);
}
