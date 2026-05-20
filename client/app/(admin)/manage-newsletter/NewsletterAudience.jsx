"use client";

import Icon from "@components/Icon";
import PaginationControls from "@components/PaginationControls";
import { RowListSkeleton } from "@components/Skeleton";
import SelectField from "@components/forms/SelectField";
import { formatDate, getRecordId } from "@lib/ui";

import {
  formatSource,
  formatStatus,
  sortOptions,
  statusOptions,
} from "./newsletterUtils";

export default function NewsletterAudience({
  isLoading,
  onClearFilters,
  onPageChange,
  onRemove,
  onSearch,
  onSearchInputChange,
  onSortByChange,
  onSortTypeToggle,
  onStatusChange,
  onStatusUpdate,
  page,
  pagination,
  removingId,
  search,
  searchInput,
  sortBy,
  sortType,
  status,
  statusUpdatingId,
  subscriptions,
  totalPages,
}) {
  return (
    <div className="site-border site-card mt-6 overflow-hidden rounded-lg border xl:col-span-2 xl:col-start-1 xl:row-start-2 xl:mt-0">
      <div className="border-b border-[var(--site-border)] p-4">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Audience</h2>
            <p className="site-muted mt-1 text-sm">
              Manage subscription status, campaign eligibility, and permanent
              removals.
            </p>
          </div>
        </div>
        <form
          onSubmit={onSearch}
          className="grid gap-3 lg:grid-cols-[1fr_180px_190px_140px]"
        >
          <label className="relative">
            <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Icon name="search" />
            </span>
            <input
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
              placeholder="Search email"
            />
          </label>
          <SelectField
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
            className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"
          />
          <SelectField
            value={sortBy}
            onChange={onSortByChange}
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
            onClick={onSortTypeToggle}
            className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold"
          >
            {sortType === "dsc" ? "Descending" : "Ascending"}
          </button>
          {search || status ? (
            <button
              type="button"
              onClick={onClearFilters}
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
          <div className="min-w-[720px]">
            <div className="site-panel grid grid-cols-[minmax(260px,1fr)_104px_240px] gap-3 border-b border-[var(--site-border)] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--site-muted)]">
              <span className="whitespace-nowrap">Email</span>
              <span className="whitespace-nowrap">Status</span>
              <span className="whitespace-nowrap text-right">Action</span>
            </div>
            {subscriptions.map((subscription) => {
              const subscriptionId = getRecordId(subscription);
              const isUnsubscribed = subscription.status === "unsubscribed";

              return (
                <div
                  key={subscriptionId}
                  className="grid grid-cols-[minmax(260px,1fr)_104px_240px] items-center gap-3 border-b border-[var(--site-border)] px-4 py-4 transition last:border-b-0 hover:bg-[var(--site-panel)]"
                >
                  <div className="min-w-0">
                    <p className="truncate whitespace-nowrap text-base font-semibold">
                      {subscription.email}
                    </p>
                    <p className="site-muted mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="tag" />
                        {formatSource(subscription.source)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="calendar" />
                        {formatDate(subscription.subscribedAt)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-xs font-medium ${
                        isUnsubscribed ? "site-border site-panel" : "site-success"
                      }`}
                    >
                      {formatStatus(subscription.status)}
                    </span>
                  </div>
                  <div className="flex flex-nowrap justify-end gap-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onStatusUpdate(subscription)}
                      disabled={
                        statusUpdatingId === subscriptionId ||
                        removingId === subscriptionId
                      }
                      className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition disabled:opacity-60 ${
                        isUnsubscribed ? "site-button" : "site-border site-field"
                      }`}
                    >
                      <Icon name={isUnsubscribed ? "check" : "x"} />
                      {statusUpdatingId === subscriptionId
                        ? "Updating"
                        : isUnsubscribed
                          ? "Resubscribe"
                          : "Unsubscribe"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(subscription)}
                      disabled={
                        removingId === subscriptionId ||
                        statusUpdatingId === subscriptionId
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 text-xs font-medium text-[var(--site-danger-text)] transition disabled:opacity-60"
                    >
                      <Icon name="trash" />
                      {removingId === subscriptionId ? "Deleting" : "Delete"}
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
        onPageChange={onPageChange}
      />
    </div>
  );
}
