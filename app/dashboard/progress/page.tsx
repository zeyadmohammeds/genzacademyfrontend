"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyProgress, getMyTasks, getMySessions } from "@/lib/api";
import type { StudentProgress, LearningTask } from "@/lib/types";
import Link from "next/link";
import {
  Trophy, Star, Target, TrendUp, Lightning,
  CheckCircle, Clock, Code, PencilSimple,
  Sparkle, ArrowRight, Cpu, Fire, LockKey
} from "@phosphor-icons/react";

const SKILL_TREE = [
  { name: "Variables & Data Types", level: "beginner", xp: 0, icon: "💾", color: "bg-green-100 border-green-200" },
  { name: "Control Flow", level: "beginner", xp: 100, icon: "🔄", color: "bg-green-100 border-green-200" },
  { name: "Functions", level: "intermediate", xp: 250, icon: "⚙️", color: "bg-yellow-100 border-yellow-200" },
  { name: "Arrays & Pointers", level: "intermediate", xp: 400, icon: "📊", color: "bg-yellow-100 border-yellow-200" },
  { name: "OOP & Classes", level: "advanced", xp: 600, icon: "🧩", color: "bg-orange-100 border-orange-200" },
  { name: "Data Structures", level: "advanced", xp: 800, icon: "🌳", color: "bg-orange-100 border-orange-200" },
  { name: "Algorithms", level: "expert", xp: 1000, icon: "🧠", color: "bg-red-100 border-red-200" },
  { name: "Project Capstone", level: "expert", xp: 1500, icon: "🚀", color: "bg-purple-100 border-purple-200" },
];

