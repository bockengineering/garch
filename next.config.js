/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  outputFileTracingIncludes: {
    "/dist/[file]": ["./dist/*.json"]
  }
};

module.exports = nextConfig;
