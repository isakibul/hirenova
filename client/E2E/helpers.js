const fs = require("node:fs");
const path = require("node:path");
const { expect } = require("@playwright/test");

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
  const setCookie = response.headers()["set-cookie"] ?? "";
  return {
    setCookie,
    user: seed.users[role],
  };
}

async function addAuthCookie(page, setCookie) {
  const [cookiePair] = setCookie.split(";");
  const separatorIndex = cookiePair.indexOf("=");

  if (separatorIndex === -1) {
    return;
  }

  await page.context().addCookies([
    {
      name: cookiePair.slice(0, separatorIndex),
      value: cookiePair.slice(separatorIndex + 1),
      url: apiURL.replace(/\/api\/v1\/?$/, ""),
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function loginAs(page, request, role) {
  const auth = await apiLogin(request, role);
  await addAuthCookie(page, auth.setCookie);
  return auth;
}

async function createApprovedJob(request, setCookie, title) {
  const cookie = setCookie.split(";")[0];
  const response = await request.post(`${apiURL}/jobs`, {
    headers: {
      Cookie: cookie,
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
  addAuthCookie,
  apiLogin,
  apiURL,
  createApprovedJob,
  getSeedData,
  loginAs,
  selectOptionByText,
};
