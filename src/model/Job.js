const { Schema, model } = require("mongoose");
const apiContract = require("../lib/apiContract");

const jobSchema = Schema({
  title: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 150,
  },
  description: {
    type: String,
    maxLength: 5000,
  },
  location: {
    type: String,
    maxLength: 100,
  },
  jobType: {
    type: String,
    enum: apiContract.jobs.types,
  },
  skillsRequired: [String],
  experienceRequired: Number,
  experienceMin: Number,
  experienceMax: Number,
  salary: Number,
  status: {
    type: String,
    enum: apiContract.jobs.statuses,
    default: "open",
  },
  approvalStatus: {
    type: String,
    enum: apiContract.jobs.approvalStatuses,
    default: "pending",
    index: true,
  },
  rejectionNote: {
    type: String,
    maxLength: 1000,
  },
  reviewedAt: Date,
  reviewedBy: {
    type: Schema.ObjectId,
    ref: "User",
  },
  approvalHistory: [
    {
      action: {
        type: String,
        enum: apiContract.jobs.approvalHistoryActions,
        required: true,
      },
      note: {
        type: String,
        maxLength: 1000,
      },
      actor: {
        type: Schema.ObjectId,
        ref: "User",
      },
      actorRole: {
        type: String,
        enum: apiContract.roles.user,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  expiresAt: Date,
  closedAt: Date,
  createdAt: { type: Date, default: Date.now },
  author: {
    type: Schema.ObjectId,
    ref: "User",
  },
});

const Job = model("Job", jobSchema);
module.exports = Job;
