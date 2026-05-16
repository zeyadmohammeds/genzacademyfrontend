import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  output: 'standalone',
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com"
      }
    ]
  }
};

export default withSentryConfig(nextConfig, {
  // Your Sentry organization & project
  org: "edu-0e",
  project: "javascript-nextjs",

  // Suppresses source map upload logs during CI — set to false to see them
  silent: !process.env.CI,

  // Upload source maps so Sentry shows readable stack traces
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically instrument Next.js API routes and server components
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,

  // Tree-shake Sentry debug code from production bundle
  disableLogger: true,

  // Tunnel requests through your own server to avoid ad-blockers
  tunnelRoute: "/monitoring-tunnel",

  // Hide the Sentry release banner
  hideSourceMaps: true,
});

