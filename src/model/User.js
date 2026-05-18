const { Schema, model } = require("mongoose");
const apiContract = require("../lib/apiContract");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      maxLength: 50,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
    },
    role: {
      type: String,
      enum: apiContract.roles.user,
      required: true,
    },
    roleChangeRequest: {
      requestedRole: {
        type: String,
        enum: apiContract.roles.adminManaged,
      },
      status: {
        type: String,
        enum: apiContract.users.roleChangeRequestStatuses,
      },
      requestedAt: {
        type: Date,
      },
      reviewedAt: {
        type: Date,
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      note: {
        type: String,
        maxLength: 300,
      },
    },
    status: {
      type: String,
      enum: apiContract.users.statuses,
      default: "pending",
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpires: {
      type: Date,
    },
    skills: [String],
    resumeUrl: {
      type: String,
      maxLength: 500,
    },
    experience: {
      type: Number,
      min: 0,
    },
    preferredLocation: {
      type: String,
      maxLength: 100,
    },
    companyName: {
      type: String,
      maxLength: 120,
    },
    companyWebsite: {
      type: String,
      maxLength: 500,
    },
    companySize: {
      type: String,
      maxLength: 50,
    },
    companyAbout: {
      type: String,
      maxLength: 2500,
    },
    lastSeenAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
module.exports = User;
