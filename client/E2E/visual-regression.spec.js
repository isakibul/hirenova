const { expect, test } = require("@playwright/test");

const { resetSeedData } = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("public landing and jobs pages keep stable visual layouts", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home-page.png", {
    fullPage: true,
    animations: "disabled",
  });

  await page.goto("/jobs");
  await expect(page).toHaveScreenshot("jobs-page.png", {
    fullPage: true,
    animations: "disabled",
  });
});
