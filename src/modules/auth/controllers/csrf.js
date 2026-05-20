const { createCsrfToken, setCsrfCookie } = require("../../../utils/csrf");

const csrf = (_req, res) => {
  const token = createCsrfToken();
  setCsrfCookie(res, token);

  res.status(200).json({
    data: {
      csrfToken: token,
    },
  });
};

module.exports = csrf;
