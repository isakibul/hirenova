"use client";

import ConfirmDialog from "@components/ConfirmDialog";
import Icon from "@components/Icon";
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

function formatStatus(value) {
  return value === "unsubscribed" ? "Unsubscribed" : "Subscribed";
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
  const [removingId, setRemovingId] = useState("");
  const [subscriptionPendingDelete, setSubscriptionPendingDelete] =
    useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(initialError);
  const totalItems = pagination?.totalItems ?? subscriptions.length;
  const totalPages = pagination?.totalPage ?? 1;

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
        `/api/manage-newsletter?${params.toString()}`,
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubscriptions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSubscriptions, page, search, sortBy, sortType, status]);

  useEffect(() => {
    if (!subscriptionPendingDelete || removingId) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSubscriptionPendingDelete(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [removingId, subscriptionPendingDelete]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleRemove(subscription) {
    setSubscriptionPendingDelete(subscription);
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
        `/api/manage-newsletter/${subscriptionId}`,
        { method: "DELETE" },
        "Unable to remove subscription.",
      );

      setNotice(
        `${subscriptionPendingDelete.email} removed from the newsletter list.`,
      );
      setSubscriptionPendingDelete(null);
      await loadSubscriptions();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to remove subscription.",
      );
    } finally {
      setRemovingId("");
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
              Review collected newsletter emails. Email sending is not enabled
              here yet.
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Subscriptions</p>
            <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
          </div>
        </div>

        <StatusNotice tone="success">{notice}</StatusNotice>
        <StatusNotice>{error}</StatusNotice>

        <div className="site-border site-card mt-6 overflow-hidden rounded-lg border">
          <div className="site-panel border-b border-[var(--site-border)] p-4">
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

          <div className="divide-y divide-[var(--site-border)]">
            {isLoading ? (
              <RowListSkeleton count={5} />
            ) : subscriptions.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="font-semibold">No newsletter emails found</p>
                <p className="site-muted mt-1 text-xs">
                  New home page subscribers will appear here.
                </p>
              </div>
            ) : (
              subscriptions.map((subscription) => {
                const subscriptionId = getRecordId(subscription);
                return (
                  <div
                    key={subscriptionId}
                    className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="break-all font-semibold">
                        {subscription.email}
                      </p>
                      <div className="site-muted mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span>Source: {subscription.source ?? "home"}</span>
                        <span>
                          Subscribed: {formatDate(subscription.subscribedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="site-badge rounded px-2 py-1 text-xs font-semibold">
                        {formatStatus(subscription.status)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(subscription)}
                        disabled={removingId === subscriptionId}
                        className="site-border site-field inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition disabled:opacity-60"
                      >
                        <Icon name="trash" />
                        {removingId === subscriptionId ? "Removing" : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })
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
      </section>

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
          This will remove{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {subscriptionPendingDelete.email}
          </span>{" "}
          from the newsletter list.
        </ConfirmDialog>
      ) : null}
    </>
  );
}
