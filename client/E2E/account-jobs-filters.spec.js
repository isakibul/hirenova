const { expect, test } = require("@playwright/test");

const { apiLogin, createApprovedJob, loginAs, resetSeedData } = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("jobs filters update results and can be cleared without a page reload", async ({
  page,
  request,
}) => {
  const adminAuth = await apiLogin(request, "admin");
  const job = await createApprovedJob(
    request,
    adminAuth.setCookie,
    `Remote Filter Engineer E2E ${Date.now()}`,
  );

  await loginAs(page, request, "jobseeker");
  await page.goto("/jobs");

  await page
    .getByRole("main")
    .getByPlaceholder("Job title, keyword, or skill")
    .fill("Remote Filter Engineer");
  await page.getByLabel("Minimum salary value").fill("90000");
  await page.getByLabel("Maximum salary value").fill("120000");
  await page.getByLabel("Remote").check();
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();
  await expect(page).toHaveURL(/search=Remote\+Filter\+Engineer/);
  await expect(page).toHaveURL(/job_type=remote/);
  await expect(page).toHaveURL(/max_salary=120000/);

  await page.getByRole("button", { name: "Clear Filter" }).click();
  await expect(page).toHaveURL(/\/jobs$/);
  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();
});
