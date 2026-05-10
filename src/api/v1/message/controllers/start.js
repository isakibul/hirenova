const messageService = require("../../../../lib/message");

const start = async (req, res, next) => {
  try {
    const conversation = await messageService.startConversation({
      sender: req.user,
      recipientId: req.body.recipientId,
      body: req.body.body ?? "",
    });

    res.status(201).json({
      message: "Conversation ready",
      data: conversation,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = start;
