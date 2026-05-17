const { expect, test } = require("@playwright/test");

const { getSeedData } = require("./helpers");

test("marketing pages, signup, pending-login, and seeded login flow work", async ({
  page,
}) => {
  const seed = getSeedData();
  const unique = Date.now();
  const email = `e2e.signup.${unique}@hirenova.test`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /command center/i })).toBeVisible();
  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page).toHaveURL(new RegExp(`/signup\\?email=${encodeURIComponent(email)}`));
  await page.goto(`/signup?email=${encodeURIComponent(email)}`);
  await expect(
    page.getByRole("heading", { name: /career profile/i }),
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Username" }).fill(`e2esignup${unique}`);
  await page.getByLabel("Password").fill(seed.password);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText(/registration successful/i)).toBeVisible();

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password").fill(seed.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText(/your account is pending/i)).toBeVisible();

  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(seed.users.jobseeker.email);
  await page.getByLabel("Password").fill(seed.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/jobs$/);
  await expect(page.getByRole("button", { name: "Open profile menu" })).toBeVisible();
});
