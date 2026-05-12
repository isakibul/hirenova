"use client";

import Icon from "@components/Icon";
import SelectField from "@components/forms/SelectField";
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

function getMessage(body, fallback) {
  return body?.error ?? body?.message ?? fallback;
}

function getSubscriptionId(subscription) {
  return subscription.id ?? subscription._id ?? "";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

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
      const response = await fetch(
        `/api/manage-newsletter?${params.toString()}`,
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          getMessage(body, "Unable to load newsletter subscriptions."),
        );
      }
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
    if (
      page === 1 &&
      !search &&
      !status &&
      sortBy === "createdAt" &&
      sortType === "dsc"
    ) {
      return;
    }

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

    const subscriptionId = getSubscriptionId(subscriptionPendingDelete);
    if (!subscriptionId) {
      setSubscriptionPendingDelete(null);
      return;
    }

    setRemovingId(subscriptionId);
    setNotice("");
    setError("");

    try {
      const response = await fetch(`/api/manage-newsletter/${subscriptionId}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(getMessage(body, "Unable to remove subscription."));
      }

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
      <section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
      <div className="mx-auto max-w-6xl">
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

        {notice ? (
          <div className="site-success mt-5 rounded-lg border px-4 py-3 text-sm">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="site-danger mt-5 rounded-lg border px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

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
              <div className="site-muted px-4 py-10 text-center text-sm">
                Loading subscriptions...
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="font-semibold">No newsletter emails found</p>
                <p className="site-muted mt-1 text-xs">
                  New home page subscribers will appear here.
                </p>
              </div>
            ) : (
              subscriptions.map((subscription) => {
                const subscriptionId = getSubscriptionId(subscription);
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

          <div className="site-panel flex flex-col gap-3 border-t border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="site-muted text-xs">
              Page {pagination?.page ?? page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page <= 1 || isLoading}
                className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages))
                }
                disabled={page >= totalPages || isLoading}
                className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      </section>

      {subscriptionPendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-newsletter-title"
          aria-describedby="delete-newsletter-description"
        >
          <div className="site-border site-card w-full max-w-md rounded-lg border p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] p-2 text-[var(--site-danger-text)]">
                <Icon name="trash" />
              </span>
              <div>
                <h2
                  id="delete-newsletter-title"
                  className="text-lg font-semibold"
                >
                  Delete newsletter email?
                </h2>
                <p
                  id="delete-newsletter-description"
                  className="site-muted mt-2 text-sm leading-6"
                >
                  This will remove{" "}
                  <span className="font-semibold text-[var(--site-fg)]">
                    {subscriptionPendingDelete.email}
                  </span>{" "}
                  from the newsletter list.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubscriptionPendingDelete(null)}
                disabled={
                  removingId === getSubscriptionId(subscriptionPendingDelete)
                }
                className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={
                  removingId === getSubscriptionId(subscriptionPendingDelete)
                }
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--site-danger-text)] disabled:opacity-60"
              >
                <Icon name="trash" />
                {removingId === getSubscriptionId(subscriptionPendingDelete)
                  ? "Deleting..."
                  : "Delete Email"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
