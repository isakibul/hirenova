"use client";

import Icon from "@components/Icon";
import { formatDate } from "@lib/ui";

import {
  getCampaignStatusClass,
  getCampaignStatusLabel,
} from "./newsletterUtils";

export default function CampaignSidebar({
  campaignForm,
  campaigns,
  campaignRemovingId,
  onCampaignRemove,
}) {
  return (
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
                      onClick={() => onCampaignRemove(campaign)}
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
  );
}
