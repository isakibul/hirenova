const axios = require("axios");

const defaultTimeoutMs = 10_000;

const getTimeoutMs = (timeoutMs) => {
  const value = Number(timeoutMs ?? process.env.EXTERNAL_HTTP_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : defaultTimeoutMs;
};

const requestJson = async ({ data, headers, method = "GET", timeoutMs, url }) => {
  const response = await axios.request({
    data,
    headers,
    method,
    timeout: getTimeoutMs(timeoutMs),
    url,
    validateStatus: () => true,
  });

  return {
    body: response.data ?? {},
    headers: response.headers,
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
  };
};

const postJson = (url, data, options = {}) =>
  requestJson({
    ...options,
    data,
    method: "POST",
    url,
  });

module.exports = {
  postJson,
  requestJson,
};
