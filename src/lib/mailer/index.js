const nodemailer = require("nodemailer");
const getConfirmationEmailHtml = require("../../utils/confirmationEmail");
const getResetPasswordEmailHtml = require("../../utils/resetPasswordEmail");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConfirmationEmail = async (to, token) => {
  const confirmUrl = `${process.env.CLIENT_URL}/api/v1/auth/confirm-email/${token}`;
  const html = getConfirmationEmailHtml(confirmUrl);

  await transporter.sendMail({
    from: `"Hirenova" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Confirm your email address",
    html,
  });
};

const sendResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = getResetPasswordEmailHtml(resetLink);

  await transporter.sendMail({
    from: `"Hirenova" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your password",
    html,
  });
};

module.exports = { sendConfirmationEmail, sendResetEmail };
