const { expect, test } = require("@playwright/test");

const { getSeedData, loginAs, resetSeedData } = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("jobseeker can update profile details", async ({ page, request }) => {
  const seed = getSeedData();

  await loginAs(page, request, "jobseeker");
  await page.goto("/profile");
  await expect(
    page.getByRole("textbox", { name: "Email", exact: true }),
  ).toHaveValue(seed.users.jobseeker.email);

  await page.getByRole("button", { name: /edit profile/i }).click();
  await page.getByLabel("Preferred Location").fill("Remote E2E");
  await page.getByRole("button", { name: /save profile/i }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();
});
