import { Document, Schema, model } from "mongoose";

/**
 * User document interface extending Mongoose Document
 * @interface IUser
 * @extends Document
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "jobseeker" | "employer" | "admin";
  status: "pending" | "active" | "suspended";
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  createdAt?: Date;
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
