"use client";

import { memo } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export const Pagination = memo(function Pagination({ page, totalPages, totalCount, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/5 mt-6">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
        {startItem}–{endItem} of {totalCount}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
              pageNum === page
                ? "bg-zinc-900 text-white shadow-sm"
                : "bg-white border border-black/10 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {pageNum}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
});
