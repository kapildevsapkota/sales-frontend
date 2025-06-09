import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  images: {
    domains: ["sales.baliyoventures.com", "127.0.0.1"],
  },
};

export default withSerwist(nextConfig);
