import { Document, Schema, model } from "mongoose";

/**
 * User document interface extending Mongoose Document
 * @interface IUser
 * @extends Document
 */
export interface IUser extends Document {
  /** User's username (3-50 characters) */
  username: string;
  /** User's email address (unique) */
  email: string;
  /** User's hashed password (min 6 characters) */
  password: string;
  /** User's role: jobseeker, employer, or admin */
  role: "jobseeker" | "employer" | "admin";
  /** Account status: pending, active, or suspended */
  status: "pending" | "active" | "suspended";
  /** Token for email verification */
  emailVerificationToken?: string;
  /** Expiration time for email verification token */
  emailVerificationTokenExpires?: Date;
  /** Token for password reset */
  resetPasswordToken?: string;
  /** Expiration time for password reset token */
  resetPasswordTokenExpires?: Date;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Mongoose schema for User model
 * @type {Schema<IUser>}
 */
const userSchema = new Schema<IUser>(
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
      enum: ["jobseeker", "employer", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
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
  },
  {
    timestamps: true,
  },
);

const User = model<IUser>("User", userSchema);
export default User;
