const jobService = require("../lib/job");
const { authorizationError } = require("../utils/error");

const ownership =
  (model = "") =>
  async (req, res, next) => {
    if (model === "Job") {
      const isOwner = await jobService.checkOwnership({
        resourceId: req.params.id,
        userId: req.user.id,
      });

      if (isOwner) {
        return next();
      }

      return next(authorizationError("Operation not allowed"));
    }
  };

module.exports = ownership;
