const { expect, test } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const { loginAs, resetSeedData } = require("./helpers");

async function expectNoAccessibilityViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("public and authenticated core pages pass axe accessibility checks", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expectNoAccessibilityViolations(page);

  await page.goto("/login");
  await expectNoAccessibilityViolations(page);

  await loginAs(page, request, "jobseeker");
  await page.goto("/jobs");
  await expectNoAccessibilityViolations(page);

  await page.goto("/settings");
  await expectNoAccessibilityViolations(page);
});
