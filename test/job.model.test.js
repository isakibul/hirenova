const assert = require("node:assert/strict");
const { test } = require("node:test");

const Job = require("../src/model/Job");

test("Job createdAt default is evaluated per document", () => {
  const createdAtDefault = Job.schema.path("createdAt").defaultValue;

  assert.equal(createdAtDefault, Date.now);

  const firstJob = new Job({ title: "Senior Product Engineer" });
  const secondJob = new Job({ title: "Senior Product Designer" });

  assert.ok(firstJob.createdAt instanceof Date);
  assert.ok(secondJob.createdAt instanceof Date);
  assert.notEqual(firstJob.createdAt, secondJob.createdAt);
});
