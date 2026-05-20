const fs = require("node:fs");
const path = require("node:path");
const { expect, request: playwrightRequest } = require("@playwright/test");

const dataPath = path.join(__dirname, ".auth", "e2e-data.json");
const apiURL = process.env.E2E_API_URL || "http://127.0.0.1:4100/api/v1";
const frontendURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3100";

function getSeedData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

async function apiLogin(_request, role) {
  const seed = getSeedData();
  const context = await playwrightRequest.newContext();
  let body = {};

  try {
    const response = await context.post(`${apiURL}/auth/login`, {
      data: {
        email: seed.users[role].email,
        password: seed.password,
      },
    });
    body = await response.json().catch(() => ({}));

    expect(response.ok(), body.message || JSON.stringify(body)).toBeTruthy();
    return {
      setCookie: response.headers()["set-cookie"] ?? "",
      user: seed.users[role],
    };
  } finally {
    await context.dispose();
  }
}

async function resetSeedData(_request) {
  const seedSecret = process.env.E2E_SEED_SECRET || "hirenova-e2e-seed-secret";
  const context = await playwrightRequest.newContext();
  let body = {};

  try {
    const response = await context.post(`${apiURL}/e2e/seed`, {
      headers: {
        "x-e2e-seed-secret": seedSecret,
      },
      data: {},
    });
    body = await response.json().catch(() => ({}));

    expect(response.ok(), body.message || JSON.stringify(body)).toBeTruthy();
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(body.data, null, 2));
  } finally {
    await context.dispose();
  }

  return body.data;
}

async function apiCsrf(request, setCookie) {
  const authCookie = setCookie.split(";")[0];
  const response = await request.get(`${apiURL}/auth/csrf`, {
    headers: {
      Cookie: authCookie,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const csrfCookie = (response.headers()["set-cookie"] ?? "").split(";")[0];

  return {
    csrfToken: body.data.csrfToken,
    cookie: [authCookie, csrfCookie].filter(Boolean).join("; "),
  };
}

async function addAuthCookie(page, setCookie) {
  const [cookiePair] = setCookie.split(";");
  const separatorIndex = cookiePair.indexOf("=");

  if (separatorIndex === -1) {
    return;
  }

  await page.context().clearCookies();

  const cookie = {
    name: cookiePair.slice(0, separatorIndex),
    value: cookiePair.slice(separatorIndex + 1),
    httpOnly: true,
    sameSite: "Lax",
  };

  await page.context().addCookies([
    {
      ...cookie,
      url: frontendURL,
    },
    {
      ...cookie,
      url: apiURL.replace(/\/api\/v1\/?$/, ""),
    },
  ]);
}

async function loginAs(page, request, role) {
  await page.goto("about:blank");
  const auth = await apiLogin(request, role);
  await addAuthCookie(page, auth.setCookie);
  return auth;
}

async function createApprovedJob(request, setCookie, title) {
  const csrf = await apiCsrf(request, setCookie);
  const response = await request.post(`${apiURL}/jobs`, {
    headers: {
      Cookie: csrf.cookie,
      "X-CSRF-Token": csrf.csrfToken,
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
  apiCsrf,
  apiLogin,
  apiURL,
  createApprovedJob,
  getSeedData,
  loginAs,
  resetSeedData,
  selectOptionByText,
};
