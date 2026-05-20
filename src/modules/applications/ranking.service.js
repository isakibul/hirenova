const crypto = require("crypto");

const { Application, Job } = require("../../infrastructure/database/models");
const openRouter = require("../../integrations/openrouter");
const { authorizationError, badRequest, notFound } = require("../../utils/error");

const maxAiExplanations = Number(process.env.APPLICATION_RANKING_AI_LIMIT || 5);

const isAdminRole = (role) => role === "admin" || role === "superadmin";

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalize).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map(normalize)
    .filter(Boolean);
};

const unique = (items = []) => Array.from(new Set(items.filter(Boolean)));

const getJobExperienceRange = (job) => {
  const min =
    typeof job.experienceMin === "number"
      ? job.experienceMin
      : job.experienceRequired;

  return {
    min: typeof min === "number" ? min : undefined,
    max: typeof job.experienceMax === "number" ? job.experienceMax : undefined,
  };
};

const getCandidateName = (applicant = {}) =>
  applicant.username || applicant.email || "This candidate";

const getRankingLabel = (score) => {
  if (score >= 80) return "Strong fit";
  if (score >= 60) return "Good fit";
  if (score >= 40) return "Possible fit";
  return "Review manually";
};

const scoreExperience = ({ applicant, job }) => {
  if (typeof applicant.experience !== "number") {
    return {
      points: 0,
      label: "Experience not set",
      reason: "experience is not set on the profile",
    };
  }

  const range = getJobExperienceRange(job);

  if (typeof range.min !== "number" && typeof range.max !== "number") {
    return {
      points: 12,
      label: "Flexible experience",
      reason: "the role does not set a strict experience range",
    };
  }

  if (
    (typeof range.min !== "number" || applicant.experience >= range.min) &&
    (typeof range.max !== "number" || applicant.experience <= range.max)
  ) {
    return {
      points: 20,
      label: "Experience fit",
      reason: "experience fits the role range",
    };
  }

  if (typeof range.min === "number" && applicant.experience + 1 >= range.min) {
    return {
      points: 10,
      label: "Close experience fit",
      reason: "experience is close to the expected range",
    };
  }

  return {
    points: 4,
    label: "Experience gap",
    reason: "experience may need manual review",
  };
};

const buildDeterministicReason = ({
  applicant,
  matchedSkills,
  missingSkills,
  experienceFit,
  locationFit,
  score,
}) => {
  const name = getCandidateName(applicant);
  const signals = [];

  if (matchedSkills.length) {
    signals.push(`matches ${matchedSkills.slice(0, 3).join(", ")}`);
  }

  if (experienceFit.reason) {
    signals.push(experienceFit.reason);
  }

  if (locationFit.reason) {
    signals.push(locationFit.reason);
  }

  if (missingSkills.length) {
    signals.push(`missing ${missingSkills.slice(0, 2).join(", ")}`);
  }

  return `${name} scored ${score}/100 because ${signals.length ? signals.join(", ") : "the profile has limited match signals"}.`;
};

const scoreApplicationForJob = ({ application, job }) => {
  const applicant = application.applicant ?? {};
  const applicantSkills = toList(applicant.skills);
  const jobSkills = toList(job.skillsRequired);
  const coverLetter = normalize(application.coverLetter);
  const titleTerms = unique(toList(job.title).flatMap((term) => term.split(" ")))
    .filter((term) => term.length > 2)
    .slice(0, 8);
  const matchedSkills = unique(
    jobSkills.filter((skill) =>
      applicantSkills.some(
        (candidateSkill) =>
          candidateSkill === skill ||
          candidateSkill.includes(skill) ||
          skill.includes(candidateSkill),
      ),
    ),
  );
  const missingSkills = jobSkills.filter((skill) => !matchedSkills.includes(skill));
  const skillPoints = jobSkills.length
    ? Math.round((matchedSkills.length / jobSkills.length) * 45)
    : applicantSkills.length
      ? 15
      : 0;
  const experienceFit = scoreExperience({ applicant, job });
  const applicantLocation = normalize(applicant.preferredLocation);
  const jobLocation = normalize(job.location);
  const locationMatched =
    applicantLocation &&
    (jobLocation.includes(applicantLocation) || jobLocation.includes("remote"));
  const locationFit = {
    points: locationMatched ? 10 : jobLocation.includes("remote") ? 6 : 0,
    label: locationMatched
      ? "Location fit"
      : jobLocation.includes("remote")
        ? "Remote-friendly"
        : "Location review",
    reason: locationMatched
      ? "location preference aligns"
      : jobLocation.includes("remote")
        ? "role supports remote work"
        : "",
  };
  const coverLetterMatches = unique(
    [...jobSkills, ...titleTerms].filter((term) => coverLetter.includes(term)),
  );
  const coverLetterPoints = coverLetter
    ? Math.min(15, coverLetterMatches.length * 3 + 3)
    : 0;
  const profileCompletenessPoints = Math.min(
    10,
    [
      applicant.email,
      applicant.resumeUrl,
      applicant.preferredLocation,
      typeof applicant.experience === "number" ? "experience" : "",
      applicantSkills.length ? "skills" : "",
    ].filter(Boolean).length * 2,
  );
  const score = Math.min(
    100,
    skillPoints +
      experienceFit.points +
      locationFit.points +
      coverLetterPoints +
      profileCompletenessPoints,
  );

  return {
    score,
    label: getRankingLabel(score),
    matchedSkills,
    missingSkills: missingSkills.slice(0, 6),
    coverLetterSignals: coverLetterMatches.slice(0, 6),
    experienceFit: experienceFit.label,
    locationFit: locationFit.label,
    deterministicReason: buildDeterministicReason({
      applicant,
      matchedSkills,
      missingSkills,
      experienceFit,
      locationFit,
      score,
    }),
  };
};

