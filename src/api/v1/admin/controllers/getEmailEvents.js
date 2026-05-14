const { EmailEvent } = require("../../../../model");
const defaults = require("../../../../config/defaults");
const { getPagination } = require("../../../../utils/getPagination");

const getEmailEvents = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Math.min(Number(req.query.limit) || defaults.limit, 100);
  const status = ["sent", "failed"].includes(req.query.status)
    ? req.query.status
    : "";
  const type = ["confirmation", "password_reset"].includes(req.query.type)
    ? req.query.type
    : "";
  const filter = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  };

  try {
    const [events, totalItems] = await Promise.all([
      EmailEvent.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "type status providerMessageId errorMessage durationMs createdAt"
        )
        .lean(),
      EmailEvent.countDocuments(filter),
    ]);

    res.status(200).json({
      data: events.map((event) => ({
        id: event._id,
        type: event.type,
        status: event.status,
        providerMessageId: event.providerMessageId,
        errorMessage: event.errorMessage,
        durationMs: event.durationMs,
        createdAt: event.createdAt,
      })),
      pagination: getPagination({ totalItems, limit, page }),
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getEmailEvents;
