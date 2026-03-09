/**
 * Email service module using nodemailer
 * @module lib/mailer
 */
import nodemailer from "nodemailer";
import getConfirmationEmailHtml from "../../utils/confirmationEmail";
import getResetPasswordEmailHtml from "../../utils/resetPasswordEmail";

/**
 * Nodemailer transporter for sending emails
 * @type {nodemailer.Transporter}
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a confirmation email to the user
 * @async
 * @param {string} to - Recipient email address
 * @param {string} token - Email confirmation token
 * @returns {Promise<void>} Resolves when email is sent
 */
const sendConfirmationEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const confirmUrl = `${process.env.CLIENT_URL}/api/v1/auth/confirm-email/${token}`;
  const html = getConfirmationEmailHtml(confirmUrl);

  await transporter.sendMail({
    from: `"Hirenova" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Confirm your email address",
    html,
  });
};

/**
 * Sends a password reset email to the user
 * @async
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Password reset link
 * @returns {Promise<void>} Resolves when email is sent
 */
const sendResetEmail = async (to: string, resetLink: string): Promise<void> => {
  const resetTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = getResetPasswordEmailHtml(resetLink);

  await resetTransporter.sendMail({
    from: `"Hirenova" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your password",
    html,
  });
};

export { sendConfirmationEmail, sendResetEmail };
