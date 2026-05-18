"use client";

import { useState, useMemo } from "react";
import { CaretUp, CaretDown, ArrowsDownUp } from "@phosphor-icons/react";
import { SkeletonTable } from "./Skeleton";

type SortDir = "asc" | "desc";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  defaultSort?: { key: string; dir: SortDir };
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = "No data",
  onRowClick,
  defaultSort,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort?.dir ?? "asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (loading) {
    return <SkeletonTable rows={6} cols={columns.length} />;
  }

  if (!sorted.length) {
    return <div className="empty-state-mini">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-black/5">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                className={`text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-3 px-3 ${
                  col.sortable ? "cursor-pointer hover:text-zinc-700 select-none" : ""
                }`}
                style={col.width ? { width: col.width } : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortKey === String(col.key) ? (
                      sortDir === "asc" ? <CaretUp size={12} weight="fill" /> : <CaretDown size={12} weight="fill" />
                    ) : (
                      <ArrowsDownUp size={12} className="opacity-30" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-black/5 transition-colors ${
                onRowClick ? "cursor-pointer hover:bg-zinc-50" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="py-3 px-3 text-sm font-medium text-zinc-800">
                  {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode) ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
