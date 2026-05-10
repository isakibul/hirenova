const messageService = require("../../../../lib/message");

const deleteForMe = async (req, res, next) => {
  try {
    const conversation = await messageService.deleteForMe({
      conversationId: req.params.id,
      userId: req.user.id,
    });

    res.status(200).json({
      message: "Conversation deleted",
      data: conversation,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = deleteForMe;
