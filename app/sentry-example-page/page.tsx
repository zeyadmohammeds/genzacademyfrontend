"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import Link from "next/link";

export default function SentryExamplePage() {
  const [hasThrownError, setHasThrownError] = useState(false);

  const throwClientError = () => {
    setHasThrownError(true);
    // Trigger a real unhandled JS error
    throw new Error(
      "GenZCoders — Sentry Client-Side Test Error 🔥 (This is intentional)"
    );
  };

  const throwApiError = async () => {
    await fetch("/api/sentry-example-api");
  };

  return (
    <main
      style={{
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
          maxWidth: 560,
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "3rem",
          textAlign: "center",
        }}
      >
        {/* Logo / Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background:
              "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            margin: "0 auto 1.5rem",
            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
          }}
        >
          🛡️
        </div>

        <h1
          style={{
            color: "#fff",
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "0.75rem",
          }}
        >
          Sentry Integration Test
        </h1>

        <p style={{ color: "#a1a1aa", marginBottom: "2rem", lineHeight: 1.6 }}>
          Click a button below to trigger a test error. If it appears in your{" "}
          <a
            href="https://sentry.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7c3aed" }}
          >
            Sentry Dashboard
          </a>
          , you&apos;re fully configured! 🎉
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            onClick={throwClientError}
            style={{
              padding: "0.875rem 1.5rem",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = "0.85")
            }
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            💥 Throw Client-Side Error
          </button>

          <button
            onClick={throwApiError}
            style={{
              padding: "0.875rem 1.5rem",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
            }
          >
            🌐 Throw API (Server-Side) Error
          </button>
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: 12,
            fontSize: "0.8rem",
            color: "#a78bfa",
          }}
        >
          <strong>Also verify:</strong> trigger{" "}
          <code
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "0 4px",
              borderRadius: 4,
            }}
          >
            myUndefinedFunction();
          </code>{" "}
          in the browser console.
        </div>

        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            color: "#71717a",
            fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
