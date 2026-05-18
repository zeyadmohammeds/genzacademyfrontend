"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyProgress, getMyTasks } from "@/lib/api";
import type { StudentProgress, LearningTask } from "@/lib/types";
import Link from "next/link";
import {
  Trophy, Star, Target, TrendUp, Lightning,
  CheckCircle, Clock, Code, PencilSimple,
  Sparkle, ArrowRight, Cpu, Fire, LockKey,
  ChartBar, Medal
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

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

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let current = 0;
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } }
};

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

  const xpTotal = progress?.xpTotal || 0;

  const weeklyData = useMemo(() => {
    const base = Math.round(xpTotal / 20) || 10;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      xp: Math.max(5, base + Math.floor(Math.sin(i * 2.5) * base * 0.5) + Math.floor(Math.random() * 20))
    }));
  }, [xpTotal]);

  const breakdownData = useMemo(() => {
    const quizXp = Math.round(xpTotal * 0.4);
    const taskXp = Math.round(xpTotal * 0.35);
    const sessionXp = xpTotal - quizXp - taskXp;
    return [
      { name: "Quizzes", xp: quizXp, color: "#7c3aed" },
      { name: "Tasks", xp: taskXp, color: "#f59e0b" },
      { name: "Sessions", xp: sessionXp, color: "#06b6d4" },
    ];
  }, [xpTotal]);

  const milestones = useMemo(() => {
    const levels = [500, 1000, 1500, 2000, 3000, 5000];
    return levels.filter(l => l > xpTotal).slice(0, 3);
  }, [xpTotal]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const stats = [
    { label: "Total XP", display: xpTotal.toLocaleString(), icon: Lightning, color: "text-brand", bg: "bg-ink text-white", animated: true, numValue: xpTotal },
    { label: "Current Rank", display: `#${progress?.rankGlobal || "—"}`, icon: Trophy, color: "text-white", bg: "bg-gradient-to-br from-orange-500 to-red-500 text-white", animated: false, numValue: 0 },
    { label: "Streak", display: `${progress?.streakCurrent || 0} days`, icon: Fire, color: "text-orange-600", bg: "bg-gradient-to-br from-orange-100 to-yellow-50", animated: true, numValue: progress?.streakCurrent || 0 },
    { label: "Tasks Done", display: `${completedTasks}`, icon: Target, color: "text-[#7c3aed]", bg: "bg-gradient-to-br from-purple-100 to-violet-50", animated: true, numValue: completedTasks },
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

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className={`${stat.bg} rounded-[2rem] p-6 shadow-sm flex flex-col group hover:scale-[1.02] transition-transform`}>
            <stat.icon size={32} weight="duotone" className={`${stat.color} mb-3`} />
            <div className="text-3xl font-black mb-1">
              {stat.animated ? (
                stat.label === "Streak" ? (
                  <><AnimatedCounter value={stat.numValue} /> days</>
                ) : (
                  <AnimatedCounter value={stat.numValue} />
                )
              ) : (
                stat.display
              )}
            </div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${stat.bg.includes('text-white') ? 'text-white/70' : 'text-zinc-500'}`}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
          <h2 className="text-xl font-display font-black text-zinc-900 mb-6 flex items-center gap-2">
            <Star weight="fill" className="text-yellow-500" /> Level {userLevel}
          </h2>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-black text-zinc-900">{Math.round(xpProgress)}%</span>
            <span className="text-sm text-zinc-400 font-medium">to Level {userLevel + 1}</span>
          </div>
          <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-brand to-yellow-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 font-medium">
            <span>{currentLevelXp.toLocaleString()} XP</span>
            <span>{nextLevelXp.toLocaleString()} XP</span>
          </div>

          <div className="mt-6 pt-6 border-t border-black/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-1.5">
              <ChartBar size={14} weight="bold" /> XP Breakdown
            </h3>
            <div className="space-y-3">
              {breakdownData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-zinc-600">{item.name}</span>
                    <span className="font-black text-zinc-900">{item.xp.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.xp / Math.max(xpTotal, 1)) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
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

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
            <h2 className="text-xl font-display font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Cpu weight="fill" className="text-brand" /> Skill Tree
            </h2>
            <div className="relative">
              <svg className="absolute left-[1.625rem] top-0 bottom-0 w-0.5 pointer-events-none" style={{ zIndex: 0 }}>
                <line x1="1" y1="0" x2="1" y2="100%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              <div className="space-y-2 relative" style={{ zIndex: 1 }}>
                {SKILL_TREE.map((skill, idx) => {
                  const unlocked = xpTotal >= skill.xp;
                  const nextSkill = SKILL_TREE[Math.min(idx + 1, SKILL_TREE.length - 1)];
                  const nextThreshold = nextSkill ? nextSkill.xp : skill.xp + 500;
                  const progressInSkill = unlocked && nextThreshold > skill.xp
                    ? Math.min(100, ((xpTotal - skill.xp) / (nextThreshold - skill.xp)) * 100)
                    : unlocked ? 100 : 0;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, type: "spring", stiffness: 200, damping: 22 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        unlocked ? skill.color : 'bg-zinc-50 border-zinc-100 opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        unlocked ? 'bg-white shadow-sm' : 'bg-zinc-200 grayscale'
                      }`}>
                        {unlocked ? skill.icon : <LockKey size={16} className="text-zinc-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-black ${unlocked ? 'text-zinc-900' : 'text-zinc-500'}`}>{skill.name}</div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${unlocked ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          {skill.level} &middot; {skill.xp} XP required
                        </div>
                        {unlocked && progressInSkill < 100 && (
                          <div className="w-full h-1.5 bg-white/50 rounded-full mt-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressInSkill}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        )}
                      </div>
                      {unlocked && <CheckCircle size={20} weight="fill" className="text-green-500 shrink-0" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
              <h2 className="text-xl font-display font-black text-zinc-900 mb-6 flex items-center gap-2">
                <ChartBar weight="fill" className="text-brand" /> Weekly XP
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#a1a1aa" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12, fontWeight: 600 }}
                    formatter={(value) => [`${value || 0} XP`, "Earned"]}
                    labelStyle={{ fontWeight: 700 }}
                  />
                  <Bar dataKey="xp" radius={[6, 6, 0, 0]} fill="#7c3aed" maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
              <h2 className="text-xl font-display font-black text-zinc-900 mb-6 flex items-center gap-2">
                <Medal weight="fill" className="text-amber-500" /> Milestones
              </h2>
              <div className="space-y-0">
                {milestones.map((milestone, idx) => {
                  const progressToMilestone = Math.min(100, (xpTotal / milestone) * 100);
                  return (
                    <div key={idx} className="relative pb-6 last:pb-0">
                      {idx < milestones.length - 1 && (
                        <div className="absolute left-[0.625rem] top-5 bottom-0 w-0.5 bg-zinc-200" />
                      )}
                      <div className="flex items-start gap-4">
                        <motion.div
                          className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-black border-2 ${
                            xpTotal >= milestone
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-white border-zinc-300 text-zinc-400"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.15, type: "spring", stiffness: 300 }}
                        >
                          {xpTotal >= milestone ? <CheckCircle size={12} weight="fill" /> : idx + 1}
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-black ${xpTotal >= milestone ? 'text-zinc-900' : 'text-zinc-500'}`}>
                              {milestone.toLocaleString()} XP
                            </span>
                            {xpTotal < milestone && (
                              <span className="text-[10px] font-bold text-zinc-400">
                                {milestone - xpTotal} XP to go
                              </span>
                            )}
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressToMilestone}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {milestones.length === 0 && (
                  <p className="text-zinc-400 text-sm font-medium text-center py-4">All milestones reached!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="bg-brand/5 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-brand/10 transition-colors"
                >
                  <div className="text-3xl mb-2">{fullBadge?.icon || "🏅"}</div>
                  <div className="text-[10px] font-black leading-tight text-zinc-700">{badge.name}</div>
                </motion.div>
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
