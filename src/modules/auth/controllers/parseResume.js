const { readFile } = require("fs/promises");

const {
  extractResumeText,
  normalizeResumeText,
  parseResumeWithOpenRouter,
  validateResumeFile,
} = require("../../../lib/resume");
const { badRequest } = require("../../../utils/error");
const {
  assertCanAccessResume,
  getResumeFilename,
  getResumePath,
} = require("./resumeAccess");

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

  const filename = getResumeFilename(resumeUrl);

  if (!filename) {
    throw badRequest("Only uploaded resumes can be parsed.");
  }

  await assertCanAccessResume({ filename, user: req.user });

  return {
    buffer: await readFile(getResumePath(filename)),
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
