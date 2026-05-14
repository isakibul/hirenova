const path = require("path");

const projectRoot = path.resolve(__dirname);
const repositoryRoot = path.resolve(__dirname, "..");

const nextConfig = {
  outputFileTracingRoot: repositoryRoot,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
