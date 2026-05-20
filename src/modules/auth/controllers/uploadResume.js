const { mkdir, writeFile } = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const { getResumeExtension, validateResumeFile } = require("../../../lib/resume");
const { getResumeUrl, safeUserPart, uploadRoot } = require("./resumeAccess");

const uploadResume = async (req, res, next) => {
  try {
    validateResumeFile(req.file);

    await mkdir(uploadRoot, { recursive: true });

    const extension = getResumeExtension(req.file.originalname);
    const filename = `${safeUserPart(req.user.id)}-${Date.now()}-${randomUUID()}${extension}`;
    const destination = path.join(uploadRoot, filename);

    await writeFile(destination, req.file.buffer);

    const resumeUrl = getResumeUrl(req, filename);

    res.status(201).json({
      message: "Resume uploaded successfully.",
      data: {
        resumeUrl,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = uploadResume;
