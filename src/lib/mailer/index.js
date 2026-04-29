const nodemailer = require("nodemailer");
const getConfirmationEmailHtml = require("../../utils/confirmationEmail");
const getResetPasswordEmailHtml = require("../../utils/resetPasswordEmail");

// MailHog transporter (DEV ONLY)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
});

const sendConfirmationEmail = async (to, token) => {
  const confirmUrl = `${process.env.CLIENT_URL}/api/v1/auth/confirm-email/${token}`;
  const html = getConfirmationEmailHtml(confirmUrl);

  await transporter.sendMail({
    from: `"Hirenova" <no-reply@hirenova.com>`,
    to,
    subject: "Confirm your email address",
    html,
  });
};

const sendResetEmail = async (to, resetLink) => {
  const html = getResetPasswordEmailHtml(resetLink);

  await transporter.sendMail({
    from: `"Hirenova" <no-reply@hirenova.com>`,
    to,
    subject: "Reset your password",
    html,
  });
};

module.exports = { sendConfirmationEmail, sendResetEmail };
