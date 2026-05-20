import assert from "node:assert/strict";
import { test } from "node:test";

const newsletterUtils = await import(
  "../app/(admin)/manage-newsletter/newsletterUtils.js"
);

test("newsletter utilities format subscription and campaign states", () => {
  assert.equal(newsletterUtils.formatStatus("unsubscribed"), "Unsubscribed");
  assert.equal(newsletterUtils.formatStatus("subscribed"), "Subscribed");
  assert.equal(newsletterUtils.formatSource("auth-signup"), "Account signup");
  assert.equal(newsletterUtils.formatSource("unknown"), "unknown");
  assert.equal(newsletterUtils.getCampaignStatusLabel("partial"), "Partial");
  assert.equal(newsletterUtils.getCampaignStatusLabel("failed"), "Failed");
  assert.equal(newsletterUtils.getCampaignStatusLabel("sent"), "Sent");
  assert.equal(newsletterUtils.getCampaignStatusClass("sent"), "site-success");
  assert.equal(newsletterUtils.getCampaignStatusClass("failed"), "site-danger");
  assert.equal(
    newsletterUtils.getCampaignStatusClass("partial"),
    "site-border site-panel",
  );
});
