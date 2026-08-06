const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "https",
        hostname: "infinitech-api17.site",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Service worker only makes sense in production.
  disable: process.env.NODE_ENV === "development",
  customWorkerSrc: "worker",
  workboxOptions: {
    disableDevLogs: true,
    // This is the option that actually controls the generated sw.js —
    // the top-level `skipWaiting` on withPWA() is NOT read by
    // @ducanh2912/next-pwa's GenerateSW step. Setting it here makes new
    // service workers wait instead of auto-activating, so we can prompt
    // the user first (see components/pwa-update-notifier.tsx).
    skipWaiting: false,
    clientsClaim: true,
  },
})(nextConfig);
