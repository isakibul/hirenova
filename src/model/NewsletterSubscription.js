const { Schema, model } = require("mongoose");

const newsletterSubscriptionSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      maxLength: 254,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: "home",
      maxLength: 80,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

newsletterSubscriptionSchema.index({ createdAt: -1 });

const NewsletterSubscription = model(
  "NewsletterSubscription",
  newsletterSubscriptionSchema
);

module.exports = NewsletterSubscription;
