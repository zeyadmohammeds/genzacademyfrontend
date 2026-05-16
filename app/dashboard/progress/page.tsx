"use client";

import { Trophy, Star, Target, TrendUp, Lightning } from "@phosphor-icons/react";

export default function StudentProgressPage() {
  const stats = [
    { label: "Total XP", value: "2,840", icon: Lightning, color: "text-brand", bg: "bg-ink" },
    { label: "Current Rank", value: "#4", icon: Trophy, color: "text-white", bg: "bg-[#f9644d]" },
    { label: "Streak", value: "12 Days", icon: TrendUp, color: "text-[#0284c7]", bg: "bg-[#c2f0ff]" },
    { label: "Tasks Done", value: "18", icon: Target, color: "text-[#7c3aed]", bg: "bg-[#e4d3ff]" },
  ];

  const badges = [
    { name: "First Blood", desc: "Submitted first task", icon: "🩸", color: "bg-red-100" },
    { name: "Code Ninja", desc: "Perfect score on C++ quiz", icon: "🥷", color: "bg-zinc-900 text-white" },
    { name: "Social Butterfly", desc: "Referred a friend", icon: "🦋", color: "bg-blue-100" },
    { name: "Streak Master", desc: "7 days active streak", icon: "🔥", color: "bg-orange-100" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">My Progress</h1>
        <p className="text-zinc-500 font-medium">Track your XP, rankings, and achievements across the academy.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform`}>
            <stat.icon size={48} weight="duotone" className={`${stat.color} mb-4`} />
            <div className={`text-4xl font-black mb-1 ${stat.bg === 'bg-ink' || stat.bg === 'bg-[#f9644d]' ? 'text-white' : 'text-zinc-900'}`}>{stat.value}</div>
            <div className={`text-xs font-bold uppercase tracking-widest ${stat.bg === 'bg-ink' || stat.bg === 'bg-[#f9644d]' ? 'text-white/70' : 'text-zinc-500'}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
          <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Earned Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((badge, idx) => (
              <div key={idx} className={`${badge.color} rounded-2xl p-4 flex flex-col items-center text-center shadow-sm`}>
                <div className="text-4xl mb-3">{badge.icon}</div>
                <div className="text-xs font-bold leading-tight">{badge.name}</div>
              </div>
            ))}
            {/* Locked Badges */}
            <div className="bg-zinc-100 rounded-2xl p-4 flex flex-col items-center text-center opacity-50 border border-dashed border-zinc-300">
               <div className="text-4xl mb-3 grayscale opacity-50">🏆</div>
               <div className="text-xs font-bold leading-tight text-zinc-500">Locked</div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
          <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Recent Evaluations</h2>
          <div className="space-y-4">
             {[
               { name: "C++ Functions Quiz", score: "100/100", xp: "+200 XP", date: "2 days ago" },
               { name: "Scratch Animation Project", score: "95/100", xp: "+450 XP", date: "1 week ago" },
               { name: "Variables Assignment", score: "80/100", xp: "+150 XP", date: "2 weeks ago" },
             ].map((evalItem, idx) => (
               <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 border border-black/5">
                 <div>
                   <h4 className="font-bold text-zinc-900 text-sm">{evalItem.name}</h4>
                   <p className="text-xs text-zinc-500 font-medium">{evalItem.date}</p>
                 </div>
                 <div className="text-right">
                   <div className="font-black text-green-600">{evalItem.score}</div>
                   <div className="text-xs font-bold text-brand bg-ink px-2 py-0.5 rounded-full inline-block mt-1">{evalItem.xp}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
