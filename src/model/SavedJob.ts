const { Schema, model } = require("mongoose");

const savedJobSchema = new Schema(
  {
    job: {
      type: Schema.ObjectId,
      ref: "Job",
      required: true,
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

savedJobSchema.index({ job: 1, user: 1 }, { unique: true });

const SavedJob = model("SavedJob", savedJobSchema);
module.exports = SavedJob;
