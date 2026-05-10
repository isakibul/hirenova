const { Notification } = require("../../model");
const { notFound, authorizationError } = require("../../utils/error");

const serialize = (notification) => ({
  ...notification._doc,
  id: notification.id,
  isRead: Boolean(notification.readAt),
});

const createNotification = async ({
  recipient,
  type = "system",
  title,
  message,
  link = "",
  metadata = {},
}) => {
  if (!recipient || !title || !message) {
    return null;
  }

  const notification = new Notification({
    recipient,
    type,
    title,
    message,
    link,
    metadata,
  });

  await notification.save();
  return serialize(notification);
};

const createManyNotifications = async (notifications = []) => {
  const payload = notifications.filter(
    (notification) =>
      notification.recipient && notification.title && notification.message
  );

  if (!payload.length) {
    return [];
  }

  const created = await Notification.insertMany(payload, { ordered: false });
  return created.map(serialize);
};

const findMine = async ({ userId, limit = 20 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const notifications = await Notification.find({ recipient: userId })
    .sort("-createdAt")
    .limit(safeLimit);

  return notifications.map(serialize);
};

const unreadCount = ({ userId }) =>
  Notification.countDocuments({ recipient: userId, readAt: null });

const markAsRead = async ({ notificationId, userId }) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw notFound("Notification not found");
  }

  if (notification.recipient.toString() !== userId) {
    throw authorizationError("Operation not allowed");
  }

  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }

  return serialize(notification);
};

const markAllAsRead = async ({ userId }) => {
  const result = await Notification.updateMany(
    { recipient: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

module.exports = {
  createNotification,
  createManyNotifications,
  findMine,
  unreadCount,
  markAsRead,
  markAllAsRead,
};
