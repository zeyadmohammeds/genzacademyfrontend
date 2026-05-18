"use client";

import { useEffect, useState, useMemo } from "react";
import { getAdminSessions } from "@/lib/api";
import Link from "next/link";
import { Calendar, Clock, VideoCamera, Plus, ArrowLeft, PencilSimple, X, FloppyDisk, MagnifyingGlass, MonitorPlay } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/lib/toast-context";

const STATUS_TABS = ["All", "Scheduled", "InProgress", "Completed", "Cancelled"] as const;

const TAB_LABELS: Record<string, string> = {
  All: "All",
  Scheduled: "Scheduled",
  InProgress: "In Progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

function StatusDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
  );
}

function SessionTypeIcon({ type }: { type?: string }) {
  if (type === "InPerson" || type === "In-Person") {
    return <MonitorPlay size={14} weight="fill" className="text-zinc-400" />;
  }
  return <VideoCamera size={14} weight="fill" className="text-zinc-400" />;
}

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    InProgress: "bg-blue-100 text-blue-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${colors[status ?? ""] || "bg-amber-100 text-amber-800"}`}>
      {status === "InProgress" ? "In Progress" : status || "Scheduled"}
    </span>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const { toast } = useToast();

  useEffect(() => {
    getAdminSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sessions.filter(s => {
      if (q && !(s.title ?? "").toLowerCase().includes(q)) return false;
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      return true;
    });
  }, [sessions, searchQuery, statusFilter]);

  const monthGroups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const s of filteredSessions) {
      const d = s.scheduledAt ? new Date(s.scheduledAt) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries())
      .map(([key, sessions]) => {
        const [year, month] = key.split("-").map(Number);
        const label = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        return { key, label, sessions };
      })
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredSessions]);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Master Calendar</h1>
          <p className="text-zinc-500 font-medium">Global view of all academy sessions.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/30 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === tab
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/5">
        {filteredSessions.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} weight="fill" />}
            title={searchQuery || statusFilter !== "All" ? "No sessions match your filters." : "No sessions scheduled."}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {monthGroups.map(group => (
              <motion.div
                key={group.key}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-8 last:mb-0"
              >
                <div className="flex items-center gap-4 mb-5">
                  <h3 className="font-display text-base sm:text-lg font-black text-zinc-900 shrink-0">
                    {group.label}
                    <span className="text-zinc-400 font-medium ml-2 text-sm">· {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""}</span>
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 via-zinc-200/50 to-transparent" />
                </div>

                <AnimatePresence mode="popLayout">
                  {group.sessions.map((session: any) => {
                    const date = session.scheduledAt ? new Date(session.scheduledAt) : new Date();
                    return (
                      <motion.div
                        key={session.id}
                        layout
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-black/5 hover:border-black/10 hover:bg-zinc-50 transition-all mb-3 last:mb-0"
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900 text-brand rounded-xl flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {date.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-xl sm:text-2xl font-black leading-none mt-0.5 text-white">
                            {date.getDate()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-bold text-zinc-900 text-base sm:text-lg leading-tight truncate">
                              {session.title}
                            </h4>
                            <StatusBadge status={session.status} />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                            {session.cohortName && (
                              <span className="inline-block px-2 py-0.5 bg-zinc-100 border border-black/5 text-zinc-600 text-[10px] font-bold uppercase tracking-widest rounded">
                                {session.cohortName}
                              </span>
                            )}
                            <span className="text-sm text-zinc-500 font-medium">{session.courseName}</span>
                          </div>

                          <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-400 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} weight="bold" />
                              {formatDate(date)} at {formatTime(date)}
                            </span>
                            <SessionTypeIcon type={session.sessionType} />
                            {session.status === "InProgress" && (
                              <span className="flex items-center gap-1.5">
                                <StatusDot />
                                <span className="text-green-600 font-bold text-[10px] uppercase tracking-wider">Live</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
