const path = require("path");

const {
  assertResumeObjectExists,
  getResumeObject,
} = require("../../../integrations/objectStorage");
const {
  assertCanAccessResume,
} = require("./resumeAccess");

const getDownloadFilename = (filename) => filename.replace(/[^a-zA-Z0-9._-]/g, "_");

const downloadResume = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename || "");

    await assertCanAccessResume({ filename, user: req.user });
    await assertResumeObjectExists(filename);

    const object = await getResumeObject(filename);

    res.setHeader("Content-Type", object.ContentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${getDownloadFilename(filename)}"`);
    res.setHeader("Cache-Control", "private, max-age=300");

    object.Body.on("error", next);
    object.Body.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = downloadResume;
