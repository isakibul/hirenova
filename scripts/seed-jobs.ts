import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";

const projectRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(projectRoot, ".env") });

const Job = require("../src/model/Job");
const User = require("../src/model/User");
const jobTemplates = require("./data/jobs.json") as SeedJob[];

type SeedJob = {
  id: number;
  title: string;
  location: string;
  jobType: string;
  experience: { min: number; max: number };
  salary: number;
  status: string;
  approval: string;
  expiryDate: string;
  skills: string[];
  description: string;
};

const jobTypeMap: Record<string, string> = {
  "full time": "full-time",
  "part time": "part-time",
  remote: "remote",
  contract: "contract",
  // The current application has no internship job type, so internships are
  // seeded as contracts while retaining their intern-specific titles/content.
  internship: "contract",
};

function normalizeJobType(jobType: string) {
  const normalized = jobType.trim().toLowerCase();
  const value = jobTypeMap[normalized];

  if (!value) {
    throw new Error(`Unsupported job type in seed data: ${jobType}`);
  }

  return value;
}

async function seedJobs() {
  const connectionString = process.env.DATABASE_CONNECTION_URL;
  const dbName = process.env.DB_NAME;

  if (!connectionString || !dbName) {
    throw new Error("Set DATABASE_CONNECTION_URL and DB_NAME in .env before seeding jobs.");
  }

  await mongoose.connect(connectionString, { dbName });

  const author = await User.findOne({
    role: { $in: ["employer", "admin", "superadmin"] },
  }).select("_id");

  const operations = jobTemplates.map((job) => {
    const approvalStatus = job.approval.toLowerCase();
    const isApproved = approvalStatus === "approved";

    return {
      updateOne: {
        filter: {
          title: job.title,
          location: job.location,
          description: job.description,
        },
        update: {
          $set: {
            title: job.title,
            location: job.location,
            jobType: normalizeJobType(job.jobType),
            experienceMin: job.experience.min,
            experienceMax: job.experience.max,
            experienceRequired: job.experience.min,
            salary: job.salary,
            status: job.status.toLowerCase(),
            approvalStatus,
            skillsRequired: job.skills,
            description: job.description,
            expiresAt: new Date(`${job.expiryDate}T23:59:59.999Z`),
            ...(author ? { author: author._id } : {}),
            ...(isApproved
              ? {
                  reviewedAt: new Date(),
                  ...(author ? { reviewedBy: author._id } : {}),
                  approvalHistory: [
                    {
                      action: "approved",
                      note: "Seeded as approved.",
                      ...(author ? { actor: author._id } : {}),
                      actorRole: author?.role ?? "admin",
                      createdAt: new Date(),
                    },
                  ],
                }
              : {}),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    };
  });

  const result = await Job.bulkWrite(operations, { ordered: false });

  console.log(
    `Seed complete: ${jobTemplates.length} jobs processed (${result.upsertedCount} created, ${result.modifiedCount} updated).`,
  );
}

seedJobs()
  .catch((error) => {
    console.error("Job seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
