"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyProgress } from "@/lib/api";
import type { Badge } from "@/lib/types";
import Image from "next/image";
import { 
  Trophy, LockKey, Sparkle, ArrowRight,
  Star, Lightning, Target, Clock, Users
} from "@phosphor-icons/react";

const ALL_BADGES: (Badge & { icon: string; category: string })[] = [
  { id: "b1", slug: "first-blood", name: "First Blood", description: "Submit your first task", colorHex: "#EF4444", icon: "🩸", category: "Tasks" },
  { id: "b2", slug: "code-ninja", name: "Code Ninja", description: "Perfect score on a C++ quiz", colorHex: "#18181B", icon: "🥷", category: "Quizzes" },
  { id: "b3", slug: "social-butterfly", name: "Social Butterfly", description: "Refer a friend to the academy", colorHex: "#3B82F6", icon: "🦋", category: "Community" },
  { id: "b4", slug: "streak-master", name: "Streak Master", description: "Maintain a 7-day active streak", colorHex: "#F59E0B", icon: "🔥", category: "Consistency" },
  { id: "b5", slug: "quiz-whiz", name: "Quiz Whiz", description: "Complete 5 quizzes", colorHex: "#7C3AED", icon: "🧠", category: "Quizzes" },
  { id: "b6", slug: "perfect-attendance", name: "Perfect Attendance", description: "Attend 10 live sessions", colorHex: "#10B981", icon: "🎯", category: "Attendance" },
  { id: "b7", slug: "top-performer", name: "Top Performer", description: "Reach #1 on the leaderboard", colorHex: "#F59E0B", icon: "👑", category: "Community" },
  { id: "b8", slug: "xp-collector", name: "XP Collector", description: "Earn 2,500 total XP", colorHex: "#06B6D4", icon: "💎", category: "Progress" },
  { id: "b9", slug: "robot-builder", name: "Robot Builder", description: "Complete the Robot Build course", colorHex: "#F59E0B", icon: "🤖", category: "Courses" },
  { id: "b10", slug: "web-artist", name: "Web Artist", description: "Complete the Web App with AI course", colorHex: "#10B981", icon: "🌐", category: "Courses" },
  { id: "b11", slug: "cpp-master", name: "C++ Master", description: "Complete all C++ courses", colorHex: "#0EA5E9", icon: "⚡", category: "Courses" },
  { id: "b12", slug: "playground-pro", name: "Playground Pro", description: "Run 25 code playground sessions", colorHex: "#EC4899", icon: "💻", category: "Progress" },
  { id: "b13", slug: "feedback-hero", name: "Feedback Hero", description: "Submit detailed feedback on 3 courses", colorHex: "#8B5CF6", icon: "💬", category: "Community" },
  { id: "b14", slug: "early-bird", name: "Early Bird", description: "Join a live session 10 minutes early", colorHex: "#F97316", icon: "🐦", category: "Attendance" },
  { id: "b15", slug: "team-player", name: "Team Player", description: "Participate in a group project", colorHex: "#14B8A6", icon: "🤝", category: "Community" },
  { id: "b16", slug: "iron-will", name: "Iron Will", description: "Maintain a 30-day active streak", colorHex: "#DC2626", icon: "💪", category: "Consistency" },
];

const categories = ["All", "Tasks", "Quizzes", "Courses", "Attendance", "Consistency", "Community", "Progress"];

export default function AchievementsPage() {
  const { user } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showLocked, setShowLocked] = useState(true);

  useEffect(() => {
    getMyProgress()
      .then(p => setEarnedBadges(p.badges || []))
      .finally(() => setLoading(false));
  }, []);

  const earnedSlugs = new Set(earnedBadges.map(b => b.slug));
  const earnedCount = earnedBadges.length;
  const totalCount = ALL_BADGES.length;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  const filtered = ALL_BADGES.filter(b => {
    if (activeCategory !== "All" && b.category !== activeCategory) return false;
    if (!showLocked && !earnedSlugs.has(b.slug)) return false;
    return true;
  });

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-2">
          <Trophy weight="fill" /> Achievements
        </div>
        <h1 className="text-4xl font-display font-black text-zinc-900 tracking-tight mb-2">Badges & Achievements</h1>
        <p className="text-zinc-500 font-medium">Earn badges by completing tasks, quizzes, and courses.</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-ink rounded-[3rem] p-8 md:p-12 text-white mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-brand rounded-full blur-[100px] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="text-5xl font-black font-display mb-2">{earnedCount}<span className="text-zinc-500 text-2xl">/{totalCount}</span></div>
              <div className="text-zinc-400 font-medium">Badges Collected</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {earnedBadges.slice(0, 6).map(b => (
                  <div key={b.id} className="w-10 h-10 rounded-full bg-white/10 border-2 border-ink flex items-center justify-center text-sm shadow-lg" title={b.name}>{ALL_BADGES.find(ab => ab.slug === b.slug)?.icon || "🏅"}</div>
                ))}
                {earnedBadges.length > 6 && (
                  <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-ink flex items-center justify-center text-[10px] font-black text-zinc-400 shadow-lg">+{earnedBadges.length - 6}</div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand to-yellow-400 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 font-medium mt-2">
            <span>{progressPercent}% complete</span>
            <span>{totalCount - earnedCount} more to collect</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-ink text-white shadow-lg'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-black/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowLocked(!showLocked)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            showLocked ? 'bg-white text-zinc-700 border border-black/5' : 'bg-brand text-brand-fg'
          }`}
        >
          {showLocked ? <LockKey size={14} /> : <Sparkle size={14} />}
          {showLocked ? "Show Locked" : "Hide Locked"}
        </button>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(badge => {
          const earned = earnedSlugs.has(badge.slug);
          return (
            <div
              key={badge.id}
              className={`relative rounded-[2rem] p-6 flex flex-col items-center text-center transition-all group ${
                earned
                  ? 'bg-white border-2 border-brand/20 shadow-md hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-zinc-100/50 border-2 border-dashed border-zinc-200 opacity-60'
              }`}
            >
              {/* Category Tag */}
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-zinc-100 rounded-lg text-[8px] font-black text-zinc-500 uppercase tracking-wider">{badge.category}</span>

              {/* Badge Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mt-4 ${
                earned ? 'bg-gradient-to-br from-brand/10 to-yellow-100 shadow-inner' : 'bg-zinc-200 grayscale'
              }`}>
                {earned ? badge.icon : <LockKey size={24} weight="bold" className="text-zinc-400" />}
              </div>

              <h3 className={`text-sm font-black mb-1 leading-tight ${earned ? 'text-zinc-900' : 'text-zinc-500'}`}>
                {badge.name}
              </h3>
              <p className={`text-[10px] font-medium leading-tight ${earned ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {badge.description}
              </p>

              {/* Earned Badge */}
              {earned && (
                <div className="mt-4 px-3 py-1 bg-brand/10 text-brand rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkle size={10} weight="fill" /> Earned
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-black/5">
          <Star size={48} weight="duotone" className="text-zinc-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No badges in this category</h3>
          <p className="text-zinc-500">Complete tasks and quizzes to earn more badges!</p>
        </div>
      )}
    </div>
  );
}
