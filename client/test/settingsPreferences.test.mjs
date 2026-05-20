import assert from "node:assert/strict";
import { test } from "node:test";

const preferences = await import("../app/(account)/settings/settingsPreferences.js");

test("settings preferences expose stable defaults and options", () => {
  assert.equal(preferences.settingsStorageKey, "hirenova-settings");
  assert.equal(preferences.defaultSettings.theme, "light");
  assert.equal(preferences.defaultSettings.weeklyDigest, false);
  assert.deepEqual(
    preferences.jobTypeOptions.map((option) => option.value),
    ["any", "full-time", "part-time", "remote", "contract"],
  );
  assert.deepEqual(
    preferences.themeOptions.map((option) => option.value),
    ["light", "dark"],
  );
});

test("PDF helpers escape unsafe text and wrap long lines", () => {
  assert.equal(
    preferences.escapePdfText("Hello (team)\\now\nnext"),
    "Hello \\(team\\)\\\\now next",
  );

  assert.deepEqual(
    preferences.wrapLine("one two three four", 8),
    ["one two", "three", "four"],
  );
});

test("buildAccountDataLines combines profile, user, and settings data", () => {
  const lines = preferences.buildAccountDataLines({
    generatedAt: new Date("2026-05-20T10:00:00.000Z"),
    profile: {
      username: "candidate",
      email: "candidate@example.com",
      role: "jobseeker",
      status: "active",
      createdAt: "2026-05-01T00:00:00.000Z",
      skills: ["React", "Node"],
      experience: 3,
      preferredLocation: "Dhaka",
    },
    settings: {
      theme: "dark",
      weeklyDigest: true,
    },
    user: {
      name: "Fallback",
      email: "fallback@example.com",
    },
  });

  assert.ok(lines.includes("HireNova Account Data"));
  assert.ok(lines.includes("Name: candidate"));
  assert.ok(lines.includes("Email: candidate@example.com"));
  assert.ok(lines.includes("Skills: React, Node"));
  assert.ok(lines.includes("Experience: 3 years"));
  assert.ok(lines.includes("theme: dark"));
  assert.ok(lines.includes("weeklyDigest: true"));
});

test("createPdf returns a PDF blob with escaped content", async () => {
  const blob = preferences.createPdf(["Account (Data)", "path\\value"]);
  const text = Buffer.from(await blob.arrayBuffer()).toString("utf8");

  assert.equal(blob.type, "application/pdf");
  assert.match(text, /^%PDF-1\.4/);
  assert.match(text, /Account \\\(Data\\\)/);
  assert.match(text, /path\\\\value/);
  assert.match(text, /%%EOF$/);
});
