const nodemailer = require("nodemailer");
const getConfirmationEmailHtml = require("../../utils/confirmationEmail");
const getResetPasswordEmailHtml = require("../../utils/resetPasswordEmail");
const { recordEmailEvent } = require("../observability/emailEvents");

/**
 * MailHog transporter - Dev Only
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth:
    process.env.EMAIL_USER && process.env.EMAIL_PASS
      ? {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      : undefined,
});

const sendTrackedMail = async ({ type, to, subject, html }) => {
  const start = Date.now();

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Hirenova" <no-reply@hirenova.com>`,
      to,
      subject,
      html,
    });

    await recordEmailEvent({
      type,
      to,
      status: "sent",
      providerMessageId: info.messageId,
      durationMs: Date.now() - start,
    }).catch((error) => {
      console.error("Email event write failed:", error.message);
    });

    return info;
  } catch (error) {
    await recordEmailEvent({
      type,
      to,
      status: "failed",
      errorMessage: error.message,
      durationMs: Date.now() - start,
    }).catch((eventError) => {
      console.error("Email event write failed:", eventError.message);
    });

    throw error;
  }
};

const sendConfirmationEmail = async (to, confirmUrl) => {
  const html = getConfirmationEmailHtml(confirmUrl);

  await sendTrackedMail({
    type: "confirmation",
    to,
    subject: "Confirm your email address",
    html,
  });
};

const sendResetEmail = async (to, resetLink) => {
  const html = getResetPasswordEmailHtml(resetLink);

  await sendTrackedMail({
    type: "password_reset",
    to,
    subject: "Reset your password",
    html,
  });
};

module.exports = { sendConfirmationEmail, sendResetEmail };
