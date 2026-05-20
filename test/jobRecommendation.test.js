const assert = require("node:assert/strict");
const { test } = require("node:test");

const { User } = require("../src/model");
const jobService = require("../src/modules/jobs/jobs.service");
const {
  getRecommendedJobs,
  normalizeExplanationPerspective,
  scoreJobForUser,
} = require("../src/lib/jobRecommendation");

test("job recommendation scoring rewards skill, experience, and location fit", () => {
  const user = {
    skills: ["React", "Node.js", "MongoDB"],
    experience: 3,
    preferredLocation: "Remote",
  };
  const strongJob = {
    id: "strong",
    title: "Full Stack React Engineer",
    description: "Build React and Node.js hiring workflows.",
    location: "Remote",
    jobType: "remote",
    skillsRequired: ["React", "Node.js"],
    experienceMin: 2,
    experienceMax: 5,
    createdAt: new Date(),
  };
  const weakJob = {
    id: "weak",
    title: "Enterprise Sales Manager",
    description: "Own outbound sales pipeline.",
    location: "Onsite",
    jobType: "full-time",
    skillsRequired: ["Salesforce", "Negotiation"],
    experienceMin: 7,
    experienceMax: 10,
    createdAt: new Date(),
  };

  const strongScore = scoreJobForUser({
    job: strongJob,
    user,
    query: { search: "React", skills: "React" },
  });
  const weakScore = scoreJobForUser({
    job: weakJob,
    user,
    query: { search: "React", skills: "React" },
  });

  assert.equal(strongScore.match.label, "Strong match");
  assert.equal(strongScore.match.isRelevant, true);
  assert.deepEqual(strongScore.match.matchedSkills, ["react", "node.js"]);
  assert.ok(strongScore.match.score > weakScore.match.score);
  assert.equal(weakScore.match.isRelevant, false);
  assert.match(strongScore.match.deterministicReason, /react/i);
});

test("job recommendations are available to employer and admin roles", async (t) => {
  const roles = ["employer", "admin", "superadmin"];
  const jobs = [
    {
      id: "role-1",
      title: "Hiring Operations Lead",
      description: "Manage hiring operations and candidate workflows.",
      location: "Remote",
      jobType: "remote",
      skillsRequired: ["Hiring", "Operations"],
      experienceMin: 1,
      experienceMax: 5,
      createdAt: new Date(),
    },
  ];

  t.mock.method(User, "findById", (userId) => ({
    select: async () => ({
      id: userId,
      role: roles[Number(userId.replace("user-", ""))],
      skills: ["Hiring", "Operations"],
      experience: 3,
      preferredLocation: "Remote",
    }),
  }));
  t.mock.method(jobService, "findAll", async () => jobs);
  t.mock.method(jobService, "count", async () => jobs.length);

  for (const [index, role] of roles.entries()) {
    const result = await getRecommendedJobs({
      userId: `user-${index}`,
      page: 1,
      limit: 10,
      search: "Hiring",
      location: "",
      jobType: "",
      skills: "",
    });

    assert.equal(result.jobs.length, 1);
    assert.equal(result.jobs[0].match.isRelevant, true);
    assert.equal(result.availableItems, 1);
    assert.equal(role, roles[index]);
  }
});

test("AI job recommendation explanations address the user directly", () => {
  const explanation = normalizeExplanationPerspective(
    "The candidate has strong Node.js skills, but their preferred location may not align with the role.",
  );

  assert.equal(
    explanation,
    "You have strong Node.js skills, but your preferred location may not align with the role.",
  );
});
