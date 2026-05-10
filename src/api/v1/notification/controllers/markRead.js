const notificationService = require("../../../../lib/notification");

const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead({
      notificationId: req.params.id,
      userId: req.user.id,
    });

    res.status(200).json({
      message: "Notification marked as read",
      data: notification,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = markRead;
