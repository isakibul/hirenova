const { expect, test } = require("@playwright/test");

const { loginAs, resetSeedData } = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("authenticated header menus expose accessible controls and dismiss with Escape", async ({
  page,
  request,
}) => {
  await loginAs(page, request, "jobseeker");
  await page.goto("/jobs");

  await page.getByLabel("Open notifications").click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();

  await page.getByLabel("Open messages").click();
  await expect(
    page.getByRole("heading", { name: "Inbox" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Inbox" }),
  ).toBeHidden();
});
