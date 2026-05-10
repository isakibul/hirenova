const { Conversation, User } = require("../../model");
const { authorizationError, badRequest, notFound } = require("../../utils/error");
const notificationService = require("../notification");

const managerRoles = ["employer", "admin", "superadmin"];

const participantFields =
  "username email role status skills experience preferredLocation resumeUrl lastSeenAt";

const populateConversation = (query) =>
  query
    .populate("participants", participantFields)
    .populate("jobseeker", participantFields)
    .populate("startedBy", "username email role");

const isParticipant = (conversation, userId) =>
  conversation.participants.some(
    (participant) => participant._id.toString() === userId
  );

const serializeUser = (user) =>
  user
    ? {
        ...user._doc,
        id: user.id,
      }
    : null;

const serializeMessage = (message) => ({
  ...message._doc,
  id: message.id,
});

const serializeConversation = (conversation, userId) => ({
  ...conversation._doc,
  id: conversation.id,
  participants: conversation.participants.map(serializeUser),
  jobseeker: serializeUser(conversation.jobseeker),
  startedBy: serializeUser(conversation.startedBy),
  messages: (conversation.messages ?? []).map(serializeMessage),
  isUnread: conversation.unreadBy.some(
    (participant) => participant.toString() === userId
  ),
});

const findMine = async ({ userId }) => {
  const conversations = await populateConversation(
    Conversation.find({ participants: userId }).sort("-lastMessageAt")
  );

  return conversations.map((conversation) =>
    serializeConversation(conversation, userId)
  );
};

const getOne = async ({ conversationId, userId }) => {
  const conversation = await populateConversation(
    Conversation.findById(conversationId)
  );

  if (!conversation) {
    throw notFound("Conversation not found");
  }

  if (!isParticipant(conversation, userId)) {
    throw authorizationError("Operation not allowed");
  }

  conversation.unreadBy = conversation.unreadBy.filter(
    (participant) => participant.toString() !== userId
  );
  await conversation.save();

  const populated = await populateConversation(
    Conversation.findById(conversation.id)
  );
  return serializeConversation(populated, userId);
};

const startConversation = async ({ sender, recipientId, body = "" }) => {
  if (!managerRoles.includes(sender.role)) {
    throw authorizationError("Only employers and admins can start conversations");
  }

  const recipient = await User.findById(recipientId);

  if (!recipient || recipient.role !== "jobseeker") {
    throw badRequest("Choose a valid jobseeker to message");
  }

  const existing = await Conversation.findOne({
    participants: { $all: [sender.id, recipientId] },
  });

  if (existing) {
    if (body.trim()) {
      return sendMessage({
        conversationId: existing.id,
        sender,
        body,
      });
    }

    return getOne({ conversationId: existing.id, userId: sender.id });
  }

  const conversation = new Conversation({
    participants: [sender.id, recipientId],
    jobseeker: recipientId,
    startedBy: sender.id,
    messages: [],
    lastMessage: "",
    lastMessageAt: new Date(),
    unreadBy: [],
  });

  if (body.trim()) {
    conversation.messages.push({
      sender: sender.id,
      body: body.trim(),
    });
    conversation.lastMessage = body.trim();
    conversation.unreadBy = [recipientId];
  }

  await conversation.save();

  if (body.trim()) {
    await notificationService.createNotification({
      recipient: recipientId,
      type: "message",
      title: "New message",
      message: `${sender.username ?? sender.email ?? "Someone"} sent you a message.`,
      link: `/messages?conversation=${conversation.id}`,
      metadata: {
        conversation: conversation.id,
      },
    });
  }

  return getOne({ conversationId: conversation.id, userId: sender.id });
};

const sendMessage = async ({ conversationId, sender, body }) => {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw badRequest("Message is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw notFound("Conversation not found");
  }

  if (
    !conversation.participants.some(
      (participant) => participant.toString() === sender.id
    )
  ) {
    throw authorizationError("Operation not allowed");
  }

  conversation.messages.push({
    sender: sender.id,
    body: trimmedBody,
  });
  conversation.lastMessage = trimmedBody;
  conversation.lastMessageAt = new Date();
  conversation.unreadBy = conversation.participants.filter(
    (participant) => participant.toString() !== sender.id
  );

  await conversation.save();

  await notificationService.createManyNotifications(
    conversation.unreadBy.map((recipient) => ({
      recipient,
      type: "message",
      title: "New message",
      message: `${sender.username ?? sender.email ?? "Someone"} sent you a message.`,
      link: `/messages?conversation=${conversation.id}`,
      metadata: {
        conversation: conversation.id,
      },
    }))
  );

  return getOne({ conversationId: conversation.id, userId: sender.id });
};

module.exports = {
  findMine,
  getOne,
  startConversation,
  sendMessage,
};
