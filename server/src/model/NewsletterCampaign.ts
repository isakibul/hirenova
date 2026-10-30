const { Schema, model } = require("mongoose");

const newsletterCampaignSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxLength: 140,
    },
    previewText: {
      type: String,
      trim: true,
      maxLength: 180,
      default: "",
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxLength: 8000,
    },
    audienceStatus: {
      type: String,
      enum: ["subscribed"],
      default: "subscribed",
    },
    status: {
      type: String,
      enum: ["sent", "partial", "failed"],
      required: true,
      index: true,
    },
    totalRecipients: {
      type: Number,
      min: 0,
      default: 0,
    },
    sentCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    failedCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    failureSamples: {
      type: [String],
      default: [],
    },
    sentBy: {
      type: Schema.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

newsletterCampaignSchema.index({ createdAt: -1 });

const NewsletterCampaign = model(
  "NewsletterCampaign",
  newsletterCampaignSchema
);

module.exports = NewsletterCampaign;
