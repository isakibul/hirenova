const { Schema, model } = require("mongoose");

const emailEventRetentionDays = Number(process.env.EMAIL_EVENT_RETENTION_DAYS || 90);

const emailEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["confirmation", "password_reset"],
      required: true,
      index: true,
    },
    recipientHash: {
      type: String,
      required: true,
      trim: true,
      maxLength: 96,
      index: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
      index: true,
    },
    providerMessageId: {
      type: String,
      trim: true,
      maxLength: 180,
      default: "",
    },
    errorMessage: {
      type: String,
      trim: true,
      maxLength: 500,
      default: "",
    },
    durationMs: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

emailEventSchema.index({ createdAt: -1 });
emailEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: Math.max(emailEventRetentionDays, 1) * 24 * 60 * 60 }
);
emailEventSchema.index({ status: 1, createdAt: -1 });

const EmailEvent = model("EmailEvent", emailEventSchema);

module.exports = EmailEvent;
