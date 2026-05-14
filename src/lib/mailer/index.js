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

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderNewsletterHtml = ({ subject, previewText = "", body }) => {
  const paragraphs = String(body)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");

  return `
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">
      ${escapeHtml(previewText)}
    </div>
    <main style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:0 auto;padding:24px;">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:700;">HireNova Newsletter</p>
      <h1 style="font-size:24px;line-height:1.25;margin:12px 0 20px;">${escapeHtml(subject)}</h1>
      <section style="font-size:15px;color:#1f2937;">${paragraphs}</section>
      <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0;" />
      <p style="font-size:12px;color:#64748b;">
        You are receiving this because you subscribed to HireNova updates.
      </p>
    </main>
  `;
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

const sendNewsletterEmail = async ({ to, subject, previewText, body }) => {
  await sendTrackedMail({
    type: "newsletter_campaign",
    to,
    subject,
    html: renderNewsletterHtml({ subject, previewText, body }),
  });
};

module.exports = {
  sendConfirmationEmail,
  sendNewsletterEmail,
  sendResetEmail,
};
