const { randomUUID } = require("crypto");

const { getResumeExtension, validateResumeFile } = require("../../../integrations/resume");
const { uploadResumeObject } = require("../../../integrations/objectStorage");
const { getResumeUrl, safeUserPart } = require("./resumeAccess");

const uploadResume = async (req, res, next) => {
  try {
    validateResumeFile(req.file);

    const extension = getResumeExtension(req.file.originalname);
    const filename = `${safeUserPart(req.user.id)}-${Date.now()}-${randomUUID()}${extension}`;

    await uploadResumeObject({
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      filename,
      originalName: req.file.originalname,
      userId: req.user.id,
    });

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
