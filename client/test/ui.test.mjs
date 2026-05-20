import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

const ui = await import("../app/_lib/ui.js");

afterEach(() => {
  Date.now = originalDateNow;
});

const originalDateNow = Date.now;

test("getApiMessage prefers validation errors before generic messages", () => {
  assert.equal(
    ui.getApiMessage(
      { errors: ["Email is required.", "Password is too short."], error: "Nope" },
      "Fallback.",
    ),
    "Email is required. Password is too short.",
  );

  assert.equal(ui.getApiMessage({ message: "Saved." }), "Saved.");
  assert.equal(ui.getApiMessage({ error: "Nope." }), "Nope.");
  assert.equal(ui.getApiMessage({}, "Try again."), "Try again.");
});

test("format helpers produce stable display values and fallbacks", () => {
  assert.equal(ui.classNames("a", "", false, "b"), "a b");
  assert.equal(ui.getRecordId({ id: "id-1", _id: "id-2" }), "id-1");
  assert.equal(ui.getRecordId({ _id: "id-2" }), "id-2");
  assert.equal(ui.getRecordId(null), "");
  assert.equal(ui.formatDate("2026-05-15T00:00:00.000Z"), "May 15, 2026");
  assert.equal(ui.formatDate("", "Missing"), "Missing");
  assert.equal(ui.formatDate("not-a-date", "Missing"), "Missing");
  assert.equal(ui.formatDateTime("", "Missing"), "Missing");
  assert.equal(ui.formatDateTime("bad-date", "Missing"), "Missing");
  assert.equal(ui.formatExperienceYears(1), "1 year");
  assert.equal(ui.formatExperienceYears(3), "3 years");
  assert.equal(ui.formatExperienceYears("3", "Missing"), "Missing");
  assert.equal(ui.formatTitle("", "Missing"), "Missing");
  assert.equal(ui.formatTitle("remote"), "Remote");
  assert.equal(ui.getDisplayName(null, "Fallback"), "Fallback");
  assert.equal(ui.getDisplayName({ email: "candidate@example.com" }), "candidate@example.com");
});

test("candidate profile links are only generated for jobseekers with ids", () => {
  assert.equal(
    ui.getCandidateProfileHref({ _id: "user-1", role: "jobseeker" }),
    "/candidates?candidate=user-1",
  );
  assert.equal(ui.getCandidateProfileHref({ _id: "user-2", role: "employer" }), "");
  assert.equal(ui.getCandidateProfileHref({ role: "jobseeker" }), "");
});

test("presence helpers identify online and recent activity windows", () => {
  Date.now = () => new Date("2026-05-15T12:00:00.000Z").getTime();

  assert.equal(ui.formatPresence(""), "Last seen not available");
  assert.equal(ui.formatPresence("2026-05-15T11:59:00.000Z"), "Online");
  assert.equal(ui.formatPresence("2026-05-15T11:30:00.000Z"), "Last seen 30 min ago");
  assert.equal(ui.formatPresence("2026-05-15T09:00:00.000Z"), "Last seen 3 hr ago");
  assert.match(ui.formatPresence("2026-05-14T09:00:00.000Z"), /Last seen/);
  assert.equal(ui.formatPresence("bad-date"), "Last seen not available");
  assert.equal(ui.isOnline(""), false);
  assert.equal(ui.isOnline("2026-05-15T11:59:00.000Z"), true);
  assert.equal(ui.isOnline("2026-05-15T11:30:00.000Z"), false);
});

test("conversation helpers find the other participant", () => {
  assert.deepEqual(
    ui.getOtherParticipant(
      { participants: [{ id: "user-1" }, { _id: "user-2" }] },
      "user-1",
    ),
    { _id: "user-2" },
  );
  assert.equal(ui.getOtherParticipant(null, "user-1"), undefined);
});
