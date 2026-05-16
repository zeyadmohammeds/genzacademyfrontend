"use client";

import { useEffect } from "react";
import { Warning, ArrowClockwise, House } from "@phosphor-icons/react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-[2rem] bg-red-100 flex items-center justify-center mx-auto mb-6">
          <Warning size={40} weight="fill" className="text-red-500" />
        </div>
        <h1 className="text-3xl font-display font-black text-zinc-900 mb-2">System Error</h1>
        <p className="text-zinc-500 font-medium mb-2">An unexpected error occurred.</p>
        <p className="text-xs text-zinc-400 font-mono mb-8 bg-zinc-100 rounded-xl p-3 truncate">{error.message}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="px-6 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
            <ArrowClockwise size={18} weight="bold" /> Try Again
          </button>
          <Link href="/" className="px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-full font-bold text-sm hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <House size={18} weight="bold" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
