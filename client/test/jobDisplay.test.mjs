import assert from "node:assert/strict";
import { test } from "node:test";

const jobDisplay = await import("../app/(jobs)/jobs/jobDisplay.js");

test("job display helpers format public job fields", () => {
  assert.equal(jobDisplay.formatJobType("full-time"), "Full Time");
  assert.equal(jobDisplay.formatJobType(""), "Not specified");
  assert.equal(jobDisplay.formatSalary(120000), "$120,000");
  assert.equal(jobDisplay.formatSalary("120000"), "Not disclosed");
  assert.equal(
    jobDisplay.formatExperience({ experienceMin: 2, experienceMax: 5 }),
    "2-5 years",
  );
  assert.equal(
    jobDisplay.formatExperience({ experienceMin: 2, experienceMax: 2 }),
    "2 years",
  );
  assert.equal(jobDisplay.formatExperience({ experienceRequired: 3 }), "3+ years");
  assert.equal(jobDisplay.formatExperience({ experienceMax: 4 }), "Up to 4 years");
  assert.equal(jobDisplay.formatExperience({}), "Not specified");
});

test("job display helpers derive status labels", () => {
  assert.equal(jobDisplay.getJobStatus({ approvalStatus: "pending" }), "Under Review");
  assert.equal(jobDisplay.getJobStatus({ approvalStatus: "declined" }), "Declined");
  assert.equal(
    jobDisplay.getJobStatus({ expiresAt: "2000-01-01T00:00:00.000Z" }),
    "Expired",
  );
  assert.equal(jobDisplay.getJobStatus({ status: "closed" }), "Closed");
  assert.equal(jobDisplay.getJobStatus({ status: "open" }), "Open Role");
});
