const { expect, test } = require("@playwright/test");

const { loginAs, resetSeedData } = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("settings persist through the backend and survive reloads", async ({
  page,
  request,
}) => {
  await loginAs(page, request, "jobseeker");
  await page.goto("/settings");

  await expect(page.getByText("Loading saved settings...")).toBeHidden();
  await page.getByRole("button", { name: "Night" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByPlaceholder("Remote, Dhaka, New York").fill("Sylhet");
  await page.getByText("Weekly digest").click();
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.getByText("Settings saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByPlaceholder("Remote, Dhaka, New York")).toHaveValue(
    "Sylhet",
  );

  await page.getByRole("button", { name: "Reset preferences" }).click();
  await expect(page.getByText("Settings reset.")).toBeVisible();
});
