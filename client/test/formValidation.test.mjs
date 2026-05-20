import assert from "node:assert/strict";
import { test } from "node:test";

const formValidation = await import("../app/_lib/formValidation.js");

test("username validation matches backend alphanumeric rule", () => {
  assert.equal(formValidation.usernameError("candidate1"), "");
  assert.equal(formValidation.usernameError(""), "Username is required.");
  assert.equal(
    formValidation.usernameError("ab"),
    "Username must be at least 3 characters.",
  );
  assert.equal(
    formValidation.usernameError("a".repeat(51)),
    "Username must be 50 characters or less.",
  );
  assert.equal(
    formValidation.usernameError("candidate_one"),
    "Username can only contain letters and numbers.",
  );
});

test("common field validation helpers cover required, email, and password states", () => {
  assert.equal(formValidation.isBlank("  "), true);
  assert.equal(formValidation.required("", "Title"), "Title is required.");
  assert.equal(formValidation.required("Title", "Title"), "");
  assert.equal(formValidation.emailError(""), "Email is required.");
  assert.equal(formValidation.emailError("bad-email"), "Enter a valid email address.");
  assert.equal(formValidation.emailError("person@example.com"), "");
  assert.equal(formValidation.passwordError("", "Password"), "Password is required.");
  assert.equal(
    formValidation.passwordError("short", "Password"),
    "Password must be at least 8 characters.",
  );
  assert.equal(
    formValidation.passwordError("a".repeat(51), "Password"),
    "Password must be 50 characters or less.",
  );
  assert.equal(
    formValidation.passwordError("password1", "Password"),
    "Password must include uppercase, lowercase, and a number.",
  );
  assert.equal(formValidation.passwordError("Password1", "Password"), "");
});

test("numeric and length validation helpers expose display-ready messages", () => {
  assert.equal(formValidation.optionalNumberError("", "Salary"), "");
  assert.equal(
    formValidation.optionalNumberError("abc", "Salary"),
    "Salary must be a valid number.",
  );
  assert.equal(
    formValidation.optionalNumberError("2", "Experience", { min: 3 }),
    "Experience must be at least 3.",
  );
  assert.equal(formValidation.optionalNumberError("5", "Experience", { min: 3 }), "");
  assert.equal(formValidation.minLengthError("", "Bio", 10), "Bio is required.");
  assert.equal(
    formValidation.minLengthError("short", "Bio", 10),
    "Bio must be at least 10 characters.",
  );
  assert.equal(formValidation.minLengthError("long enough", "Bio", 10), "");
  assert.equal(
    formValidation.maxLengthError("abcdef", "Bio", 5),
    "Bio must be 5 characters or less.",
  );
  assert.equal(formValidation.maxLengthError("abc", "Bio", 5), "");
});

test("validation visibility helpers support touched and submitted form states", () => {
  const errors = { email: "Email is required.", password: "" };

  assert.equal(formValidation.hasValidationErrors(errors), true);
  assert.deepEqual(formValidation.touchAll(errors), {
    email: true,
    password: true,
  });
  assert.deepEqual(
    formValidation.getVisibleErrors(errors, { email: true }, false),
    { email: "Email is required.", password: "" },
  );
  assert.deepEqual(formValidation.getVisibleErrors(errors, {}, true), errors);
});
