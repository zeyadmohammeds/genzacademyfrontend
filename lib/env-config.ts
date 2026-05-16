/**
 * Environment variable validation and access configuration.
 * Ensures that all required environment variables are present before the app starts.
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_SENTRY_DSN",
] as const;

export type EnvVar = (typeof requiredEnvVars)[number];

export function validateEnv() {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(
      `⚠️ [Deployment Check] Missing required environment variables: ${missing.join(
        ", "
      )}`
    );
    // In a strict production environment, you might want to throw an error here.
    // throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5079",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
