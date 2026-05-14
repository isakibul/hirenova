require("dotenv").config();

const mongoose = require("mongoose");

const { Application, Job, User } = require("../src/model");
const { generateHash } = require("../src/utils/hashing");

const dbConnectionString = process.env.DATABASE_CONNECTION_URL;
const dbName = process.env.DB_NAME;
const seedPassword = process.env.SEED_USER_PASSWORD || "HireNova123";

const users = [
  {
    username: "seed_admin",
    email: "admin@hirenova.local",
    role: "admin",
    status: "active",
  },
  {
    username: "seed_employer",
    email: "employer@hirenova.local",
    role: "employer",
    status: "active",
    companyName: "Nova Labs",
    companyWebsite: "https://hirenova.local",
    companySize: "51-200",
  },
  {
    username: "seed_jobseeker",
    email: "jobseeker@hirenova.local",
    role: "jobseeker",
    status: "active",
    skills: ["React", "Node.js", "MongoDB"],
    experience: 4,
    preferredLocation: "Remote",
  },
];

const jobs = [
  {
    title: "Senior Full Stack Engineer",
    description:
      "Build customer-facing hiring workflows across React, Node.js, and MongoDB.",
    location: "Remote",
    jobType: "remote",
    skillsRequired: ["React", "Node.js", "MongoDB"],
    experienceMin: 3,
    experienceMax: 6,
    salary: 135000,
    status: "open",
    approvalStatus: "approved",
  },
  {
    title: "Talent Operations Manager",
    description:
      "Improve candidate pipelines, employer reporting, and hiring operations.",
    location: "New York, NY",
    jobType: "full-time",
    skillsRequired: ["Recruiting", "Operations", "Analytics"],
    experienceMin: 5,
    experienceMax: 9,
    salary: 115000,
    status: "open",
    approvalStatus: "pending",
  },
];

async function upsertUser(user, password) {
  return User.findOneAndUpdate(
    { email: user.email },
    {
      $set: user,
      $setOnInsert: {
        password,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

async function run() {
  if (!dbConnectionString || !dbName) {
    throw new Error("Set DATABASE_CONNECTION_URL and DB_NAME before seeding.");
  }

  await mongoose.connect(dbConnectionString, { dbName });

  const password = await generateHash(seedPassword);
  const [admin, employer, jobseeker] = await Promise.all(
    users.map((user) => upsertUser(user, password)),
  );

  const seededJobs = [];
  for (const job of jobs) {
    const seededJob = await Job.findOneAndUpdate(
      { title: job.title, author: employer._id },
      {
        $set: {
          ...job,
          author: employer._id,
          reviewedBy: admin._id,
          reviewedAt: new Date(),
        },
        $setOnInsert: {
          approvalHistory: [
            {
              action:
                job.approvalStatus === "approved" ? "approved" : "submitted",
              note: "Created by the local seed script.",
              actor: employer._id,
              actorRole: "employer",
            },
          ],
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    seededJobs.push(seededJob);
  }

  await Application.findOneAndUpdate(
    { job: seededJobs[0]._id, applicant: jobseeker._id },
    {
      $setOnInsert: {
        job: seededJobs[0]._id,
        applicant: jobseeker._id,
        coverLetter: "Seed application for validating the review workflow.",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  console.log("Seed data ready.");
  console.log(`Password for seeded users: ${seedPassword}`);
  console.log(users.map((user) => `${user.role}: ${user.email}`).join("\n"));
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
