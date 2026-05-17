const crypto = require("crypto");

const { client: redisClient } = require("../../config/redisClient");
const { User } = require("../../model");
const { badRequest } = require("../../utils/error");
const jobService = require("../job");

const maxAiJobs = Number(process.env.JOB_RECOMMENDATION_AI_LIMIT || 5);
const maxCandidates = Number(
  process.env.JOB_RECOMMENDATION_CANDIDATE_LIMIT || 100,
);
const maxRecommendationResults = Number(
  process.env.JOB_RECOMMENDATION_MAX_RESULTS || 5,
);
const cacheTtlMs = Number(
  process.env.JOB_RECOMMENDATION_CACHE_TTL_MS || 6 * 60 * 60 * 1000,
);
const minRecommendationScore = Number(
  process.env.JOB_RECOMMENDATION_MIN_SCORE || 50,
);
const explanationCache = new Map();

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

const containsTerm = (text, term) =>
  Boolean(term) && normalize(text).includes(normalize(term));

const getJobExperienceRange = (job) => {
  const min =
    typeof job.experienceMin === "number"
      ? job.experienceMin
      : job.experienceRequired;
  const max = job.experienceMax;

  return {
    min: typeof min === "number" ? min : undefined,
    max: typeof max === "number" ? max : undefined,
  };
};

const scoreExperience = ({ userExperience, job }) => {
  if (typeof userExperience !== "number") {
    return { points: 0, label: "Experience not set", reason: "" };
  }

  const range = getJobExperienceRange(job);

  if (typeof range.min !== "number" && typeof range.max !== "number") {
    return {
      points: 8,
      label: "Flexible experience",
      reason: "The role does not set a strict experience requirement.",
    };
  }

  if (
    (typeof range.min !== "number" || userExperience >= range.min) &&
    (typeof range.max !== "number" || userExperience <= range.max)
  ) {
    return {
      points: 15,
      label: "Strong experience fit",
      reason: "Your experience fits the role's expected range.",
    };
  }

  if (typeof range.min === "number" && userExperience + 1 >= range.min) {
    return {
      points: 8,
      label: "Close experience fit",
      reason: "Your experience is close to the role's expected range.",
    };
  }

  return {
    points: 2,
    label: "Stretch experience fit",
    reason: "The experience range may be a stretch based on your profile.",
  };
};

const getMatchLabel = (score) => {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Possible match";
  return "Explore fit";
};

const buildDeterministicExplanation = ({
  matchLabel,
  matchedSkills,
  missingSkills,
  experienceFit,
  locationFit,
}) => {
  const pieces = [];

  if (matchedSkills.length) {
    pieces.push(
      `your ${matchedSkills.slice(0, 3).join(", ")} skills match the role`,
    );
  }

  if (experienceFit.reason) {
    pieces.push(experienceFit.reason.toLowerCase());
  }

  if (locationFit.reason) {
    pieces.push(locationFit.reason.toLowerCase());
  }

  if (missingSkills.length) {
    pieces.push(
      `you may want to strengthen ${missingSkills.slice(0, 2).join(", ")}`,
    );
  }

  return `${matchLabel}: ${pieces.length ? pieces.join(", ") : "this role has several signals worth reviewing"}.`;
};

