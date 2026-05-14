"use client";

import Icon from "@components/Icon";
import LoadingCircle from "@components/LoadingCircle";
import PaginationControls from "@components/PaginationControls";
import { TableRowsSkeleton } from "@components/Skeleton";
import StatusNotice from "@components/StatusNotice";
import SelectField from "@components/forms/SelectField";
import { requestJson } from "@lib/clientApi";
import { formatDateTime } from "@lib/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

const auditActionOptions = [
  { value: "", label: "All actions" },
  { value: "auth.signup", label: "Auth signup" },
  { value: "auth.login", label: "Auth login" },
  { value: "auth.reset_password", label: "Password reset" },
  { value: "profile.parse_resume", label: "Resume parse" },
  { value: "job.create", label: "Job create" },
  { value: "job.update", label: "Job update" },
  { value: "job.delete", label: "Job delete" },
  { value: "job.status_update", label: "Job status" },
  { value: "job.approval_update", label: "Job approval" },
  { value: "application.submit", label: "Application submit" },
  { value: "application.status_update", label: "Application status" },
  { value: "admin.user_create", label: "User create" },
  { value: "admin.user_update", label: "User update" },
  { value: "admin.user_delete", label: "User delete" },
  { value: "message.send_or_start", label: "Message activity" },
];

