const jobService = require("../jobs.service");

const deleteItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    await jobService.deleteItem(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

module.exports = deleteItem;
