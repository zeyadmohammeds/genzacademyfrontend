"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#09090b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 500,
            width: "100%",
            textAlign: "center",
            color: "#fff",
          }}
        >
          {/* Error Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              margin: "0 auto 1.5rem",
            }}
          >
            ⚠️
          </div>

          <h1
            style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "#71717a", marginBottom: "0.5rem" }}>
            An unexpected error occurred. Our team has been notified via Sentry.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#52525b",
                fontFamily: "monospace",
                marginBottom: "2rem",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              style={{
                padding: "0.75rem 1.5rem",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
