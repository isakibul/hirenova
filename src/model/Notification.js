const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "application_submitted",
        "application_status",
        "job_saved",
        "job_closed",
        "job_pending_review",
        "job_approved",
        "job_declined",
        "system",
      ],
      default: "system",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 140,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    link: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = model("Notification", notificationSchema);
module.exports = Notification;
