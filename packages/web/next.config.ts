import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@textil/core"],
  // sharp is a Node.js-only native module used by @textil/core's image generator.
  // It must not be bundled for the browser — stub it out on the client side.
  serverExternalPackages: ["sharp"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        sharp: false,
      };
    }
    return config;
  },
};

export default nextConfig;
