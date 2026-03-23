import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/compare/delhi-vs-mumbai-air-quality",
        destination: "/compare/new-delhi-vs-mumbai-air-quality",
        permanent: true,
      },
      {
        source: "/compare/beijing-vs-delhi-air-quality",
        destination: "/compare/beijing-vs-new-delhi-air-quality",
        permanent: true,
      },
      {
        source: "/compare/delhi-vs-beijing-air-quality",
        destination: "/compare/new-delhi-vs-beijing-air-quality",
        permanent: true,
      },
      {
        source: "/compare/shanghai-vs-hong-kong-air-quality",
        destination: "/compare/shanghai-vs-beijing-air-quality",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
