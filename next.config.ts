import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.spoonacular.com" },
      { protocol: "https", hostname: "spoonacular.com" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // Food photos change rarely — serve from cache first.
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif|gif)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "food-images",
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
})(nextConfig);
