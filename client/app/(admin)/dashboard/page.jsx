"use client";

import Icon from "@components/Icon";
import { MetricSkeleton } from "@components/Skeleton";
import StatusNotice from "@components/StatusNotice";
import { useAuth } from "@components/auth/AuthProvider";
import { requestJson } from "@lib/clientApi";
import Link from "next/link";
import { useEffect, useState } from "react";

function Metric({ label, value, helper, icon = "chart" }) {
  return (
    <div className="site-border site-card rounded-lg border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="site-muted text-xs font-medium">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value ?? 0}</p>
        </div>
        <span className="site-badge flex h-10 w-10 items-center justify-center rounded-md">
          <Icon name={icon} />
        </span>
      </div>
      {helper ? <p className="site-muted mt-3 text-xs leading-5">{helper}</p> : null}
    </div>
  );
}

function QuickAction({ href, icon, title, description }) {
  return (
    <Link
      href={href}
      className="site-border site-panel flex items-center gap-3 rounded-lg border p-4 transition hover:border-[var(--site-accent)]"
    >
      <span className="site-border site-card flex h-10 w-10 shrink-0 items-center justify-center rounded-md border">
        <Icon name={icon} />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="site-muted mt-1 block text-xs leading-5">{description}</span>
      </span>
    </Link>
  );
}

function OnboardingPanel({ role }) {
  if (role === "jobseeker") {
    return (
      <div className="site-border site-card mt-6 rounded-lg border p-5">
        <h2 className="font-semibold">Jobseeker Start Guide</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <QuickAction href="/profile" icon="user" title="Complete Profile" description="Add skills, location, and resume." />
          <QuickAction href="/jobs" icon="search" title="Find Roles" description="Filter jobs that match your profile." />
          <QuickAction href="/applications" icon="file" title="Track Applications" description="Follow review status in one place." />
        </div>
      </div>
    );
  }

  if (role === "employer") {
    return (
      <div className="site-border site-card mt-6 rounded-lg border p-5">
        <h2 className="font-semibold">Employer Start Guide</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <QuickAction href="/profile" icon="user" title="Company Profile" description="Add company details for hiring." />
          <QuickAction href="/manage-jobs" icon="briefcase" title="Post a Job" description="Create a listing for admin review." />
          <QuickAction href="/candidates" icon="search" title="Browse Talent" description="Find active job seeker profiles." />
        </div>
      </div>
    );
  }

  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const body = await requestJson(
          "/api/dashboard",
          {},
          "Unable to load dashboard.",
        );
        setSummary(body.data ?? {});
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <section className="site-section py-8">
      <div className="site-container">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
          Monitor hiring activity, jobs, applications, and account activity.
        </p>

        <StatusNotice>{error}</StatusNotice>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <MetricSkeleton count={4} />
          ) : (
            <>
              <Metric label="Jobs" value={summary.totalJobs} helper="Created job listings." icon="briefcase" />
              <Metric label="Applications" value={summary.totalApplications} helper="Submitted applications." icon="file" />
              <Metric label="Saved Jobs" value={summary.totalSavedJobs} helper="Saved roles." icon="bell" />
              <Metric label="Users" value={summary.totalUsers} helper="Platform accounts." icon="user" />
            </>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {user?.role === "jobseeker" ? (
            <>
              <QuickAction href="/jobs" icon="search" title="Find Jobs" description="Search and filter open roles." />
              <QuickAction href="/applications" icon="file" title="Applications" description="Track submitted roles." />
              <QuickAction href="/saved-jobs" icon="bell" title="Saved Jobs" description="Review roles saved for later." />
              <QuickAction href="/profile" icon="user" title="Profile" description="Keep your profile updated." />
            </>
          ) : user?.role === "employer" ? (
            <>
              <QuickAction href="/manage-jobs" icon="briefcase" title="Manage Jobs" description="Create and review listings." />
              <QuickAction href="/candidates" icon="search" title="Candidates" description="Browse active profiles." />
              <QuickAction href="/messages" icon="message" title="Messages" description="Continue hiring conversations." />
              <QuickAction href="/profile" icon="user" title="Profile" description="Keep company details updated." />
            </>
          ) : (
            <>
              <QuickAction href="/manage-jobs" icon="briefcase" title="Manage Jobs" description="Create and review listings." />
              <QuickAction href="/candidates" icon="search" title="Candidates" description="Browse active profiles." />
              <QuickAction href="/manage-users" icon="user" title="Manage Users" description="Administer accounts." />
              <QuickAction href="/system-monitor" icon="chart" title="System Monitor" description="Review alerts and audit activity." />
            </>
          )}
        </div>

        <OnboardingPanel role={user?.role} />
      </div>
    </section>
  );
}
