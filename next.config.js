/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    outputFileTracingIncludes: {
      "/api/chat/conversation": ["./database/docs/**/*"],
      "/api/search/podcast": ["./database/docs/**/*"],
    },
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.externals = config.externals || [];
    config.externals.push({
      chromadb: "chromadb",
      "@dqbd/tiktoken": "@dqbd/tiktoken",
      "cohere-ai": "cohere-ai",
      "@huggingface/inference": "@huggingface/inference",
      typeorm: "typeorm",
      replicate: "replicate",
    });
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

export default nextConfig;
