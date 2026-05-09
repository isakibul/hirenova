require("dotenv").config();

const mongoose = require("mongoose");
const { Job, User } = require("../src/model");
const { generateHash } = require("../src/utils/hashing");

const jobTypes = ["full-time", "part-time", "remote", "contract"];
const titles = [
  "Senior Frontend Engineer",
  "Backend API Developer",
  "Full Stack Product Engineer",
  "React Native Developer",
  "DevOps Platform Engineer",
  "Product Designer",
  "Data Analyst",
  "Machine Learning Engineer",
  "QA Automation Engineer",
  "Technical Project Manager",
  "Customer Success Specialist",
  "Security Engineer",
];
const locations = [
  "Dhaka",
  "Remote",
  "Chattogram",
  "Sylhet",
  "New York",
  "Austin",
  "San Francisco",
  "London",
  "Berlin",
  "Singapore",
];
const skillPool = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "CI/CD",
  "Figma",
  "Tailwind CSS",
  "Python",
  "GraphQL",
  "Jest",
  "Playwright",
];

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));

  if (!arg) {
    return fallback;
  }

  return arg.slice(prefix.length);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSkills() {
  const count = getRandomInt(3, 6);
  const shuffled = [...skillPool].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

async function getSeedAuthor() {
  const email = "seed-employer@hirenova.local";
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return existingUser;
  }

  return User.create({
    username: "seedemployer",
    email,
    password: await generateHash("SeedPass123"),
    role: "employer",
    status: "active",
  });
}

function buildJob(authorId, index) {
  const experienceMin = getRandomInt(0, 8);
  const experienceMax = experienceMin + getRandomInt(1, 5);
  const title = `${pick(titles)} ${index + 1}`;
  const skillsRequired = getSkills();

  return {
    title,
    description: [
      `We are looking for a ${title} to join a fast-moving HireNova partner team.`,
      "You will collaborate with product, design, and engineering teams to ship reliable features.",
      `Ideal candidates are comfortable with ${skillsRequired.slice(0, 3).join(", ")} and clear communication.`,
    ].join("\n\n"),
    location: pick(locations),
    jobType: pick(jobTypes),
    skillsRequired,
    experienceRequired: experienceMin,
    experienceMin,
    experienceMax,
    salary: getRandomInt(45, 180) * 1000,
    author: authorId,
    createdAt: new Date(Date.now() - getRandomInt(0, 45) * 24 * 60 * 60 * 1000),
  };
}

async function main() {
  const count = Number(getArg("count", "50"));
  const shouldClear = process.argv.includes("--clear");
  const dbConnectionString = process.env.DATABASE_CONNECTION_URL;
  const dbName = process.env.DB_NAME;

  if (!dbConnectionString || !dbName) {
    throw new Error("Missing DATABASE_CONNECTION_URL or DB_NAME in .env");
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new Error("Seed count must be a positive integer");
  }

  await mongoose.connect(dbConnectionString, { dbName });

  if (shouldClear) {
    await Job.deleteMany({});
  }

  const author = await getSeedAuthor();
  const jobs = Array.from({ length: count }, (_item, index) =>
    buildJob(author._id, index),
  );

  await Job.insertMany(jobs);

  console.log(
    `Seeded ${jobs.length} jobs${shouldClear ? " after clearing existing jobs" : ""}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
