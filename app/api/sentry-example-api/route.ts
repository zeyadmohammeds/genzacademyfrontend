import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    throw new Error(
      "GenZCoders — Sentry Server-Side Test Error 🔥 (This is intentional)"
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        error: "Test error captured by Sentry",
        message: "Check your Sentry dashboard at https://sentry.io",
      },
      { status: 500 }
    );
  }
}
