const { expect, test } = require("@playwright/test");

const { getSeedData, loginAs } = require("./helpers");

test("messaging inbox loads seeded conversation and sends a reply", async ({
  page,
  request,
}) => {
  const seed = getSeedData();

  await loginAs(page, request, "jobseeker");
  await page.goto(`/messages?conversation=${seed.conversation.id}`);
  await expect(page.getByText("Conversations")).toBeVisible();
  await expect(page.getByText("strong match for the E2E role").last()).toBeVisible();

  const reply = `Thanks, I am interested ${Date.now()}`;
  await page.getByPlaceholder("Write a message").fill(reply);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(reply)).toBeVisible();

  await loginAs(page, request, "employer");
  await page.goto(`/messages?conversation=${seed.conversation.id}`);
  await expect(page.getByText(reply).last()).toBeVisible();
});
