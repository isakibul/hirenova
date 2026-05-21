const { expect, test } = require("@playwright/test");

const { getSeedData, loginAs, resetSeedData } = require("./helpers");

test.beforeEach(async ({ request }) => {
  await resetSeedData(request);
});

test("admin reviews employer jobs and publishes approved roles", async ({
  page,
  request,
}) => {
  const seed = getSeedData();

  await loginAs(page, request, "admin");
  await page.goto("/manage-jobs?approval_status=pending");
  await expect(page.getByRole("heading", { name: "Manage Jobs" })).toBeVisible();
  await expect(page.getByText(seed.jobs.pending.title)).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("Job approved.")).toBeVisible();

  await page.goto(`/jobs/${seed.jobs.pending.id}`);
  await expect(page.getByRole("heading", { name: seed.jobs.pending.title })).toBeVisible();
  await expect(page.getByText("Open Role").first()).toBeVisible();
});

test("employer can create a job that enters admin review", async ({
  page,
  request,
}) => {
  const title = `Employer Created E2E Role ${Date.now()}`;

  await loginAs(page, request, "employer");
  await page.goto("/manage-jobs");
  await page.getByRole("button", { name: "New Job" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Location").fill("Remote");
  await page.getByPlaceholder("Min").fill("2");
  await page.getByPlaceholder("Max").fill("5");
  await page.getByLabel("Salary").fill("115000");
  await page.getByLabel("Skills Required").fill("React, Hiring");
  await page
    .getByPlaceholder(/Describe the role/)
    .fill("Create a new listing through the browser E2E suite.");
  await page.getByRole("button", { name: "Create Job" }).click();
  await expect(page.getByText("Job submitted for admin approval.")).toBeVisible();
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText("Pending").first()).toBeVisible();
});

test("employer can turn on AI ranking for job applications", async ({
  page,
  request,
}) => {
  const seed = getSeedData();

  await loginAs(page, request, "employer");
  await page.goto(`/manage-jobs/${seed.jobs.approved.id}/applications`);
  await expect(page.getByRole("heading", { name: "Applicants", exact: true })).toBeVisible();
  await expect(page.getByText(seed.users.jobseeker.email)).toBeVisible();
  const applicationsUrl = page.url();
  await page.getByRole("button", { name: new RegExp(seed.users.jobseeker.email) }).click();
  await expect(page).toHaveURL(applicationsUrl);
  await expect(page.getByText("Selected applicant review.")).toBeVisible();
  await expect(
    page.getByRole("complementary").getByText("Seeded application for E2E coverage."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "View Profile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View Resume" })).toHaveAttribute(
    "href",
    "https://example.test/e2e-resume.pdf",
  );
  await expect(page.getByRole("checkbox", { name: "AI Ranking" })).toBeEnabled();
  await page.getByRole("checkbox", { name: "AI Ranking" }).check();
  await expect(page.getByRole("button", { name: /#1 · \d+\/100/ })).toBeVisible();
  await expect(page.getByText(/Ranking reason|AI reason/)).toBeVisible();
});

test("employer can delete a job application", async ({ page, request }) => {
  const seed = getSeedData();

  await loginAs(page, request, "employer");
  await page.goto(`/manage-jobs/${seed.jobs.approved.id}/applications`);
  await expect(page.getByText(seed.users.jobseeker.email)).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByRole("heading", { name: "Delete application?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete Application" }).click();
  await expect(page.getByText(seed.users.jobseeker.email)).toHaveCount(0);
  await expect(page.getByText("No applicants yet")).toBeVisible();
});
