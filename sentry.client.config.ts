import * as Sentry from "@sentry/nextjs";

// Ensure Sentry is only initialized once on the client
if (!Sentry.getClient()) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

    // Session Replay — capture 10% of all sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.browserTracingIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: "dark",
        showBranding: false,
        buttonLabel: "Report a Bug",
        submitButtonLabel: "Send Report",
        formTitle: "Report a Bug",
      }),
    ],

    // Debug in development
    debug: process.env.NODE_ENV === "development",
  });
}
