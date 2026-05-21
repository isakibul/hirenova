const router = require("express").Router();

const {
  Application,
  AuditLog,
  Conversation,
  EmailEvent,
  Job,
  NewsletterCampaign,
  NewsletterSubscription,
  Notification,
  SavedJob,
  User,
} = require("../../model");
const { generateHash } = require("../../utils/hashing");

const password = "Password123!";
const seededAt = new Date("2026-05-20T00:00:00.000Z");

const users = {
  jobseeker: {
    username: "e2ejobseeker",
    email: "e2e.jobseeker@hirenova.test",
    role: "jobseeker",
    skills: ["React", "Node.js", "Testing"],
    experience: 3,
    preferredLocation: "Remote",
    resumeUrl: "https://example.test/e2e-resume.pdf",
  },
  employer: {
    username: "e2eemployer",
    email: "e2e.employer@hirenova.test",
    role: "employer",
    companyName: "E2E Labs",
    companyWebsite: "https://example.test",
    companySize: "11-50",
  },
  admin: {
    username: "e2eadmin",
    email: "e2e.admin@hirenova.test",
    role: "admin",
  },
};

async function resetData() {
  await Promise.all([
    Application.deleteMany({}),
    AuditLog.deleteMany({}),
    Conversation.deleteMany({}),
    EmailEvent.deleteMany({}),
    Job.deleteMany({}),
    NewsletterCampaign.deleteMany({}),
    NewsletterSubscription.deleteMany({}),
    Notification.deleteMany({}),
    SavedJob.deleteMany({}),
    User.deleteMany({
      email: /@hirenova\.test$/,
    }),
  ]);
}

async function createUser(user, hashedPassword) {
  return User.create({
    ...user,
    password: hashedPassword,
    status: "active",
  });
}

router.post("/seed", async (req, res, next) => {
  try {
    const seedSecret = process.env.E2E_SEED_SECRET;

    if (seedSecret && req.get("x-e2e-seed-secret") !== seedSecret) {
      res.status(403).json({ message: "Invalid E2E seed secret." });
      return;
    }

    await resetData();

    const hashedPassword = await generateHash(password);
    const jobseeker = await createUser(users.jobseeker, hashedPassword);
    const employer = await createUser(users.employer, hashedPassword);
    const admin = await createUser(users.admin, hashedPassword);

    const approvedJob = await Job.create({
      title: "Senior Frontend Engineer E2E",
      description:
        "Build polished hiring workflows with React, Node.js, testing, and realtime collaboration.",
      location: "Remote",
      jobType: "remote",
      skillsRequired: ["React", "Node.js", "Testing"],
      experienceRequired: 3,
      experienceMin: 2,
      experienceMax: 5,
      salary: 125000,
      status: "open",
      approvalStatus: "approved",
      createdAt: seededAt,
      reviewedAt: seededAt,
      reviewedBy: admin._id,
      author: employer._id,
      approvalHistory: [
        {
          action: "approved",
          note: "Seeded approved role.",
          actor: admin._id,
          actorRole: "admin",
          createdAt: seededAt,
        },
      ],
    });

    const pendingJob = await Job.create({
      title: "Product Designer E2E Review",
      description: "Create thoughtful hiring product experiences.",
      location: "Dhaka",
      jobType: "full-time",
      skillsRequired: ["Figma", "Research"],
      experienceRequired: 2,
      experienceMin: 1,
      experienceMax: 4,
      salary: 80000,
      status: "open",
      approvalStatus: "pending",
      createdAt: seededAt,
      author: employer._id,
      approvalHistory: [
        {
          action: "submitted",
          note: "Seeded pending role.",
          actor: employer._id,
          actorRole: "employer",
          createdAt: seededAt,
        },
      ],
    });

    await Application.create({
      job: approvedJob._id,
      applicant: jobseeker._id,
      coverLetter: "Seeded application for E2E coverage.",
    });

    await SavedJob.create({
      job: approvedJob._id,
      user: jobseeker._id,
    });

    const conversation = await Conversation.create({
      participants: [employer._id, jobseeker._id],
      jobseeker: jobseeker._id,
      startedBy: employer._id,
      messages: [
        {
          sender: employer._id,
          body: "Hi, your profile looks like a strong match for the E2E role.",
        },
      ],
      lastMessage: "Hi, your profile looks like a strong match for the E2E role.",
      lastMessageAt: seededAt,
      unreadBy: [jobseeker._id],
    });

    await Notification.create({
      recipient: jobseeker._id,
      type: "message",
      title: "New message",
      message: "e2e_employer sent you a message.",
      link: `/messages?conversation=${conversation.id}`,
      metadata: { conversation: conversation.id },
    });

    await Notification.create({
      recipient: employer._id,
      type: "application_submitted",
      title: "Application received",
      message: `${jobseeker.username} applied to ${approvedJob.title}.`,
      link: `/jobs/${approvedJob.id}/applications`,
      metadata: { job: approvedJob.id, applicant: jobseeker.id },
    });

    res.status(200).json({
      data: {
        password,
        users: {
          jobseeker: {
            id: jobseeker.id,
            email: jobseeker.email,
            username: jobseeker.username,
            role: jobseeker.role,
          },
          employer: {
            id: employer.id,
            email: employer.email,
            username: employer.username,
            role: employer.role,
          },
          admin: {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            role: admin.role,
          },
        },
        jobs: {
          approved: { id: approvedJob.id, title: approvedJob.title },
          pending: { id: pendingJob.id, title: pendingJob.title },
        },
        conversation: { id: conversation.id },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
