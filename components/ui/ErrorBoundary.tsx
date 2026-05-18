"use client";

import { WarningCircle } from "@phosphor-icons/react";

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <WarningCircle size={32} className="text-red-400" />
      </div>
      <h3 className="font-bold text-lg text-zinc-700 mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
