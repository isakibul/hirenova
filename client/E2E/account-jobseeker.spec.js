const { expect, test } = require("@playwright/test");

const {
  apiLogin,
  createApprovedJob,
  loginAs,
  resetSeedData,
} = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("jobseeker searches, applies, and saves a job", async ({
  page,
  request,
}) => {
  const adminAuth = await apiLogin(request, "admin");
  const job = await createApprovedJob(
    request,
    adminAuth.setCookie,
    `QA Automation Engineer E2E ${Date.now()}`,
  );

  await loginAs(page, request, "jobseeker");

  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: "Find Your Next Role" })).toBeVisible();
  await page
    .getByRole("main")
    .getByPlaceholder("Job title, keyword, or skill")
    .fill("QA Automation");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();

  await page.goto(`/jobs/${job.id}`);
  await page.getByPlaceholder("Optional cover letter").fill("I can help validate this hiring workflow end to end.");
  await page.getByRole("button", { name: "Apply Now" }).click();
  await expect(page.getByText("Application submitted.")).toBeVisible();
  await page.getByRole("button", { name: "Save Job" }).click();
  await expect(page.getByText("Job saved.")).toBeVisible();
});
