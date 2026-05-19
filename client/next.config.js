const backendApiUrl =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4000/api/v1";
const backendOrigin = (() => {
  try {
    return new URL(backendApiUrl).origin;
  } catch {
    return "http://localhost:4000";
  }
})();
const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL || backendOrigin;
const realtimeOrigin = realtimeUrl.replace(/^http/i, "ws");
const shouldUpgradeInsecureRequests = process.env.NODE_ENV === "production";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `connect-src 'self' ${backendOrigin} ${realtimeUrl} ${realtimeOrigin}`,
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      shouldUpgradeInsecureRequests ? "upgrade-insecure-requests" : "",
    ]
      .filter(Boolean)
      .join("; "),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