const scoreJobForUser = ({ job, user, query = {} }) => {
  const userSkills = toList(user.skills);
  const jobSkills = toList(job.skillsRequired);
  const querySkills = toList(query.skills);
  const searchTerms = unique(
    toList(query.search).flatMap((term) => term.split(" ")),
  );
  const jobText = normalize(
    [
      job.title,
      job.description,
      job.location,
      job.jobType,
      ...(job.skillsRequired ?? []),
    ].join(" "),
  );

  const matchedSkills = unique(
    jobSkills.filter((skill) =>
      userSkills.some(
        (userSkill) =>
          userSkill === skill ||
          userSkill.includes(skill) ||
          skill.includes(userSkill),
      ),
    ),
  );
  const missingSkills = jobSkills.filter(
    (skill) => !matchedSkills.includes(skill),
  );
  const requestedSkillMatches = querySkills.filter((skill) =>
    jobSkills.some(
      (jobSkill) => jobSkill.includes(skill) || skill.includes(jobSkill),
    ),
  );
  const keywordMatches = searchTerms.filter((term) =>
    containsTerm(jobText, term),
  );
  const preferredLocation = normalize(user.preferredLocation);
  const hasProfileOrQuerySignal =
    userSkills.length > 0 ||
    querySkills.length > 0 ||
    searchTerms.length > 0 ||
    preferredLocation.length > 0 ||
    typeof user.experience === "number";
  const hasCoreSignal =
    matchedSkills.length > 0 ||
    requestedSkillMatches.length > 0 ||
    keywordMatches.length > 0;
  const skillPoints = jobSkills.length
    ? Math.round((matchedSkills.length / jobSkills.length) * 40)
    : userSkills.length
      ? 10
      : 0;
  const querySkillPoints = querySkills.length
    ? Math.round((requestedSkillMatches.length / querySkills.length) * 10)
    : 0;
  const keywordPoints = searchTerms.length
    ? Math.round((keywordMatches.length / searchTerms.length) * 15)
    : 8;
  const jobLocation = normalize(job.location);
  const queryLocation = normalize(query.location);
  const locationMatched =
    (preferredLocation &&
      (jobLocation.includes(preferredLocation) ||
        jobLocation.includes("remote"))) ||
    (queryLocation && jobLocation.includes(queryLocation));
  const locationFit = {
    points: locationMatched ? 15 : jobLocation.includes("remote") ? 10 : 0,
    label: locationMatched
      ? "Location match"
      : jobLocation.includes("remote")
        ? "Remote-friendly"
        : "Location review",
    reason: locationMatched
      ? "Your location preference aligns with this role."
      : jobLocation.includes("remote")
        ? "The role supports remote work."
        : "",
  };
  const experienceFit = scoreExperience({
    userExperience: user.experience,
    job,
  });
  const recencyPoints = job.createdAt
    ? Math.max(
        0,
        5 -
          Math.floor(
            (Date.now() - new Date(job.createdAt).getTime()) /
              (7 * 24 * 60 * 60 * 1000),
          ),
      )
    : 0;
  const score = Math.min(
    100,
    skillPoints +
      querySkillPoints +
      keywordPoints +
      locationFit.points +
      experienceFit.points +
      recencyPoints,
  );
  const matchLabel = getMatchLabel(score);
  const isRelevant = hasCoreSignal
    ? score >= minRecommendationScore
    : !hasProfileOrQuerySignal && score > 0;

  return {
    ...job,
    match: {
      score,
      label: matchLabel,
      isRelevant,
      matchedSkills,
      keywordMatches,
      missingSkills: missingSkills.slice(0, 5),
      experienceFit: experienceFit.label,
      locationFit: locationFit.label,
      deterministicReason: buildDeterministicExplanation({
        matchLabel,
        matchedSkills,
        missingSkills,
        experienceFit,
        locationFit,
      }),
    },
  };
};

const getCacheKey = ({ user, job, match }) =>
  crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        user: {
          skills: toList(user.skills),
          experience: user.experience,
          preferredLocation: normalize(user.preferredLocation),
        },
        job: {
          id: job.id,
          title: job.title,
          skillsRequired: toList(job.skillsRequired),
          experienceMin: job.experienceMin,
          experienceMax: job.experienceMax,
          experienceRequired: job.experienceRequired,
          location: job.location,
          updatedAt: job.updatedAt,
        },
        match: {
          score: match.score,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        },
      }),
    )
    .digest("hex");

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
    expiresAt: Date.now() + cacheTtlMs,
  });
};

const getExplanationCacheKey = (key) => `job-recommendation:explanation:${key}`;

const getCachedExplanationValue = async (key) => {
  if (redisClient.isOpen) {
    try {
      return (await redisClient.get(getExplanationCacheKey(key))) || "";
    } catch (error) {
      console.error(
        "Unable to read recommendation cache from Redis:",
        error.message,
      );
    }
  }

  return getCachedExplanation(key);
};

const setCachedExplanationValue = async (key, value) => {
  if (redisClient.isOpen) {
    try {
      await redisClient.set(getExplanationCacheKey(key), value, {
        EX: Math.max(1, Math.floor(cacheTtlMs / 1000)),
      });
      return;
    } catch (error) {
      console.error(
        "Unable to write recommendation cache to Redis:",
        error.message,
      );
    }
  }

  setCachedExplanation(key, value);
};

