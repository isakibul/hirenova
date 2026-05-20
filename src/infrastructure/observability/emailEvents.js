const { EmailEvent } = require("../../model");
const hashValue = require("./hash");

const recordEmailEvent = async ({
  type,
  to,
  status,
  providerMessageId = "",
  errorMessage = "",
  durationMs = 0,
}) => {
  await EmailEvent.create({
    type,
    recipientHash: hashValue(to),
    status,
    providerMessageId,
    errorMessage: String(errorMessage || "").slice(0, 500),
    durationMs,
  });
};

const summarizeEmailEvents = async (since) => {
  const rows = await EmailEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { type: "$type", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  return rows.reduce((summary, row) => {
    const key = `${row._id.type}.${row._id.status}`;
    summary[key] = row.count;
    return summary;
  }, {});
};

module.exports = {
  recordEmailEvent,
  summarizeEmailEvents,
};
