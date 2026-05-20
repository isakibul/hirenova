const { expect, test } = require("@playwright/test");

test("auth forms expose client validation before submitting", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Password is required.")).toBeVisible();

  await page.goto("/signup");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText("Username is required.")).toBeVisible();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Password is required.")).toBeVisible();

  await page.getByRole("textbox", { name: "Username" }).fill("bad-name");
  await page.getByPlaceholder("you@example.com").fill("not-an-email");
  await page.getByPlaceholder("At least 8 characters").fill("weakpass");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(
    page.getByText("Username can only contain letters and numbers."),
  ).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(
    page.getByText("Password must include uppercase, lowercase, and a number."),
  ).toBeVisible();

  await page.goto("/forgot-password");
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByText("Email is required.")).toBeVisible();

  await page.goto("/reset-password");
  await expect(
    page.getByText("Reset token is missing. Please request a new reset link."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset Password" })).toBeDisabled();
});