export default function StudentProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProgress(),
      getMyTasks(),
    ])
      .then(([p, t]) => {
        setProgress(p);
        setTasks(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const userLevel = user?.level || Math.floor((progress?.xpTotal || 0) / 500) + 1;
  const nextLevelXp = userLevel * 500;
  const currentLevelXp = (userLevel - 1) * 500;
  const xpProgress = progress ? Math.min(100, ((progress.xpTotal - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100) : 0;

  const completedTasks = tasks.filter(t => t.status === "graded").length;
  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "submitted").length;

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const stats = [
    { label: "Total XP", value: progress?.xpTotal?.toLocaleString() || "0", icon: Lightning, color: "text-brand", bg: "bg-ink text-white" },
    { label: "Current Rank", value: `#${progress?.rankGlobal || "—"}`, icon: Trophy, color: "text-white", bg: "bg-gradient-to-br from-orange-500 to-red-500 text-white" },
    { label: "Streak", value: `${progress?.streakCurrent || 0} days`, icon: Fire, color: "text-orange-600", bg: "bg-gradient-to-br from-orange-100 to-yellow-50" },
    { label: "Tasks Done", value: `${completedTasks}`, icon: Target, color: "text-[#7c3aed]", bg: "bg-gradient-to-br from-purple-100 to-violet-50" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-2">
          <TrendUp weight="fill" /> Analytics
        </div>
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">My Progress</h1>
        <p className="text-zinc-500 font-medium">Track your XP, level, skills, and achievements.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} rounded-[2rem] p-6 shadow-sm flex flex-col group hover:scale-[1.02] transition-transform`}>
            <stat.icon size={32} weight="duotone" className={`${stat.color} mb-3`} />
            <div className={`text-3xl font-black mb-1`}>{stat.value}</div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${stat.bg.includes('text-white') ? 'text-white/70' : 'text-zinc-500'}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Level Progress */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
          <h2 className="text-xl font-display font-black text-zinc-900 mb-6 flex items-center gap-2">
            <Star weight="fill" className="text-yellow-500" /> Level {userLevel}
          </h2>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-black text-zinc-900">{Math.round(xpProgress)}%</span>
            <span className="text-sm text-zinc-400 font-medium">to Level {userLevel + 1}</span>
          </div>
          <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-brand to-yellow-400 rounded-full transition-all" style={{ width: `${xpProgress}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-zinc-500 font-medium">
            <span>{currentLevelXp.toLocaleString()} XP</span>
            <span>{nextLevelXp.toLocaleString()} XP</span>
          </div>
          <div className="mt-6 pt-6 border-t border-black/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500">Quizzes Completed</span>
              <span className="text-sm font-black text-zinc-900">{progress?.completedQuizzes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500">Tasks Submitted</span>
              <span className="text-sm font-black text-zinc-900">{progress?.submittedTasks || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500">Sessions Attended</span>
              <span className="text-sm font-black text-zinc-900">{progress?.attendanceCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Skill Tree */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
          <h2 className="text-xl font-display font-black text-zinc-900 mb-6 flex items-center gap-2">
            <Cpu weight="fill" className="text-brand" /> Skill Tree
          </h2>
          <div className="space-y-2">
            {SKILL_TREE.map((skill, idx) => {
              const unlocked = (progress?.xpTotal || 0) >= skill.xp;
              return (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  unlocked ? skill.color : 'bg-zinc-50 border-zinc-100 opacity-50'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    unlocked ? 'bg-white shadow-sm' : 'bg-zinc-200 grayscale'
                  }`}>
                    {unlocked ? skill.icon : <LockKey size={16} className="text-zinc-400" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-black ${unlocked ? 'text-zinc-900' : 'text-zinc-500'}`}>{skill.name}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${unlocked ? 'text-zinc-400' : 'text-zinc-400'}`}>
                      {skill.level} · {skill.xp} XP required
                    </div>
                  </div>
                  {unlocked && <CheckCircle size={20} weight="fill" className="text-green-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges & Recent Evaluations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-black text-zinc-900">Earned Badges</h2>
            <Link href="/dashboard/achievements" className="text-xs font-bold text-brand flex items-center gap-1 hover:underline">
              View All <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(progress?.badges || []).slice(0, 8).map((badge) => {
              const fullBadge = SKILL_TREE.find(s => s.name === badge.name);
              return (
                <div key={badge.id} className="bg-brand/5 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-brand/10 transition-colors">
                  <div className="text-3xl mb-2">{fullBadge?.icon || "🏅"}</div>
                  <div className="text-[10px] font-black leading-tight text-zinc-700">{badge.name}</div>
                </div>
              );
            })}
            {(progress?.badges || []).length === 0 && (
              <div className="col-span-4 text-center py-8">
                <Star size={32} weight="duotone" className="text-zinc-300 mx-auto mb-3" />
                <p className="text-xs text-zinc-500 font-medium mb-4">No badges earned yet</p>
                <Link href="/dashboard/achievements" className="text-xs font-bold text-brand hover:underline">
                  Explore Badges
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
          <h2 className="text-xl font-display font-black text-zinc-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {tasks.filter(t => t.status === "graded").slice(0, 5).map((task) => (
              <div key={task.id} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 border border-black/5">
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">{task.title}</h4>
                  <p className="text-xs text-zinc-500 font-medium flex items-center gap-1 mt-1">
                    <Clock size={12} /> Due {task.dueAt}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-green-600">{task.score}/{task.maxScore}</div>
                  <div className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full inline-block mt-1">+{task.xpReward} XP</div>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === "graded").length === 0 && (
              <p className="text-zinc-400 text-sm font-medium text-center py-4">No graded tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Link href="/quiz" className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
          <PencilSimple size={28} weight="bold" />
          <span className="text-xs font-black uppercase tracking-widest">Take Quiz</span>
        </Link>
        <Link href="/playground" className="bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl p-6 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
          <Code size={28} weight="bold" />
          <span className="text-xs font-black uppercase tracking-widest">Code Playground</span>
        </Link>
        <Link href="/dashboard/sessions" className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
          <Clock size={28} weight="bold" />
          <span className="text-xs font-black uppercase tracking-widest">My Sessions</span>
        </Link>
        <Link href="/dashboard/achievements" className="bg-gradient-to-br from-emerald-500 to-green-700 rounded-2xl p-6 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
          <Trophy size={28} weight="bold" />
          <span className="text-xs font-black uppercase tracking-widest">Badges</span>
        </Link>
      </div>
    </div>
  );
}
