import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";

function Metric({ label, value }) {
    return (<div className="site-border site-card rounded-lg border p-5">
      <p className="site-muted text-xs font-medium">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value ?? 0}</p>
    </div>);
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const result = await getFromBackend("/dashboard", {
        headers: getAuthHeaders(session.accessToken),
    });
    const summary = result.ok ? result.body.data : {};
    const isAdmin = session.user.role === "admin";

    return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              {isAdmin ? "Admin" : "Employer"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <Link href={isAdmin ? "/manage-users" : "/manage-jobs"} className="site-button inline-flex rounded-md px-4 py-2 text-sm font-semibold">
            {isAdmin ? "Manage Users" : "Manage Jobs"}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isAdmin ? (<>
              <Metric label="Users" value={summary.totalUsers}/>
              <Metric label="Jobs" value={summary.totalJobs}/>
              <Metric label="Applications" value={summary.totalApplications}/>
              <Metric label="Saved Jobs" value={summary.totalSavedJobs}/>
              <Metric label="Pending Users" value={summary.pendingUsers}/>
              <Metric label="Active Users" value={summary.activeUsers}/>
              <Metric label="Suspended Users" value={summary.suspendedUsers}/>
            </>) : (<>
              <Metric label="Posted Jobs" value={summary.totalJobs}/>
              <Metric label="Applications" value={summary.totalApplications}/>
            </>)}
        </div>
      </div>
    </section>);
}
