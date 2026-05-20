"use client";

import ConfirmDialog from "@components/ConfirmDialog";
import Icon from "@components/Icon";
import StatusNotice from "@components/StatusNotice";
import { requestJson } from "@lib/clientApi";
import { getRecordId } from "@lib/ui";
import { useCallback, useEffect, useState } from "react";

import CampaignComposer from "./CampaignComposer";
import CampaignSidebar from "./CampaignSidebar";
import NewsletterAudience from "./NewsletterAudience";
import {
  emptyCampaignForm,
  getCampaignStatusLabel,
} from "./newsletterUtils";

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

    if (search) params.set("search", search);
    if (status) params.set("status", status);

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
  }, [loadSubscriptions]);

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

  async function confirmRemove() {
    if (!subscriptionPendingDelete) return;

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
    if (!subscriptionId) return;

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
    if (!campaignPendingDelete) return;

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
            <CampaignComposer
              campaignForm={campaignForm}
              isSendingCampaign={isSendingCampaign}
              onFieldChange={updateCampaignField}
              onSubmit={sendCampaign}
            />
            <CampaignSidebar
              campaignForm={campaignForm}
              campaigns={campaigns}
              campaignRemovingId={campaignRemovingId}
              onCampaignRemove={setCampaignPendingDelete}
            />
            <NewsletterAudience
              isLoading={isLoading}
              onClearFilters={() => {
                setSearch("");
                setSearchInput("");
                setStatus("");
                setPage(1);
              }}
              onPageChange={setPage}
              onRemove={setSubscriptionPendingDelete}
              onSearch={handleSearch}
              onSearchInputChange={setSearchInput}
              onSortByChange={(nextValue) => {
                setPage(1);
                setSortBy(nextValue);
              }}
              onSortTypeToggle={() => {
                setPage(1);
                setSortType((current) => (current === "dsc" ? "asc" : "dsc"));
              }}
              onStatusChange={(nextValue) => {
                setPage(1);
                setStatus(nextValue);
              }}
              onStatusUpdate={updateSubscriptionStatus}
              page={page}
              pagination={pagination}
              removingId={removingId}
              search={search}
              searchInput={searchInput}
              sortBy={sortBy}
              sortType={sortType}
              status={status}
              statusUpdatingId={statusUpdatingId}
              subscriptions={subscriptions}
              totalPages={totalPages}
            />
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
