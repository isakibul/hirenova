const messageService = require("../../../../lib/message");

const findSingle = async (req, res, next) => {
  try {
    const conversation = await messageService.getOne({
      conversationId: req.params.id,
      userId: req.user.id,
    });

    res.status(200).json({
      data: conversation,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findSingle;
