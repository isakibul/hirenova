const messageService = require("../../../../lib/message");

const findMine = async (req, res, next) => {
  try {
    const conversations = await messageService.findMine({
      userId: req.user.id,
    });

    res.status(200).json({
      data: conversations,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findMine;
