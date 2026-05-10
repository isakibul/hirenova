const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxLength: 3000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    jobseeker: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    startedBy: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    lastMessage: {
      type: String,
      maxLength: 3000,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadBy: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = model("Conversation", conversationSchema);
module.exports = Conversation;
