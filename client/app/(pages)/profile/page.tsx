import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";

const roleLabels: Record<string, string> = {
  jobseeker: "Job Seeker",
  employer: "Employer",
  admin: "Admin",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role
    ? roleLabels[session.user.role] ?? session.user.role
    : "Member";

  return (
    <section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto max-w-3xl">
        <p className="site-badge inline-flex rounded-full px-3 py-1 text-sm font-medium">
          {role}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Profile</h1>
        <div className="site-border site-card mt-8 rounded-lg border p-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="site-muted text-sm">Name</dt>
              <dd className="mt-1 font-medium">
                {session.user.name ?? "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="site-muted text-sm">Email</dt>
              <dd className="mt-1 break-all font-medium">
                {session.user.email ?? "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="site-muted text-sm">Account Type</dt>
              <dd className="mt-1 font-medium">{role}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
