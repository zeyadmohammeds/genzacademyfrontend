"use client";

import { useEffect } from "react";
import { Warning, ArrowClockwise, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
          <Warning size={32} weight="fill" className="text-red-500" />
        </div>
        <h1 className="text-2xl font-display font-black text-zinc-900 mb-2">Admin Console Error</h1>
        <p className="text-zinc-500 font-medium mb-2">Something went wrong loading this section.</p>
        <p className="text-xs text-zinc-400 font-mono mb-8 bg-zinc-50 rounded-xl p-3 truncate">{error.message}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={reset} className="px-6 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
            <ArrowClockwise size={18} weight="bold" /> Retry
          </button>
          <Link href="/admin" className="px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-full font-bold text-sm hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <ArrowLeft size={18} weight="bold" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