const emailStatusOptions = [
  { value: "", label: "All statuses" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
];

const emailTypeOptions = [
  { value: "", label: "All email types" },
  { value: "confirmation", label: "Confirmation" },
  { value: "password_reset", label: "Password reset" },
];

function MetricCard({ label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] text-[var(--site-danger-text)]"
      : tone === "success"
        ? "border-[var(--site-success-border)] bg-[var(--site-success-bg)] text-[var(--site-success-text)]"
        : "site-border site-panel";

  return (
    <div className={`flex h-full flex-col rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs opacity-80">{detail}</p> : null}
    </div>
  );
}

function KeyValueList({ title, items, emptyLabel }) {
  return (
    <section className="site-border site-card h-full overflow-hidden rounded-lg border">
      <div className="border-b border-[var(--site-border)] px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-[var(--site-border)]">
        {items.length ? (
          items.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <span className="site-muted break-words">{key}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))
        ) : (
          <p className="site-muted px-4 py-6 text-sm">{emptyLabel}</p>
        )}
      </div>
    </section>
  );
}

function AlertList({ alerts = [] }) {
  return (
    <section className="site-border site-card h-full overflow-hidden rounded-lg border">
      <div className="border-b border-[var(--site-border)] px-4 py-3">
        <h2 className="font-semibold">Active Alerts</h2>
      </div>
      <div className="space-y-3 p-4">
        {alerts.length ? (
          alerts.map((alert) => (
            <div
              key={`${alert.type}-${alert.message}`}
              className={`rounded-md border px-3 py-2 text-sm ${
                alert.tone === "danger"
                  ? "site-danger"
                  : "site-border site-panel"
              }`}
            >
              <p className="font-semibold">{alert.type}</p>
              <p className="mt-1 text-xs leading-5">{alert.message}</p>
            </div>
          ))
        ) : (
          <div className="site-success rounded-md border px-3 py-2 text-sm">
            No active alerts.
          </div>
        )}
      </div>
    </section>
  );
}

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export default function SystemMonitorClient() {
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPagination, setAuditPagination] = useState(null);
  const [emailEvents, setEmailEvents] = useState([]);
  const [emailPagination, setEmailPagination] = useState(null);
  const [auditPage, setAuditPage] = useState(1);
  const [emailPage, setEmailPage] = useState(1);
  const [auditAction, setAuditAction] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailType, setEmailType] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setError("");

    try {
      const body = await requestJson(
        "/admin/system-monitor-summary",
        {},
        "Unable to load system monitor summary.",
      );
      setSummary(body.data ?? null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load system monitor summary.",
      );
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setIsLoadingAudit(true);
    setError("");

    try {
      const query = buildQuery({
        page: auditPage,
        limit: 10,
        action: auditAction,
      });
      const body = await requestJson(
        `/admin/audit-logs?${query}`,
        {},
        "Unable to load audit logs.",
      );
      setAuditLogs(body.data ?? []);
      setAuditPagination(body.pagination ?? null);
    } catch (caughtError) {
      setAuditLogs([]);
      setAuditPagination(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load audit logs.",
      );
    } finally {
      setIsLoadingAudit(false);
    }
  }, [auditAction, auditPage]);

  const loadEmailEvents = useCallback(async () => {
    setIsLoadingEmail(true);
    setError("");

    try {
      const query = buildQuery({
        page: emailPage,
        limit: 10,
        status: emailStatus,
        type: emailType,
      });
      const body = await requestJson(
        `/admin/email-events?${query}`,
        {},
        "Unable to load email events.",
      );
      setEmailEvents(body.data ?? []);
      setEmailPagination(body.pagination ?? null);
    } catch (caughtError) {
      setEmailEvents([]);
      setEmailPagination(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load email events.",
      );
    } finally {
      setIsLoadingEmail(false);
    }
  }, [emailPage, emailStatus, emailType]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSummary();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSummary]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAuditLogs();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAuditLogs]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadEmailEvents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadEmailEvents]);

  const auditItems = useMemo(
    () =>
      Object.entries(summary?.auditActivity24h ?? {}).sort(
        ([, first], [, second]) => second - first,
      ),
    [summary],
  );
  const emailItems = useMemo(
    () =>
      Object.entries(summary?.emailEvents24h ?? {}).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    [summary],
  );
  const health = summary?.health ?? {};
  const totalRequests = health.totalRequests ?? 0;
  const totalErrors = health.totalErrors ?? 0;
  const slowRequests = health.slowRequests ?? 0;
  const failedEmails24h = summary?.failedEmails24h ?? 0;
  const statusItems = Object.entries(health.byStatusClass ?? {}).sort();
  const methodItems = Object.entries(health.byMethod ?? {}).sort();
  const isRefreshing =
    isHydrated && (isLoadingSummary || isLoadingAudit || isLoadingEmail);

  return (
    <section className="site-section py-8">
      <div className="site-container">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              System Monitor
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Monitor health, email delivery, and sensitive system activity
              without exposing private request data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadSummary();
              void loadAuditLogs();
              void loadEmailEvents();
            }}
            disabled={isRefreshing}
            className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70"
          >
            {isRefreshing ? (
              <LoadingCircle
                className="h-3.5 w-3.5"
                label="Refreshing system monitor"
              />
            ) : (
              <Icon name="chart" />
            )}
            Refresh
          </button>
        </div>

        <StatusNotice>{error}</StatusNotice>

        <div className="mt-6 grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {isLoadingSummary ? (
            <>
              <MetricCard label="Total Requests" value="..." />
              <MetricCard label="API Errors" value="..." />
              <MetricCard label="Slow Requests" value="..." />
              <MetricCard label="Failed Emails" value="..." />
            </>
          ) : (
            <>
              <MetricCard
                label="App Requests"
                value={totalRequests}
                detail={`${health.uptimeSeconds ?? 0}s uptime; observability reads excluded`}
              />
              <MetricCard
                label="API Errors"
                value={totalErrors}
                detail="In-memory process counter"
                tone={totalErrors ? "danger" : "success"}
              />
              <MetricCard
                label="Slow Requests"
                value={slowRequests}
                detail="Requests over 1000ms"
                tone={slowRequests ? "danger" : "default"}
              />
              <MetricCard
                label="Failed Emails"
                value={failedEmails24h}
                detail="Last 24 hours"
                tone={failedEmails24h ? "danger" : "success"}
              />
            </>
          )}
        </div>

        <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-3">
          <AlertList alerts={summary?.alerts ?? []} />
          <KeyValueList
            title="HTTP Status Classes"
            items={statusItems}
            emptyLabel="No app requests recorded since API start."
          />
          <KeyValueList
            title="HTTP Methods"
            items={methodItems}
            emptyLabel="No app requests recorded since API start."
          />
        </div>

        <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
          <KeyValueList
            title="Email Delivery - 24h"
            items={emailItems}
            emptyLabel="No email events recorded in the last 24 hours."
          />
          <KeyValueList
            title="Audit Activity - 24h"
            items={auditItems}
            emptyLabel="No audited activity recorded in the last 24 hours."
          />
        </div>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
          <section className="site-border site-card overflow-hidden rounded-lg border">
            <div className="site-panel border-b border-[var(--site-border)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Audit Logs</h2>
                  <p className="site-muted mt-1 text-xs">
                    Successful sensitive actions only. Request bodies are not
                    stored.
                  </p>
                </div>
                <SelectField
                  value={auditAction}
                  onChange={(nextValue) => {
                    setAuditPage(1);
                    setAuditAction(nextValue);
                  }}
                  options={auditActionOptions}
                  className="site-field min-h-10 rounded-md border px-3 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="site-panel text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Actor</th>
                    <th className="px-4 py-3 font-semibold">Route</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingAudit ? (
                    <TableRowsSkeleton columns={4} rows={5} />
                  ) : auditLogs.length ? (
                    auditLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-t border-[var(--site-border)]"
                      >
                        <td className="px-4 py-3 align-top">
                          <p className="font-semibold">{log.action}</p>
                          <p className="site-muted mt-1 text-xs">
                            {log.method} · {log.statusCode} · {log.durationMs}ms
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top text-xs font-semibold">
                          {log.actorRole}
                        </td>
                        <td className="site-muted px-4 py-3 align-top text-xs">
                          {log.route}
                        </td>
                        <td className="site-muted whitespace-nowrap px-4 py-3 align-top text-xs">
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <p className="font-semibold">No audit logs found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={auditPagination?.page ?? auditPage}
              totalPages={auditPagination?.totalPage ?? 1}
              isLoading={isLoadingAudit}
              onPageChange={setAuditPage}
            />
          </section>

          <section className="site-border site-card overflow-hidden rounded-lg border">
            <div className="site-panel border-b border-[var(--site-border)] p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_160px_180px] lg:items-center">
                <div>
                  <h2 className="font-semibold">Email Events</h2>
                  <p className="site-muted mt-1 text-xs">
                    Recipients are hashed in storage and never shown here.
                  </p>
                </div>
                <SelectField
                  value={emailStatus}
                  onChange={(nextValue) => {
                    setEmailPage(1);
                    setEmailStatus(nextValue);
                  }}
                  options={emailStatusOptions}
                  className="site-field min-h-10 rounded-md border px-3 text-sm focus:outline-none"
                />
                <SelectField
                  value={emailType}
                  onChange={(nextValue) => {
                    setEmailPage(1);
                    setEmailType(nextValue);
                  }}
                  options={emailTypeOptions}
                  className="site-field min-h-10 rounded-md border px-3 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead className="site-panel text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Result</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingEmail ? (
                    <TableRowsSkeleton columns={4} rows={5} />
                  ) : emailEvents.length ? (
                    emailEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="border-t border-[var(--site-border)]"
                      >
                        <td className="px-4 py-3 align-top font-semibold">
                          {event.type}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
                              event.status === "failed"
                                ? "border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] text-[var(--site-danger-text)]"
                                : "border-[var(--site-success-border)] bg-[var(--site-success-bg)] text-[var(--site-success-text)]"
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="site-muted px-4 py-3 align-top text-xs">
                          {event.errorMessage ||
                            event.providerMessageId ||
                            "No provider id"}
                          <p className="mt-1">{event.durationMs}ms</p>
                        </td>
                        <td className="site-muted whitespace-nowrap px-4 py-3 align-top text-xs">
                          {formatDateTime(event.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <p className="font-semibold">No email events found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={emailPagination?.page ?? emailPage}
              totalPages={emailPagination?.totalPage ?? 1}
              isLoading={isLoadingEmail}
              onPageChange={setEmailPage}
            />
          </section>
        </div>
      </div>
    </section>
  );
}
