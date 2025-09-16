import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sales.baliyoventures.com",
      },
      {
        protocol: "http",
        hostname: "not-violations-senators-theoretical.trycloudflare.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
