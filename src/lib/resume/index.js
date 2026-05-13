const path = require("path");

const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");
const WordExtractor = require("word-extractor");

const { badRequest } = require("../../utils/error");

const maxResumeSize = 5 * 1024 * 1024;
const maxResumeTextLength = 18000;
const allowedResumeExtensions = new Set([".pdf", ".doc", ".docx"]);
const allowedResumeMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const getResumeExtension = (filename = "") => path.extname(filename).toLowerCase();

const validateResumeFile = (file) => {
  if (!file) {
    throw badRequest("Choose a resume file to upload.");
  }

  const extension = getResumeExtension(file.originalname);

  if (
    !allowedResumeExtensions.has(extension) ||
    !allowedResumeMimeTypes.has(file.mimetype)
  ) {
    throw badRequest("Resume must be a PDF, DOC, or DOCX file.");
  }

  if (file.size > maxResumeSize) {
    throw badRequest("Resume file must be 5 MB or smaller.");
  }
};

const extractResumeText = async (buffer, filename) => {
  const extension = getResumeExtension(filename);

  if (extension === ".pdf") {
    const parser = new PDFParse({ data: buffer });

    try {
      const parsed = await parser.getText();
      return parsed.text;
    } finally {
      await parser.destroy();
    }
  }

  if (extension === ".docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  if (extension === ".doc") {
    const extractor = new WordExtractor();
    const document = await extractor.extract(buffer);
    return document.getBody();
  }

  throw badRequest("Unsupported resume file type.");
};

const normalizeResumeText = (text) =>
  String(text ?? "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxResumeTextLength);

const normalizeParsedResume = (value = {}) => ({
  fullName: String(value.fullName ?? "").trim(),
  email: String(value.email ?? "").trim().toLowerCase(),
  phone: String(value.phone ?? "").trim(),
  location: String(value.location ?? "").trim(),
  summary: String(value.summary ?? "").trim(),
  skills: Array.isArray(value.skills)
    ? value.skills
        .map((skill) => String(skill).trim())
        .filter(Boolean)
        .slice(0, 40)
    : [],
  experienceYears:
    typeof value.experienceYears === "number" && Number.isFinite(value.experienceYears)
      ? Math.max(0, value.experienceYears)
      : null,
  workExperience: Array.isArray(value.workExperience)
    ? value.workExperience.slice(0, 12).map((item) => ({
        title: String(item?.title ?? "").trim(),
        company: String(item?.company ?? "").trim(),
        startDate: String(item?.startDate ?? "").trim(),
        endDate: String(item?.endDate ?? "").trim(),
        description: Array.isArray(item?.description)
          ? item.description
              .map((entry) => String(entry).trim())
              .filter(Boolean)
              .slice(0, 8)
          : [],
      }))
    : [],
  education: Array.isArray(value.education)
    ? value.education.slice(0, 8).map((item) => ({
        institution: String(item?.institution ?? "").trim(),
        degree: String(item?.degree ?? "").trim(),
        startDate: String(item?.startDate ?? "").trim(),
        endDate: String(item?.endDate ?? "").trim(),
      }))
    : [],
  certifications: Array.isArray(value.certifications)
    ? value.certifications
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 12)
    : [],
  links: Array.isArray(value.links)
    ? value.links
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 12)
    : [],
});

const buildPrompt = (resumeText) => [
  {
    role: "system",
    content:
      "You are a resume parser for a job platform. Return only valid JSON. Do not include markdown, explanations, or extra text.",
  },
  {
    role: "user",
    content: `Extract structured candidate data from this resume. Use this JSON shape exactly:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "skills": [],
  "experienceYears": null,
  "workExperience": [
    {
      "title": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "description": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "certifications": [],
  "links": []
}

Resume text:
${resumeText}`,
  },
];

const parseJsonContent = (content) => {
  const trimmed = String(content ?? "").trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(withoutFence);
};

const parseResumeWithOpenRouter = async (resumeText) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw badRequest("OpenRouter is not configured.");
  }

  const openRouterApiUrl =
    process.env.OPENROUTER_API_URL ||
    "https://openrouter.ai/api/v1/chat/completions";

  const response = await fetch(openRouterApiUrl, {
    method: "POST",
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
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: buildPrompt(resumeText),
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw badRequest(body?.error?.message || "Unable to parse resume with AI.");
  }

  return normalizeParsedResume(parseJsonContent(body?.choices?.[0]?.message?.content));
};

module.exports = {
  extractResumeText,
  getResumeExtension,
  maxResumeSize,
  normalizeResumeText,
  parseResumeWithOpenRouter,
  validateResumeFile,
};
