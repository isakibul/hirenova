const path = require("path");

const {
  assertCanAccessResume,
  assertResumeExists,
  getResumePath,
} = require("./resumeAccess");

const downloadResume = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename || "");
    const filepath = getResumePath(filename);

    await assertCanAccessResume({ filename, user: req.user });
    await assertResumeExists(filepath);

    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
};

module.exports = downloadResume;
