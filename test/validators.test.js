const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  jobApprovalSchema,
  jobSchema,
} = require("../src/lib/validators/jobValidator");
const {
  applicationSchema,
  applicationStatusSchema,
} = require("../src/lib/validators/applicationValidator");
const {
  loginSchema,
  registerSchema,
} = require("../src/lib/validators/authValidator");

test("job validation accepts a complete public job payload", () => {
  const { error, value } = jobSchema.validate({
    title: "Senior Platform Engineer",
    description: "Build reliable hiring workflows.",
    location: "Remote",
    jobType: "remote",
    skillsRequired: ["Node.js", "React"],
    experienceMin: 3,
    experienceMax: 6,
    salary: 140000,
    status: "open",
    expiresAt: "2027-01-31T00:00:00.000Z",
  });

  assert.equal(error, undefined);
  assert.equal(value.jobType, "remote");
});

test("job validation rejects unsupported status values", () => {
  const { error } = jobSchema.validate({
    title: "Senior Platform Engineer",
    status: "archived",
  });

  assert.match(error.message, /must be one of/);
});

test("declined job approvals require a rejection note", () => {
  const { error } = jobApprovalSchema.validate({
    approvalStatus: "declined",
  });

  assert.match(error.message, /rejectionNote/);
});

test("approval validation rejects non-reviewable pending status", () => {
  const { error } = jobApprovalSchema.validate({
    approvalStatus: "pending",
  });

  assert.match(error.message, /must be one of/);
});

test("registration validation accepts public signup roles only", () => {
  const valid = registerSchema.validate({
    username: "candidate1",
    email: "candidate@example.com",
    password: "Password1",
    role: "jobseeker",
  });
  const invalid = registerSchema.validate({
    username: "admin1",
    email: "admin@example.com",
    password: "Password1",
    role: "admin",
  });

  assert.equal(valid.error, undefined);
  assert.match(invalid.error.message, /must be one of/);
});

test("registration validation enforces password complexity", () => {
  const { error } = registerSchema.validate({
    username: "candidate1",
    email: "candidate@example.com",
    password: "password",
    role: "jobseeker",
  });

  assert.match(error.message, /Password must contain/);
});

test("login validation requires email-shaped identifiers", () => {
  const { error } = loginSchema.validate({
    email: "not-an-email",
    password: "Password1",
  });

  assert.match(error.message, /valid email/);
});

test("application validation allows empty cover letters but rejects oversize text", () => {
  const valid = applicationSchema.validate({ coverLetter: "" });
  const invalid = applicationSchema.validate({ coverLetter: "x".repeat(3001) });

  assert.equal(valid.error, undefined);
  assert.match(invalid.error.message, /less than or equal to 3000/);
});

test("application status validation only accepts workflow statuses", () => {
  const valid = applicationStatusSchema.validate({ status: "shortlisted" });
  const invalid = applicationStatusSchema.validate({ status: "archived" });

  assert.equal(valid.error, undefined);
  assert.match(invalid.error.message, /must be one of/);
});
