const { mkdir, writeFile } = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const { getResumeExtension, validateResumeFile } = require("../../../../lib/resume");

const uploadRoot = path.join(process.cwd(), "uploads", "resumes");

const uploadResume = async (req, res, next) => {
  try {
    validateResumeFile(req.file);

    await mkdir(uploadRoot, { recursive: true });

    const extension = getResumeExtension(req.file.originalname);
    const safeUserPart = String(req.user.id).replace(/[^a-zA-Z0-9_-]/g, "-");
    const filename = `${safeUserPart}-${Date.now()}-${randomUUID()}${extension}`;
    const destination = path.join(uploadRoot, filename);

    await writeFile(destination, req.file.buffer);

    const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/resumes/${filename}`;

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
