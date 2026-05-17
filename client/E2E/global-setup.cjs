const fs = require("node:fs/promises");
const path = require("node:path");

const authDir = path.join(__dirname, ".auth");
const dataPath = path.join(authDir, "e2e-data.json");
const apiURL = process.env.E2E_API_URL || "http://127.0.0.1:4100/api/v1";
const seedSecret = process.env.E2E_SEED_SECRET || "hirenova-e2e-seed-secret";

async function seedBackend() {
  const response = await fetch(`${apiURL}/e2e/seed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-e2e-seed-secret": seedSecret,
    },
    body: JSON.stringify({}),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Unable to seed E2E backend data.");
  }

  return body.data;
}

module.exports = async () => {
  const seedData = await seedBackend();

  await fs.mkdir(authDir, { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(seedData, null, 2));
};
