const { expect, test } = require("@playwright/test");

const {
  apiLogin,
  createApprovedJob,
  getSeedData,
  loginAs,
} = require("./helpers");

test("jobseeker searches, applies, saves, updates profile, and reads notifications", async ({
  page,
  request,
}) => {
  const seed = getSeedData();
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
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("heading", { name: job.title })).toBeVisible();

  await page.goto(`/jobs/${job.id}`);
  await page.getByPlaceholder("Optional cover letter").fill("I can help validate this hiring workflow end to end.");
  await page.getByRole("button", { name: "Apply Now" }).click();
  await expect(page.getByText("Application submitted.")).toBeVisible();
  await page.getByRole("button", { name: "Save Job" }).click();
  await expect(page.getByText("Job saved.")).toBeVisible();

  await page.goto("/applications");
  await expect(page.getByText(job.title)).toBeVisible();

  await page.goto("/saved-jobs");
  await expect(page.getByText(job.title)).toBeVisible();

  await page.goto("/profile");
  await expect(
    page.getByRole("textbox", { name: "Email", exact: true }),
  ).toHaveValue(seed.users.jobseeker.email);
  await page.getByRole("button", { name: /edit profile/i }).click();
  await page.getByLabel("Preferred Location").fill("Remote E2E");
  await page.getByRole("button", { name: /save profile/i }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();

  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByText("New message")).toBeVisible();
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(page.getByText("Unread").locator("..")).toContainText("0");
});
