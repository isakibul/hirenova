import assert from "node:assert/strict";
import { test } from "node:test";

const formValidation = await import("../app/_lib/formValidation.js");

test("username validation matches backend alphanumeric rule", () => {
  assert.equal(formValidation.usernameError("candidate1"), "");
  assert.equal(
    formValidation.usernameError("candidate_one"),
    "Username can only contain letters and numbers.",
  );
});
