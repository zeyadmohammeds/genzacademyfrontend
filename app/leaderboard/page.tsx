"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getLeaderboard } from "@/lib/api";
import type { LeaderboardEntry } from "@/lib/types";
import Image from "next/image";
import { 
  Trophy, Medal, Sparkle, Clock, ArrowUp,
  CaretDown, FunnelSimple
} from "@phosphor-icons/react";

type Period = "all" | "month" | "week";
type Course = "all" | "scratch" | "intro-cpp" | "advanced-cpp" | "robot-build" | "web-app-ai";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");
  const [course, setCourse] = useState<Course>("all");

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const userEntry = entries.find(e => e.studentUserId === user?.id);

  const rankColors = ["bg-yellow-400 text-yellow-900", "bg-zinc-300 text-zinc-700", "bg-orange-300 text-orange-900"];
  const rankIcons = [Trophy, Medal, Medal];

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-canvas-soft px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-2">
              <Trophy weight="fill" /> Global Rankings
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-black text-zinc-900 tracking-tight leading-[0.9]">Leaderboard</h1>
            <p className="text-zinc-500 font-medium mt-2">Top performers across all courses and cohorts.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="bg-white border border-black/5 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand shadow-sm"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value as Course)}
              className="bg-white border border-black/5 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand shadow-sm"
            >
              <option value="all">All Courses</option>
              <option value="scratch">Scratch</option>
              <option value="intro-cpp">Intro to C++</option>
              <option value="advanced-cpp">Advanced C++</option>
              <option value="robot-build">Robot Build</option>
              <option value="web-app-ai">Web App with AI</option>
            </select>
          </div>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-12">
          {entries.slice(0, 3).map((entry, i) => {
            const rank = [1, 0, 2][i];
            const podiumEntry = entries[rank];
            if (!podiumEntry) return null;
            const heights = ["h-48", "h-64", "h-36"];
            const bgColors = ["bg-gradient-to-t from-yellow-400/20 to-yellow-50", "bg-gradient-to-t from-zinc-300/20 to-zinc-50", "bg-gradient-to-t from-orange-300/20 to-orange-50"];
            return (
              <div key={rank} className="flex flex-col items-center gap-4 flex-1">
                <div className={`relative ${rank === 0 ? 'scale-110' : ''}`}>
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-black/5 overflow-hidden shadow-lg">
                    <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${podiumEntry.studentName}&backgroundColor=f0f0f0`} alt="" width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${rankColors[rank]} rounded-lg flex items-center justify-center font-black text-xs shadow-lg`}>
                    {rank + 1}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-zinc-900">{podiumEntry.studentName}</div>
                  <div className="text-xs font-bold text-zinc-400">{podiumEntry.xpTotal.toLocaleString()} XP</div>
                </div>
                <div className={`w-full ${bgColors[rank]} rounded-3xl ${heights[rank]} flex items-center justify-center border border-black/5`}>
                  {rank === 0 && <Trophy size={40} weight="fill" className="text-yellow-500" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rank List */}
        <div className="bg-white rounded-[3rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-black/5">
            <div className="grid grid-cols-[48px_1fr_120px_80px] gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <span>Rank</span>
              <span>Student</span>
              <span className="text-right">XP</span>
              <span className="text-right">Level</span>
            </div>
          </div>

          <div className="divide-y divide-black/5">
            {entries.map((entry, i) => {
              const Icon = rankIcons[i] || null;
              const isMe = entry.studentUserId === user?.id;
              return (
                <div key={entry.studentUserId} className={`p-6 ${isMe ? 'bg-brand/5 ring-1 ring-brand/20' : 'hover:bg-zinc-50'} transition-colors`}>
                  <div className="grid grid-cols-[48px_1fr_120px_80px] gap-4 items-center">
                    <div className="flex items-center justify-center">
                      {i < 3 ? (
                        <Icon size={24} weight="fill" className={["text-yellow-500", "text-zinc-400", "text-orange-400"][i]} />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-500">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-black/5">
                        <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${entry.studentName}&backgroundColor=f0f0f0`} alt="" width={40} height={40} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 truncate">
                          {entry.studentName}
                          {isMe && <span className="ml-2 px-2 py-0.5 bg-brand/10 text-brand rounded-full text-[8px] font-black uppercase tracking-wider">You</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                          <Sparkle size={12} weight="fill" className="text-yellow-500" />
                          <span>Rank #{entry.rank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-zinc-900">{entry.xpTotal.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-400 font-bold">XP</div>
                    </div>

                    <div className="text-right">
                      <div className="w-12 h-7 rounded-lg bg-ink text-brand text-xs font-black flex items-center justify-center ml-auto">{Math.floor((entry.xpTotal || 0) / 500) + 1}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
            <div className="text-2xl font-black text-brand">{entries.length}</div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Students</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
            <div className="text-2xl font-black text-[#7c3aed]">{entries.reduce((sum, e) => sum + e.xpTotal, 0).toLocaleString()}</div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total XP Earned</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
            <div className="text-2xl font-black text-orange-500">{Math.max(...entries.map(e => Math.floor(e.xpTotal / 500) + 1))}</div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Highest Level</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
            <div className="text-2xl font-black text-green-500">{userEntry ? Math.floor(userEntry.xpTotal / 500) + 1 : "—"}</div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Your Level</div>
          </div>
        </div>
      </div>
    </div>
  );
}
