import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
import ApplicationsClient from "./ApplicationsClient";

export default async function JobApplicationsPage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }
    if (!["admin", "employer"].includes(session.user.role)) {
        redirect("/my-jobs");
    }

    const { id } = await params;
    const result = await getFromBackend(`/jobs/${id}/applications`, {
        headers: getAuthHeaders(session.accessToken),
    });
    const applications = result.ok ? (result.body.data ?? []) : [];

    return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-5xl">
        <Link href="/manage-jobs" className="site-link text-sm font-semibold">Back to jobs</Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Applicants</h1>
        {!result.ok ? (<div className="site-danger mt-6 rounded-lg border px-4 py-3 text-sm">
            {result.body.error ?? result.body.message ?? "Unable to load applicants."}
          </div>) : <ApplicationsClient initialApplications={applications}/>}
      </div>
    </section>);
}
