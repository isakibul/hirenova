"use client";

import Icon from "@components/Icon";
import LoadingCircle from "@components/LoadingCircle";

export default function CampaignComposer({
  campaignForm,
  isSendingCampaign,
  onFieldChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="site-border site-card rounded-lg border xl:col-span-2 xl:col-start-1 xl:row-start-1"
    >
      <div className="border-b border-[var(--site-border)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Compose
            </p>
            <h2 className="mt-2 text-lg font-semibold">Send campaign</h2>
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
            onChange={(event) => onFieldChange("subject", event.target.value)}
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
              onFieldChange("previewText", event.target.value)
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
            onChange={(event) => onFieldChange("body", event.target.value)}
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
  );
}
