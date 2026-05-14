const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  authenticationError,
  authorizationError,
  badRequest,
  notFound,
  serverError,
} = require("../src/utils/error");
const {
  getHATEOASforAllItems,
  getPagination,
  getTransformedItems,
} = require("../src/utils/getPagination");
const { generateQueryString } = require("../src/utils/qs");
const sanitizeText = require("../src/utils/sanitizeText");
const hashValue = require("../src/lib/observability/hash");
const { resolveAction } = require("../src/lib/observability/audit");

test("error helpers attach expected HTTP statuses", () => {
  assert.equal(serverError().status, 500);
  assert.equal(badRequest("Nope").status, 400);
  assert.equal(notFound().status, 404);
  assert.equal(authenticationError().status, 401);
  assert.equal(authorizationError().status, 403);
  assert.equal(badRequest("Nope").message, "Nope");
});

test("sanitizeText strips dangerous markup and event handlers", () => {
  const sanitized = sanitizeText(
    ' <script>alert(1)</script><a href="javascript:alert(1)" onclick="x()">Apply</a> ',
  );

  assert.equal(sanitized, '<a href="#">Apply</a>');
});

test("generateQueryString encodes keys and values", () => {
  assert.equal(
    generateQueryString({ search: "react engineer", "sort/type": "a&b" }),
    "search=react%20engineer&sort%2Ftype=a%26b",
  );
});

test("getPagination returns next and previous page metadata", () => {
  assert.deepEqual(getPagination({ totalItems: 25, limit: 10, page: 2 }), {
    page: 2,
    limit: 10,
    totalItems: 25,
    totalPage: 3,
    next: 3,
    prev: 1,
  });
});

test("getHATEOASforAllItems creates page links from query state", () => {
  assert.deepEqual(
    getHATEOASforAllItems({
      url: "/api/v1/jobs?page=2",
      path: "/api/v1/jobs",
      query: { search: "remote" },
      hasNext: true,
      hasPrev: true,
      page: 2,
    }),
    {
      self: "/api/v1/jobs?page=2",
      next: "/api/v1/jobs?search=remote&page=3",
      prev: "/api/v1/jobs?search=remote&page=1",
    },
  );
});

test("getTransformedItems selects requested fields and appends item links", () => {
  assert.deepEqual(
    getTransformedItems({
      items: [{ id: "job-1", title: "Engineer", salary: 100 }],
      selection: ["title"],
      path: "/jobs",
    }),
    [{ title: "Engineer", link: "/jobs/job-1" }],
  );
});

test("hashValue is normalized and deterministic", () => {
  const first = hashValue(" Person@Example.com ");
  const second = hashValue("person@example.com");

  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test("resolveAction maps audited routes and ignores unknown routes", () => {
  assert.equal(resolveAction("POST", "/api/v1/auth/signup"), "auth.signup");
  assert.equal(resolveAction("PATCH", "/api/v1/jobs/abc/status"), "job.status_update");
  assert.equal(resolveAction("GET", "/api/v1/jobs"), "");
});
