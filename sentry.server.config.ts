import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // Performance Monitoring — lower rate on server to reduce cost
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Capture unhandled promise rejections
  integrations: [Sentry.captureConsoleIntegration({ levels: ["error"] })],

  debug: process.env.NODE_ENV === "development",
});
