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
  // New service workers now wait instead of auto-activating, so we can
  // show an "update available" prompt and let the user choose when to
  // apply it (see components/pwa-update-notifier.tsx).
  skipWaiting: false,
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
