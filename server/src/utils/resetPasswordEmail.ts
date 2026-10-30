const getResetPasswordEmailHtml = (resetUrl) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #333;
        }
        .content {
          font-size: 16px;
          line-height: 1.6;
          color: #555;
        }
        .button {
          display: inline-block;
          margin-top: 25px;
          padding: 12px 20px;
          background-color: #1e90ff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #888;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>We received a request to reset your password. If this was you, click the button below to create a new password.</p>
          <p>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>If you didn’t request this, you can ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Hirenova. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

module.exports = getResetPasswordEmailHtml;
