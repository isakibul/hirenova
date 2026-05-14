const { Schema, model } = require("mongoose");

const auditLogSchema = new Schema(
  {
    actor: {
      type: Schema.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ["jobseeker", "employer", "admin", "superadmin", "anonymous"],
      default: "anonymous",
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxLength: 80,
      index: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
      maxLength: 12,
    },
    route: {
      type: String,
      required: true,
      trim: true,
      maxLength: 220,
      index: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      trim: true,
      maxLength: 80,
      default: "",
    },
    ipHash: {
      type: String,
      trim: true,
      maxLength: 96,
      default: "",
    },
    userAgent: {
      type: String,
      trim: true,
      maxLength: 240,
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

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = model("AuditLog", auditLogSchema);

module.exports = AuditLog;