const buildAiMessages = ({ user, job, match }) => [
  {
    role: "system",
    content:
      "You write concise job match explanations for HireNova. Use only the provided structured facts. Be specific, honest, and avoid hype. Return one sentence under 35 words.",
  },
  {
    role: "user",
    content: JSON.stringify({
      candidate: {
        skills: toList(user.skills),
        experienceYears: user.experience,
        preferredLocation: user.preferredLocation || "",
      },
      job: {
        title: job.title,
        location: job.location || "",
        type: job.jobType || "",
        requiredSkills: toList(job.skillsRequired),
        experience: getJobExperienceRange(job),
      },
      match,
    }),
  },
];

const requestAiExplanation = async ({ user, job, match }) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return "";
  }

  const cacheKey = getCacheKey({ user, job, match });
  const cached = await getCachedExplanationValue(cacheKey);

  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.OPENROUTER_TIMEOUT_MS || 7000),
  );

  try {
    const response = await fetch(
      process.env.OPENROUTER_API_URL ||
        "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.OPENROUTER_SITE_URL ||
            process.env.CLIENT_URL ||
            "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_APP_NAME || "HireNova",
        },
        body: JSON.stringify({
          model:
            process.env.OPENROUTER_RECOMMENDATION_MODEL ||
            process.env.OPENROUTER_MODEL ||
            "openai/gpt-4o-mini",
          messages: buildAiMessages({ user, job, match }),
          temperature: 0.2,
          max_tokens: 90,
        }),
      },
    );
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return "";
    }

    const explanation = String(body?.choices?.[0]?.message?.content ?? "")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (explanation) {
      await setCachedExplanationValue(cacheKey, explanation);
    }

    return explanation;
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
};

const serializeJob = (job) => ({
  id: job.id,
  title: job.title,
  location: job.location,
  jobType: job.jobType,
  salary: job.salary,
  experienceRequired: job.experienceRequired,
  experienceMin: job.experienceMin,
  experienceMax: job.experienceMax,
  skillsRequired: job.skillsRequired,
  status: job.status,
  approvalStatus: job.approvalStatus,
  expiresAt: job.expiresAt,
  closedAt: job.closedAt,
  updatedAt: job.updatedAt,
  createdAt: job.createdAt,
  match: job.match,
  link: `./job/${job.id}`,
});

const getRecommendedJobs = async ({
  userId,
  page,
  limit,
  search,
  location,
  jobType,
  skills,
  minSalary,
  maxSalary,
  minExperience,
  maxExperience,
}) => {
  const user = await User.findById(userId).select(
    "username email role status skills experience preferredLocation",
  );

  if (!user) {
    throw badRequest("Recommendations require a logged-in account.");
  }

  const query = {
    search,
    location,
    skills,
  };

  const candidateLimit = Math.max(limit, Math.min(maxCandidates, 200));
  const [jobs, totalItems] = await Promise.all([
    jobService.findAll({
      page: 1,
      limit: candidateLimit,
      sortType: "dsc",
      sortBy: "createdAt",
      search,
      location,
      jobType,
      skills,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
      includeClosed: false,
    }),
    jobService.count({
      search,
      location,
      jobType,
      skills,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
      includeClosed: false,
    }),
  ]);
  const ranked = jobs
    .map((job) => scoreJobForUser({ job, user, query }))
    .filter((job) => job.match.isRelevant)
    .sort((first, second) => {
      if (second.match.score !== first.match.score) {
        return second.match.score - first.match.score;
      }

      return new Date(second.createdAt ?? 0) - new Date(first.createdAt ?? 0);
    })
    .slice(0, maxRecommendationResults);
  const start = (page - 1) * limit;
  const paged = ranked.slice(start, start + limit);
  const withExplanations = await Promise.all(
    paged.map(async (job, index) => {
      const aiReason =
        index < maxAiJobs
          ? await requestAiExplanation({ user, job, match: job.match })
          : "";

      return {
        ...job,
        match: {
          ...job.match,
          reason: aiReason || job.match.deterministicReason,
          source: aiReason ? "ai" : "deterministic",
        },
      };
    }),
  );

  return {
    jobs: withExplanations.map(serializeJob),
    totalItems: ranked.length,
    rankedItems: ranked.length,
    availableItems: totalItems,
    minScore: minRecommendationScore,
    maxResults: maxRecommendationResults,
  };
};

module.exports = {
  getRecommendedJobs,
  scoreJobForUser,
  getCachedExplanationValue,
  setCachedExplanationValue,
};
