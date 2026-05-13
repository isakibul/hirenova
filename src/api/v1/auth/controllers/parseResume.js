const { readFile } = require("fs/promises");
const path = require("path");

const {
  extractResumeText,
  normalizeResumeText,
  parseResumeWithOpenRouter,
  validateResumeFile,
} = require("../../../../lib/resume");
const { badRequest } = require("../../../../utils/error");

const uploadRoot = path.join(process.cwd(), "uploads", "resumes");

const getResumeFromRequest = async (req) => {
  if (req.file) {
    validateResumeFile(req.file);

    return {
      buffer: req.file.buffer,
      filename: req.file.originalname,
    };
  }

  const resumeUrl = String(req.body?.resumeUrl ?? "").trim();

  if (!resumeUrl) {
    throw badRequest("Upload or save a resume before parsing.");
  }

  const parsedUrl = new URL(resumeUrl);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  if (!pathname.startsWith("/uploads/resumes/")) {
    throw badRequest("Only uploaded resumes can be parsed.");
  }

  const filename = path.basename(pathname);
  const filepath = path.resolve(uploadRoot, filename);

  if (!filepath.startsWith(uploadRoot)) {
    throw badRequest("Invalid resume path.");
  }

  return {
    buffer: await readFile(filepath),
    filename,
  };
};

const parseResume = async (req, res, next) => {
  try {
    const resume = await getResumeFromRequest(req);
    const resumeText = normalizeResumeText(
      await extractResumeText(resume.buffer, resume.filename)
    );

    if (resumeText.length < 80) {
      throw badRequest("Unable to read enough text from this resume.");
    }

    const parsedResume = await parseResumeWithOpenRouter(resumeText);

    res.status(200).json({
      message: "Resume parsed successfully.",
      data: parsedResume,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = parseResume;
