const notificationService = require("../../../../lib/notification");

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead({
      userId: req.user.id,
    });

    res.status(200).json({
      message: "Notifications marked as read",
      data: result,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = markAllRead;