const getExplanationCacheKey = ({ application, job, ranking }) =>
  crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        version: "application-ranking-v1",
        applicationId: application.id,
        applicationUpdatedAt: application.updatedAt,
        jobId: job.id,
        jobUpdatedAt: job.updatedAt,
        ranking,
      }),
    )
    .digest("hex");

const explanationCache = new Map();

const getCachedExplanation = (key) => {
  const cached = explanationCache.get(key);

  if (!cached || cached.expiresAt <= Date.now()) {
    explanationCache.delete(key);
    return "";
  }

  return cached.value;
};

const setCachedExplanation = (key, value) => {
  explanationCache.set(key, {
    value,
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
  });
};

const buildAiMessages = ({ application, job, ranking }) => ({
  model:
    process.env.OPENROUTER_APPLICATION_RANKING_MODEL ||
    process.env.OPENROUTER_RECOMMENDATION_MODEL ||
    process.env.OPENROUTER_MODEL ||
    "openai/gpt-4o-mini",
  messages: [
    {
      role: "system",
      content:
        "You help hiring teams rank job applicants. Use only the supplied facts. Return one concise sentence under 35 words. Do not invent skills, credentials, or experience.",
    },
    {
      role: "user",
      content: JSON.stringify({
        job: {
          title: job.title,
          location: job.location || "",
          type: job.jobType || "",
          requiredSkills: toList(job.skillsRequired),
          experience: getJobExperienceRange(job),
        },
        candidate: {
          name: getCandidateName(application.applicant),
          skills: toList(application.applicant?.skills),
          experienceYears: application.applicant?.experience,
          preferredLocation: application.applicant?.preferredLocation || "",
          hasResume: Boolean(application.applicant?.resumeUrl),
          coverLetter: application.coverLetter || "",
        },
        ranking,
      }),
    },
  ],
  temperature: 0.2,
  max_tokens: 90,
});

const requestAiReason = async ({ application, job, ranking }) => {
  if (
    process.env.NODE_ENV === "test" &&
    process.env.APPLICATION_RANKING_ENABLE_AI_IN_TEST !== "true"
  ) {
    return "";
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return "";
  }

  const cacheKey = getExplanationCacheKey({ application, job, ranking });
  const cached = getCachedExplanation(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await openRouter.createChatCompletion(
      buildAiMessages({ application, job, ranking }),
      { timeoutMs: process.env.OPENROUTER_TIMEOUT_MS || 7000 },
    );

    if (!response.ok) {
      return "";
    }

    const reason = String(response.body?.choices?.[0]?.message?.content ?? "")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (reason) {
      setCachedExplanation(cacheKey, reason);
    }

    return reason;
  } catch {
    return "";
  }
};

const serializeApplication = (application) => ({
  ...application._doc,
  id: application.id,
});

const rankApplicationsForJob = async ({ jobId, user }) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw notFound("Job not found");
  }

  if (!isAdminRole(user.role) && job.author?.toString() !== user.id) {
    throw authorizationError("Operation not allowed");
  }

  const applications = await Application.find({ job: jobId })
    .populate("job", "title location jobType salary author createdAt updatedAt")
    .populate(
      "applicant",
      "username email role status skills resumeUrl experience preferredLocation createdAt",
    );

  if (!applications.length) {
    return [];
  }

  const ranked = applications
    .map((application) => {
      const ranking = scoreApplicationForJob({ application, job });

      return {
        application,
        ranking,
      };
    })
    .sort((first, second) => {
      if (second.ranking.score !== first.ranking.score) {
        return second.ranking.score - first.ranking.score;
      }

      return (
        new Date(first.application.createdAt ?? 0) -
        new Date(second.application.createdAt ?? 0)
      );
    });

  return Promise.all(
    ranked.map(async ({ application, ranking }, index) => {
      const aiReason =
        index < maxAiExplanations
          ? await requestAiReason({ application, job, ranking })
          : "";

      return {
        ...serializeApplication(application),
        aiRanking: {
          ...ranking,
          reason: aiReason || ranking.deterministicReason,
          source: aiReason ? "ai" : "deterministic",
          rank: index + 1,
        },
      };
    }),
  );
};

module.exports = {
  rankApplicationsForJob,
  scoreApplicationForJob,
};
