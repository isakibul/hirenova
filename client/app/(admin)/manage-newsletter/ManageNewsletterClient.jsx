"use client";

import ConfirmDialog from "@components/ConfirmDialog";
import Icon from "@components/Icon";
import LoadingCircle from "@components/LoadingCircle";
import PaginationControls from "@components/PaginationControls";
import { RowListSkeleton } from "@components/Skeleton";
import StatusNotice from "@components/StatusNotice";
import SelectField from "@components/forms/SelectField";
import { requestJson } from "@lib/clientApi";
import { formatDate, getRecordId } from "@lib/ui";
import { useCallback, useEffect, useState } from "react";

const sortOptions = [
  { value: "createdAt", label: "Newest Added" },
  { value: "email", label: "Email" },
  { value: "status", label: "Status" },
  { value: "subscribedAt", label: "Subscribed Date" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "subscribed", label: "Subscribed" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

const emptyCampaignForm = {
  subject: "",
  previewText: "",
  body: "",
};

function formatStatus(value) {
  return value === "unsubscribed" ? "Unsubscribed" : "Subscribed";
}

function formatSource(value) {
  if (value === "footer") return "Manual subscription";
  if (value === "home") return "Homepage";
  if (value === "auth-signup") return "Account signup";
  if (value === "auth-login") return "Account activity";
  return value || "Manual subscription";
}

function getCampaignStatusClass(status) {
  if (status === "sent") return "site-success";
  if (status === "failed") return "site-danger";
  return "site-border site-panel";
}

function getCampaignStatusLabel(status) {
  if (status === "partial") return "Partial";
  if (status === "failed") return "Failed";
  return "Sent";
}

export default function ManageNewsletterClient({
  initialSubscriptions = [],
  initialPagination,
  initialError = "",
}) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [pagination, setPagination] = useState(initialPagination);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortType, setSortType] = useState("dsc");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [campaignRemovingId, setCampaignRemovingId] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [subscriptionPendingDelete, setSubscriptionPendingDelete] =
    useState(null);
  const [campaignPendingDelete, setCampaignPendingDelete] = useState(null);
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);
  const [campaigns, setCampaigns] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(initialError);
  const totalItems = pagination?.totalItems ?? subscriptions.length;
  const totalPages = pagination?.totalPage ?? 1;
  const visibleSubscribedCount = subscriptions.filter(
    (subscription) => subscription.status !== "unsubscribed",
  ).length;
  const lastCampaign = campaigns[0];

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      sort_by: sortBy,
      sort_type: sortType,
    });

    if (search) {
      params.set("search", search);
    }
    if (status) {
      params.set("status", status);
    }

    try {
      const body = await requestJson(
        `/admin/newsletter?${params.toString()}`,
        {},
        "Unable to load newsletter subscriptions.",
      );
      setSubscriptions(body.data ?? []);
      setPagination(body.pagination);
    } catch (caughtError) {
      setSubscriptions([]);
      setPagination(undefined);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load newsletter subscriptions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search, sortBy, sortType, status]);

  const loadCampaigns = useCallback(async () => {
    try {
      const body = await requestJson(
        "/admin/newsletter/campaigns",
        {},
        "Unable to load newsletter campaigns.",
      );
      setCampaigns(body.data ?? []);
    } catch {
      setCampaigns([]);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubscriptions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSubscriptions, page, search, sortBy, sortType, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCampaigns();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCampaigns]);

  useEffect(() => {
    if (
      (!subscriptionPendingDelete && !campaignPendingDelete) ||
      removingId ||
      campaignRemovingId
    ) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSubscriptionPendingDelete(null);
        setCampaignPendingDelete(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    campaignPendingDelete,
    campaignRemovingId,
    removingId,
    subscriptionPendingDelete,
  ]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleRemove(subscription) {
    setSubscriptionPendingDelete(subscription);
  }

  function handleCampaignRemove(campaign) {
    setCampaignPendingDelete(campaign);
  }

  async function confirmRemove() {
    if (!subscriptionPendingDelete) {
      return;
    }

    const subscriptionId = getRecordId(subscriptionPendingDelete);
    if (!subscriptionId) {
      setSubscriptionPendingDelete(null);
      return;
    }

    setRemovingId(subscriptionId);
    setNotice("");
    setError("");

    try {
      await requestJson(
        `/admin/newsletter/${subscriptionId}`,
        { method: "DELETE" },
        "Unable to delete subscription.",
      );

      setNotice(`${subscriptionPendingDelete.email} deleted.`);
      setSubscriptionPendingDelete(null);
      await loadSubscriptions();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete subscription.",
      );
    } finally {
      setRemovingId("");
    }
  }

  async function updateSubscriptionStatus(subscription) {
    const subscriptionId = getRecordId(subscription);
    if (!subscriptionId) {
      return;
    }

    const nextStatus =
      subscription.status === "unsubscribed" ? "subscribed" : "unsubscribed";

    setStatusUpdatingId(subscriptionId);
    setNotice("");
    setError("");

    try {
      const body = await requestJson(
        `/admin/newsletter/${subscriptionId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
        "Unable to update subscription status.",
      );

      setNotice(
        body.message ??
          `${subscription.email} ${
            nextStatus === "unsubscribed" ? "unsubscribed" : "resubscribed"
          }.`,
      );
      await loadSubscriptions();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update subscription status.",
      );
    } finally {
      setStatusUpdatingId("");
    }
  }

  async function confirmCampaignRemove() {
    if (!campaignPendingDelete) {
      return;
    }

    const campaignId = getRecordId(campaignPendingDelete);
    if (!campaignId) {
      setCampaignPendingDelete(null);
      return;
    }

    setCampaignRemovingId(campaignId);
    setNotice("");
    setError("");

    try {
      await requestJson(
        `/admin/newsletter/campaigns/${campaignId}`,
        { method: "DELETE" },
        "Unable to delete campaign history.",
      );

      setNotice(`Campaign "${campaignPendingDelete.subject}" deleted.`);
      setCampaignPendingDelete(null);
      await loadCampaigns();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete campaign history.",
      );
    } finally {
      setCampaignRemovingId("");
    }
  }

  function updateCampaignField(field, value) {
    setCampaignForm((current) => ({
      ...current,
      [field]: value,
    }));
    setNotice("");
    setError("");
  }

  async function sendCampaign(event) {
    event.preventDefault();
    setIsSendingCampaign(true);
    setNotice("");
    setError("");

    try {
      const body = await requestJson(
        "/admin/newsletter/campaigns",
        {
          method: "POST",
          body: JSON.stringify(campaignForm),
        },
        "Unable to send newsletter campaign.",
      );

      const campaign = body.data;
      setNotice(
        body.message ??
          `Campaign sent to ${campaign?.sentCount ?? 0} newsletter recipient(s).`,
      );
      setCampaignForm(emptyCampaignForm);
      await Promise.all([loadCampaigns(), loadSubscriptions()]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send newsletter campaign.",
      );
    } finally {
      setIsSendingCampaign(false);
    }
  }

  return (
    <>
      <section className="site-section py-8">
        <div className="site-container">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Manage Newsletter
              </h1>
              <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
                Manage newsletter subscribers, prepare campaign content, and
                monitor delivery history from one administrative workspace.
              </p>
            </div>
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noreferrer"
              className="site-border site-field inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition hover:border-[var(--site-accent)]"
            >
              <Icon name="mail" />
              Open MailHog
            </a>
          </div>

          <div className="mt-6 grid items-stretch gap-3 md:grid-cols-3">
            <div className="site-border site-panel h-full rounded-lg border p-4">
              <p className="site-muted text-xs font-medium">Total emails</p>
              <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
            </div>
            <div className="site-border site-panel h-full rounded-lg border p-4">
              <p className="site-muted text-xs font-medium">
                Visible subscribed
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {visibleSubscribedCount}
              </p>
            </div>
            <div className="site-border site-panel h-full rounded-lg border p-4">
              <p className="site-muted text-xs font-medium">Last campaign</p>
              <p className="mt-2 truncate text-lg font-semibold">
                {lastCampaign
                  ? getCampaignStatusLabel(lastCampaign.status)
                  : "None yet"}
              </p>
            </div>
          </div>

          <StatusNotice tone="success">{notice}</StatusNotice>
          <StatusNotice>{error}</StatusNotice>

          <div className="mt-6 grid items-start gap-3 xl:grid-cols-3">
            <form
              onSubmit={sendCampaign}
              className="site-border site-card rounded-lg border xl:col-span-2 xl:col-start-1 xl:row-start-1"
            >
              <div className="border-b border-[var(--site-border)] px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                      Compose
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">
                      Send campaign
                    </h2>
                  </div>
                  <span className="site-badge rounded px-2.5 py-1 text-xs font-semibold">
                    Subscribed audience
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <label className="block">
                  <span className="text-sm font-semibold">Subject</span>
                  <input
                    value={campaignForm.subject}
                    onChange={(event) =>
                      updateCampaignField("subject", event.target.value)
                    }
                    className="site-field mt-2 h-10 w-full rounded-md border px-3 text-sm focus:outline-none"
                    maxLength={140}
                    required
                    placeholder="Monthly hiring update"
                  />
                  <span className="site-muted mt-1 block text-xs">
                    {campaignForm.subject.length}/140 characters
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Preview text</span>
                  <input
                    value={campaignForm.previewText}
                    onChange={(event) =>
                      updateCampaignField("previewText", event.target.value)
                    }
                    className="site-field mt-2 h-10 w-full rounded-md border px-3 text-sm focus:outline-none"
                    maxLength={180}
                    placeholder="Short inbox preview"
                  />
                  <span className="site-muted mt-1 block text-xs">
                    {campaignForm.previewText.length}/180 characters
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Email body</span>
                  <textarea
                    value={campaignForm.body}
                    onChange={(event) =>
                      updateCampaignField("body", event.target.value)
                    }
                    className="site-field mt-2 min-h-52 w-full rounded-md border px-3 py-2 text-sm leading-6 focus:outline-none"
                    maxLength={8000}
                    required
                    placeholder="Write your campaign message..."
                  />
                  <span className="site-muted mt-1 block text-xs">
                    Plain text is converted into a clean HTML email.
                  </span>
                </label>
              </div>

              <div className="site-panel flex flex-col gap-3 border-t border-[var(--site-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="site-muted text-xs">
                  Sends to all currently subscribed newsletter emails.
                </p>
                <button
                  type="submit"
                  disabled={isSendingCampaign}
                  className="site-button inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendingCampaign ? (
                    <LoadingCircle className="h-3.5 w-3.5" label="Sending" />
                  ) : (
                    <Icon name="mail" />
                  )}
                  {isSendingCampaign ? "Sending" : "Send campaign"}
                </button>
              </div>
            </form>

            <div className="space-y-3 xl:col-start-3 xl:row-span-2 xl:row-start-1">
              <section className="site-border site-card rounded-lg border">
                <div className="border-b border-[var(--site-border)] px-4 py-3">
                  <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                    Preview
                  </p>
                </div>
                <div className="p-4">
                  <div className="site-border overflow-hidden rounded-lg border">
                    <div className="site-panel border-b border-[var(--site-border)] px-3 py-2">
                      <p className="truncate text-sm font-semibold">
                        {campaignForm.subject || "Campaign subject"}
                      </p>
                      <p className="site-muted mt-1 truncate text-xs">
                        {campaignForm.previewText || "Inbox preview text"}
                      </p>
                    </div>
                    <div className="min-h-36 bg-[var(--site-card)] p-4">
                      <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                        HireNova Newsletter
                      </p>
                      <div className="mt-3 whitespace-pre-line text-sm leading-6">
                        {campaignForm.body ||
                          "Your campaign body preview will appear here."}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="site-border site-card overflow-hidden rounded-lg border">
                <div className="border-b border-[var(--site-border)] px-4 py-3">
                  <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                    Recent campaigns
                  </p>
                </div>
                <div className="divide-y divide-[var(--site-border)]">
                  {campaigns.length ? (
                    campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="grid gap-3 px-4 py-3 transition hover:bg-[var(--site-panel)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {campaign.subject}
                            </p>
                            <div className="site-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              <span>{formatDate(campaign.createdAt)}</span>
                              <span>{campaign.sentCount} sent</span>
                              <span>{campaign.failedCount} failed</span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`rounded border px-2 py-1 text-[11px] font-semibold ${getCampaignStatusClass(campaign.status)}`}
                            >
                              {getCampaignStatusLabel(campaign.status)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCampaignRemove(campaign)}
                              disabled={campaignRemovingId === campaign.id}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] text-[var(--site-danger-text)] transition disabled:opacity-60"
                              aria-label={`Delete ${campaign.subject} campaign history`}
                              title="Delete campaign history"
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="site-muted px-4 py-6 text-sm">
                      Sent campaigns will appear here.
                    </p>
                  )}
                </div>
              </section>
            </div>

          <div className="site-border site-card mt-6 overflow-hidden rounded-lg border xl:col-span-2 xl:col-start-1 xl:row-start-2 xl:mt-0">
            <div className="border-b border-[var(--site-border)] p-4">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Audience</h2>
                  <p className="site-muted mt-1 text-sm">
                    Manage subscription status, campaign eligibility, and
                    permanent removals.
                  </p>
                </div>
              </div>
              <form
                onSubmit={handleSearch}
                className="grid gap-3 lg:grid-cols-[1fr_180px_190px_140px]"
              >
                <label className="relative">
                  <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="search" />
                  </span>
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
                    placeholder="Search email"
                  />
                </label>
                <SelectField
                  value={status}
                  onChange={(nextValue) => {
                    setPage(1);
                    setStatus(nextValue);
                  }}
                  options={statusOptions}
                  className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"
                />
                <SelectField
                  value={sortBy}
                  onChange={(nextValue) => {
                    setPage(1);
                    setSortBy(nextValue);
                  }}
                  options={sortOptions}
                  className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="site-button h-10 rounded-md px-3 text-sm font-semibold transition"
                >
                  Search
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setSortType((current) =>
                      current === "dsc" ? "asc" : "dsc",
                    );
                  }}
                  className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold"
                >
                  {sortType === "dsc" ? "Descending" : "Ascending"}
                </button>
                {search || status ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                      setStatus("");
                      setPage(1);
                    }}
                    className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold"
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              {isLoading ? (
                <RowListSkeleton count={5} />
              ) : subscriptions.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="font-semibold">No newsletter emails found</p>
                  <p className="site-muted mt-1 text-xs">
                    New subscribers will appear here.
                  </p>
                </div>
              ) : (
                <div className="min-w-[890px]">
                  <div className="site-panel grid grid-cols-[minmax(210px,1fr)_120px_136px_104px_240px] gap-3 border-b border-[var(--site-border)] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--site-muted)]">
                    <span className="whitespace-nowrap">Email</span>
                    <span className="whitespace-nowrap">Source</span>
                    <span className="whitespace-nowrap">Subscribed Date</span>
                    <span className="whitespace-nowrap">Status</span>
                    <span className="whitespace-nowrap text-right">
                      Action
                    </span>
                  </div>
                  {subscriptions.map((subscription) => {
                    const subscriptionId = getRecordId(subscription);
                    return (
                      <div
                        key={subscriptionId}
                        className="grid grid-cols-[minmax(210px,1fr)_120px_136px_104px_240px] items-center gap-3 border-b border-[var(--site-border)] px-4 py-4 transition last:border-b-0 hover:bg-[var(--site-panel)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate whitespace-nowrap text-sm font-medium">
                            {subscription.email}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate whitespace-nowrap text-sm">
                            {formatSource(subscription.source)}
                          </p>
                        </div>
                        <div>
                          <p className="whitespace-nowrap text-sm">
                            {formatDate(subscription.subscribedAt)}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-xs font-medium ${
                              subscription.status === "unsubscribed"
                                ? "site-border site-panel"
                                : "site-success"
                            }`}
                          >
                            {formatStatus(subscription.status)}
                          </span>
                        </div>
                        <div className="flex flex-nowrap justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              updateSubscriptionStatus(subscription)
                            }
                            disabled={
                              statusUpdatingId === subscriptionId ||
                              removingId === subscriptionId
                            }
                            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition disabled:opacity-60 ${
                              subscription.status === "unsubscribed"
                                ? "site-button"
                                : "site-border site-field"
                            }`}
                          >
                            <Icon
                              name={
                                subscription.status === "unsubscribed"
                                  ? "check"
                                  : "x"
                              }
                            />
                            {statusUpdatingId === subscriptionId
                              ? "Updating"
                              : subscription.status === "unsubscribed"
                                ? "Resubscribe"
                                : "Unsubscribe"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(subscription)}
                            disabled={
                              removingId === subscriptionId ||
                              statusUpdatingId === subscriptionId
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 text-xs font-medium text-[var(--site-danger-text)] transition disabled:opacity-60"
                          >
                            <Icon name="trash" />
                            {removingId === subscriptionId
                              ? "Deleting"
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <PaginationControls
              currentPage={pagination?.page ?? page}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
          </div>
        </div>
      </section>

      {campaignPendingDelete ? (
        <ConfirmDialog
          title="Delete campaign history?"
          icon="trash"
          tone="danger"
          confirmLabel="Delete Campaign"
          pendingLabel="Deleting..."
          isPending={campaignRemovingId === getRecordId(campaignPendingDelete)}
          onCancel={() => setCampaignPendingDelete(null)}
          onConfirm={confirmCampaignRemove}
        >
          This will remove{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {campaignPendingDelete.subject}
          </span>{" "}
          from recent campaign history. Sent email messages and newsletter
          subscribers will not be deleted.
        </ConfirmDialog>
      ) : null}

      {subscriptionPendingDelete ? (
        <ConfirmDialog
          title="Delete newsletter email?"
          icon="trash"
          tone="danger"
          confirmLabel="Delete Email"
          pendingLabel="Deleting..."
          isPending={removingId === getRecordId(subscriptionPendingDelete)}
          onCancel={() => setSubscriptionPendingDelete(null)}
          onConfirm={confirmRemove}
        >
          This will permanently delete{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {subscriptionPendingDelete.email}
          </span>{" "}
          from the newsletter list.
        </ConfirmDialog>
      ) : null}
    </>
  );
}
