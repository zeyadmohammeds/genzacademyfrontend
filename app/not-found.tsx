"use client";

import Link from "next/link";
import { ArrowLeft, Compass, House } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 bg-canvas-soft relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[520px] h-[520px] bg-brand/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-ink/5 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-lg w-full text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-positive-deep mb-6">404</p>
        <h1 className="font-display text-5xl sm:text-6xl font-black text-ink tracking-tight leading-[0.95] mb-6">
          This room doesn&apos;t exist (yet).
        </h1>
        <p className="text-mute font-medium text-lg mb-10 leading-relaxed">
          The link may be outdated, or the course session was archived. Head back to the studio hub or open the catalog.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-ink text-canvas font-bold text-sm hover:bg-ink/90 transition-colors w-full sm:w-auto"
          >
            <House size={18} weight="bold" /> Home
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand text-brand-fg font-bold text-sm hover:bg-brand-hover transition-colors w-full sm:w-auto"
          >
            <Compass size={18} weight="bold" /> Browse courses
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mt-10 text-sm font-bold text-ink/70 hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} weight="bold" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
