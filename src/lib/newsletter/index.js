const { NewsletterSubscription } = require("../../model");
const { notFound } = require("../../utils/error");

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

module.exports = {
  subscribe,
  findAll,
  count,
  remove,
};
