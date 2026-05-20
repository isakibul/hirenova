import assert from "node:assert/strict";
import { test } from "node:test";

const url = await import("../app/_lib/url.js");

test("search params omit empty values and preserve arrays", () => {
  const params = url.toSearchParams({
    search: "engineer",
    empty: "",
    missing: undefined,
    none: null,
    role: ["admin", "", "employer"],
    page: 2,
  });

  assert.equal(params.get("search"), "engineer");
  assert.equal(params.has("empty"), false);
  assert.deepEqual(params.getAll("role"), ["admin", "employer"]);
  assert.equal(params.get("page"), "2");
});

test("query string helper serializes compact values", () => {
  assert.equal(
    url.toQueryString({ page: 1, sort_by: "createdAt", status: "" }),
    "page=1&sort_by=createdAt",
  );
});
