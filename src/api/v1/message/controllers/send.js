const messageService = require("../../../../lib/message");

const send = async (req, res, next) => {
  try {
    const conversation = await messageService.sendMessage({
      conversationId: req.params.id,
      sender: req.user,
      body: req.body.body ?? "",
    });

    res.status(201).json({
      message: "Message sent",
      data: conversation,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = send;
