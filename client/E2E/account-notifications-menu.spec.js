const { expect, test } = require("@playwright/test");

const { loginAs, resetSeedData } = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("notification dropdown loads unread state and marks all read", async ({
  page,
  request,
}) => {
  await loginAs(page, request, "jobseeker");
  await page.goto("/jobs");

  await page.getByRole("button", { name: "Open notifications" }).click();
  await expect(page.getByRole("menu")).toContainText("Notifications");
  await expect(page.getByRole("menu")).toContainText(/unread|All caught up/i);

  const markAllButton = page.getByRole("button", { name: "Mark all read" });
  if (await markAllButton.isEnabled()) {
    await markAllButton.click();
    await expect(page.getByRole("menu")).toContainText("All caught up");
  }

  await page.getByRole("link", { name: "View all notifications" }).click();
  await expect(page).toHaveURL(/\/notifications$/);
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
});
