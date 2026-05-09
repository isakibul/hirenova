const savedJobService = require("../../../../lib/savedJob");

const remove = async (req, res, next) => {
  try {
    await savedJobService.removeSavedJob({
      jobId: req.params.id,
      userId: req.user.id,
    });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

module.exports = remove;
