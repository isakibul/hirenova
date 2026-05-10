const notificationService = require("../../../../lib/notification");

const findMine = async (req, res, next) => {
  try {
    const notifications = await notificationService.findMine({
      userId: req.user.id,
      limit: req.query.limit,
    });
    const unreadCount = await notificationService.unreadCount({
      userId: req.user.id,
    });

    res.status(200).json({
      data: notifications,
      meta: {
        unreadCount,
      },
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findMine;
