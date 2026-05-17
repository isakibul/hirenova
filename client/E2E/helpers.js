const fs = require("node:fs");
const path = require("node:path");
const { expect } = require("@playwright/test");

const storageKey = "hirenova-auth";
const dataPath = path.join(__dirname, ".auth", "e2e-data.json");
const apiURL = process.env.E2E_API_URL || "http://127.0.0.1:4100/api/v1";

function getSeedData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

async function apiLogin(request, role) {
  const seed = getSeedData();
  const response = await request.post(`${apiURL}/auth/login`, {
    data: {
      email: seed.users[role].email,
      password: seed.password,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return {
    accessToken: body.data.accessToken,
    user: seed.users[role],
  };
}

async function loginAs(page, request, role) {
  const auth = await apiLogin(request, role);
  await page
    .evaluate(
      ({ key, value }) => {
        window.localStorage.setItem(key, JSON.stringify(value));
      },
      {
        key: storageKey,
        value: auth,
      },
    )
    .catch(() => undefined);
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: storageKey,
      value: auth,
    },
  );
  return auth;
}

async function createApprovedJob(request, accessToken, title) {
  const response = await request.post(`${apiURL}/jobs`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      title,
      description:
        "A browser-created E2E listing used to verify applications and job search.",
      location: "Remote",
      jobType: "remote",
      skillsRequired: ["Playwright", "React"],
      experienceMin: 1,
      experienceMax: 4,
      salary: 99000,
      status: "open",
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body.data;
}

async function selectOptionByText(page, buttonName, optionName) {
  await page.getByRole("button", { name: buttonName }).click();
  await page.getByRole("option", { name: optionName }).click();
}

module.exports = {
  apiLogin,
  apiURL,
  createApprovedJob,
  getSeedData,
  loginAs,
  selectOptionByText,
};
