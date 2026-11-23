const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Dev only: lets next/image optimize images from http://localhost:8000
    // (Next blocks local/private IPs by default, which shows as blank images).
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
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
        hostname: "infinitech-api18.site",
        pathname: "/products/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Site moved to qstore.tissuemarket.com
  // Excludes _next assets and the service worker files so existing
  // PWA users can still fetch the updated SW and get redirected.
  async redirects() {
    return [
      {
        source: "/((?!_next|sw\\.js|workbox-.*|swe-worker-.*|worker).*)",
        destination: "https://qstore.tissuemarket.com/:path*",
        permanent: true, // change to true once you're sure it's final (308)
      },
    ];
  },

  // No headers() function here anymore — CSP is set in middleware.ts instead
};

module.exports = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerSrc: "worker",
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true, // was false; lets old users pick up the redirect right away
    clientsClaim: true,
  },
})(nextConfig);
