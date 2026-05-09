const { Schema, model } = require("mongoose");

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "shortlisted", "rejected", "hired"],
      default: "submitted",
    },
    coverLetter: {
      type: String,
      maxLength: 3000,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = model("Application", applicationSchema);
module.exports = Application;
