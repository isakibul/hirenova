const { NewsletterCampaign, NewsletterSubscription } = require("../../model");
const { badRequest, notFound } = require("../../utils/error");
const sanitizeText = require("../../utils/sanitizeText");
const { sendNewsletterEmail } = require("../mailer");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getFilter = ({ search = "", status = "" }) => {
  const filter = {};

  if (search) {
    filter.email = { $regex: escapeRegExp(search), $options: "i" };
  }

  if (["subscribed", "unsubscribed"].includes(status)) {
    filter.status = status;
  }

  return filter;
};

const subscribe = async ({ email, source = "home" }) => {
  const normalizedEmail = normalizeEmail(email);
  const subscription = await NewsletterSubscription.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        email: normalizedEmail,
        status: "subscribed",
        source,
        unsubscribedAt: null,
      },
      $setOnInsert: {
        subscribedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return { ...subscription._doc, id: subscription._id.toString() };
};

const findAll = async ({ page, limit, sortType, sortBy, search, status }) => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = getFilter({ search, status });
  const subscriptions = await NewsletterSubscription.find(filter)
    .sort(sortStr)
    .skip((page - 1) * limit)
    .limit(limit);

  return subscriptions.map((subscription) => ({
    ...subscription._doc,
    id: subscription._id.toString(),
  }));
};

const count = async ({ search = "", status = "" }) =>
  NewsletterSubscription.countDocuments(getFilter({ search, status }));

const remove = async (id) => {
  const subscription = await NewsletterSubscription.findByIdAndDelete(id);
  if (!subscription) {
    throw notFound("Newsletter subscription not found");
  }
  return { ...subscription._doc, id: subscription._id.toString() };
};

const updateStatus = async (id, status) => {
  if (!["subscribed", "unsubscribed"].includes(status)) {
    throw badRequest("Invalid newsletter subscription status");
  }

  const subscription = await NewsletterSubscription.findByIdAndUpdate(
    id,
    {
      status,
      unsubscribedAt: status === "unsubscribed" ? new Date() : null,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subscription) {
    throw notFound("Newsletter subscription not found");
  }

  return { ...subscription._doc, id: subscription._id.toString() };
};

const normalizeCampaignPayload = ({ subject, previewText = "", body }) => ({
  subject: sanitizeText(subject || "").trim(),
  previewText: sanitizeText(previewText || "").trim(),
  body: sanitizeText(body || "").trim(),
});

const sendCampaign = async ({ subject, previewText, body, sentBy }) => {
  const payload = normalizeCampaignPayload({ subject, previewText, body });

  if (!payload.subject || !payload.body) {
    throw badRequest("Campaign subject and body are required");
  }

  const recipients = await NewsletterSubscription.find({
    status: "subscribed",
  })
    .select("email")
    .sort("email");

  if (recipients.length === 0) {
    throw badRequest("No subscribed newsletter recipients found");
  }

  const result = {
    totalRecipients: recipients.length,
    sentCount: 0,
    failedCount: 0,
    failureSamples: [],
  };

  for (const recipient of recipients) {
    try {
      await sendNewsletterEmail({
        to: recipient.email,
        subject: payload.subject,
        previewText: payload.previewText,
        body: payload.body,
      });
      result.sentCount += 1;
    } catch (error) {
      result.failedCount += 1;
      if (result.failureSamples.length < 5) {
        result.failureSamples.push(`${recipient.email}: ${error.message}`);
      }
    }
  }

  const campaign = await NewsletterCampaign.create({
    ...payload,
    audienceStatus: "subscribed",
    status:
      result.sentCount === 0
        ? "failed"
        : result.failedCount > 0
          ? "partial"
          : "sent",
    ...result,
    sentBy,
  });

  return { ...campaign._doc, id: campaign._id.toString() };
};

const findCampaigns = async ({ limit = 5 } = {}) => {
  const campaigns = await NewsletterCampaign.find({})
    .sort("-createdAt")
    .limit(limit);

  return campaigns.map((campaign) => ({
    ...campaign._doc,
    id: campaign._id.toString(),
  }));
};

const removeCampaign = async (id) => {
  const campaign = await NewsletterCampaign.findByIdAndDelete(id);
  if (!campaign) {
    throw notFound("Newsletter campaign not found");
  }

  return { ...campaign._doc, id: campaign._id.toString() };
};

module.exports = {
  subscribe,
  findAll,
  count,
  remove,
  updateStatus,
  sendCampaign,
  findCampaigns,
  removeCampaign,
};
