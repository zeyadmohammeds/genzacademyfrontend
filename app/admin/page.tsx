"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAdminDashboard, getAdminCourses, getAdminPendingApplications } from "@/lib/api";
import type { AdminDashboard, AdminCourse, CourseApplication } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import {
  Books, UsersThree, ChartBar, Bell, ClipboardText,
  MoneyWavy, Sparkle, ArrowRight, CheckCircle, Plus, Calendar,
  ArrowUpRight, CaretRight, GraduationCap
} from "@phosphor-icons/react";
import { CourseIcon } from "@/components/IconMapper";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [dash, setDash] = useState<AdminDashboard | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [pending, setPending] = useState<CourseApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminDashboard().catch(() => null),
      getAdminCourses().catch(() => [] as AdminCourse[]),
      getAdminPendingApplications().catch(() => [] as CourseApplication[])
    ])
      .then(([d, c, p]) => { 
        setDash(d); 
        setCourses(c); 
        setPending(p);
        if (!d && !c.length && !p.length) {
          toast("Could not load dashboard data. Check backend connection.", "error");
        }
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  // ── Derived data ──────────────────────────────────────────
  const courseDemand = dash?.courseDemand ?? [];
  const totalRevenue = dash?.revenueEgp ?? 0;
  const totalPaid = dash?.paidOrders ?? 0;
  const totalStudents = dash?.totalEnrollments ?? 0;

  const revenueTrendPct = totalStudents > 0 ? (totalPaid / totalStudents) * 100 : 0;
  const revenueK = (totalRevenue / 1000).toFixed(1);

  // Intelligence card — calculated from real data
  const enrollCounts = courseDemand.map(d => d.enrollmentCount);
  const avgEnroll = enrollCounts.length > 0
    ? enrollCounts.reduce((a, b) => a + b, 0) / enrollCounts.length
    : 0;
  const maxEnroll = enrollCounts.length > 0 ? Math.max(...enrollCounts) : 0;

  let waitlistDensity = "Low";
  if (maxEnroll > avgEnroll * 1.8) waitlistDensity = "High";
  else if (maxEnroll > avgEnroll * 1.3) waitlistDensity = "Medium";

  const conversionRate = totalStudents > 0
    ? ((totalPaid / totalStudents) * 100).toFixed(1)
    : "0.0";

  const topCourse = courseDemand.length > 0
    ? courseDemand.reduce((best, curr) =>
        curr.enrollmentCount > best.enrollmentCount ? curr : best, courseDemand[0])
    : null;

  const sortedByRevenue = [...courseDemand].sort((a, b) => b.revenueEgp - a.revenueEgp);
  const halfIdx = Math.ceil(sortedByRevenue.length / 2);
  const topHalfRevenue = sortedByRevenue.slice(0, halfIdx).reduce((s, d) => s + d.revenueEgp, 0);
  const totalDemandRevenue = sortedByRevenue.reduce((s, d) => s + d.revenueEgp, 0);
  const concentrationPct = totalDemandRevenue > 0
    ? ((topHalfRevenue / totalDemandRevenue) * 100).toFixed(0)
    : "0";

  let insightText = "No course demand data available yet.";
  if (topCourse && courseDemand.length > 0) {
    const avgRevenuePerCourse = totalDemandRevenue / courseDemand.length;
    if (topCourse.revenueEgp > avgRevenuePerCourse * 1.3) {
      insightText = `"${topCourse.courseTitle}" is outperforming at ${topCourse.enrollmentCount} enrollments. Consider expanding capacity or launching a new session.`;
    } else if (topCourse.enrollmentCount > avgEnroll * 1.5) {
      insightText = `"${topCourse.courseTitle}" shows highest demand at ${topCourse.enrollmentCount} students. Market positioning is strong.`;
    } else {
      insightText = `Enrollment is evenly distributed across ${courseDemand.length} tracks. Revenue concentration is ${concentrationPct}% in the top half.`;
    }
  }

  const kpis = [
    { label: "Revenue", value: `${revenueK}K`, suffix: "EGP", icon: MoneyWavy, color: "text-zinc-900", bg: "bg-brand-hover" },
    { label: "Active Tracks", value: dash?.activeCourses ?? 0, suffix: "Courses", icon: Books, color: "text-[#7c3aed]", bg: "bg-[#e4d3ff]" },
    { label: "Total Students", value: totalStudents, suffix: "Learners", icon: UsersThree, color: "text-[#0284c7]", bg: "bg-[#c2f0ff]" },
    { label: "Applications", value: pending.length, suffix: "Pending", icon: ClipboardText, color: "text-[#e11d48]", bg: "bg-[#ffd5dc]" },
  ];

  return (
    <div className="w-full px-4 sm:px-8 py-6 sm:py-8 lg:px-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-zinc-900 leading-tight">
            Intelligence Center
          </h1>
          <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Synchronized · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/courses" className="flex-1 sm:flex-none px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Plus size={18} weight="bold" /> Build Track
          </Link>
          <Link href="/admin/notifications" className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center relative hover:bg-zinc-50 transition-colors group shrink-0">
            <Bell size={24} weight="bold" className="text-zinc-700 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand border-2 border-white rounded-full"></span>
          </Link>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5, ease: "easeOut" }}
            className={`${kpi.bg} rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5 relative overflow-hidden group hover:shadow-md transition-shadow`}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className={`${kpi.color} bg-white/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl`}>
                  <kpi.icon size={24} weight="fill" />
                </div>
                {idx === 0 && revenueTrendPct > 0 && (
                  <span className="text-xs font-black text-green-600 bg-white/60 px-2 py-1 rounded-full">
                    ↑ {revenueTrendPct.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-4xl font-black text-zinc-900 mb-1">{kpi.value}</span>
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{kpi.label}</span>
              </div>
            </div>
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Intelligence Section */}
      {courseDemand.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-[1.5rem] sm:rounded-[3rem] p-4 sm:p-8 lg:p-10 shadow-sm border border-black/5 mb-12"
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-display font-black text-zinc-900 flex items-center gap-3">
              <MoneyWavy size={24} weight="fill" className="text-brand" />
              Revenue Breakdown
            </h3>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {courseDemand.length} Courses · {totalRevenue.toLocaleString()} EGP Total
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Mini Chart */}
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedByRevenue} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="courseTitle"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 700, fill: "#71717a" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 700, fill: "#71717a" }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    labelStyle={{ fontWeight: 700, fontSize: 12 }}
                    formatter={(value) => [`${Number(value).toLocaleString()} EGP`, "Revenue"]}
                  />
                  <Bar dataKey="revenueEgp" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Revenue Breakdown List */}
            <div className="space-y-1">
              {sortedByRevenue.map((c, i) => {
                const share = totalDemandRevenue > 0 ? ((c.revenueEgp / totalDemandRevenue) * 100).toFixed(1) : "0";
                return (
                  <div key={c.courseId} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[10px] font-black text-zinc-300 w-4 shrink-0">{i + 1}</span>
                      <span className="text-xs font-bold text-zinc-800 truncate">{c.courseTitle}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-black text-zinc-400">{share}%</span>
                      <span className="text-xs font-black text-zinc-900 tabular-nums">{c.revenueEgp.toLocaleString()} EGP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 sm:gap-8">
        
        {/* Active Performance Table */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-[3rem] p-4 sm:p-8 lg:p-10 shadow-sm border border-black/5">
          <div className="flex justify-between items-center mb-4 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-display font-black text-zinc-900">Track Performance</h3>
            <Link href="/admin/courses" className="text-brand text-sm font-bold hover:underline flex items-center gap-1">
              Curriculum View <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[500px] sm:min-w-0 px-4 sm:px-0 space-y-2">
              <div className="grid grid-cols-[1fr_100px_80px_100px] sm:grid-cols-[1fr_120px_100px_100px] px-4 sm:px-6 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>Track Identity</span>
                <span>Level</span>
                <span className="text-center">Active</span>
                <span className="text-right">Investment</span>
              </div>
              
              {courses.slice(0, 6).map((c) => (
                <div key={c.id} className="grid grid-cols-[1fr_100px_80px_100px] sm:grid-cols-[1fr_120px_100px_100px] items-center px-4 sm:px-6 py-4 sm:py-5 rounded-2xl sm:rounded-3xl hover:bg-zinc-50 border border-transparent hover:border-black/5 transition-all group">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0">
                      <CourseIcon iconName={c.iconName} className="w-5 h-5 text-zinc-700" size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-900 text-sm sm:text-base truncate">{c.title}</div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{c.slug}</div>
                    </div>
                  </div>
                  <div>
                    <span className="px-2 sm:px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      {c.level}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${c.isActive ? 'bg-[#0284c7] shadow-[0_0_8px_rgba(2,132,199,0.5)]' : 'bg-zinc-300'}`}></div>
                  </div>
                  <div className="text-right font-display font-black text-zinc-900 text-sm sm:text-base">
                    {c.priceEgp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="flex flex-col gap-8">
          
          {/* Quick Review Card */}
          <div className="bg-ink rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
             <div className="relative z-10">
               <h3 className="text-xl sm:text-2xl font-display font-black mb-6 sm:mb-8 flex items-center gap-3">
                 Review Queue <Sparkle size={24} weight="fill" className="text-brand" />
               </h3>
               
               <div className="space-y-4 mb-8">
                 {pending.length === 0 ? (
                   <div className="text-zinc-500 py-10 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                     <CheckCircle size={32} weight="fill" className="mx-auto mb-2 opacity-20" />
                     <p className="text-sm font-bold">All tasks finalized</p>
                   </div>
                 ) : (
                   pending.slice(0, 3).map((app) => (
                     <div key={app.id} className="bg-white/5 hover:bg-white/10 p-5 rounded-[2rem] border border-white/5 transition-colors group cursor-pointer">
                       <div className="flex justify-between items-start">
                         <div>
                           <div className="font-bold text-sm text-white group-hover:text-brand transition-colors">{app.studentName}</div>
                           <div className="text-xs font-medium text-zinc-400">{app.courseTitle}</div>
                         </div>
                         <CaretRight size={16} weight="bold" className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                       </div>
                     </div>
                   ))
                 )}
               </div>
               
               <Link href="/admin/applications" className="w-full py-4 bg-brand-hover hover:bg-brand-neutral text-zinc-900 rounded-2xl font-bold text-sm text-center transition-all block">
                 Enter Application Flow
               </Link>
             </div>
             <div className="absolute bottom-[-20%] left-[-20%] w-60 h-60 bg-[#7c3aed] rounded-full blur-[100px] opacity-20"></div>
          </div>

          {/* System Insight Card — real data, no hardcoded values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="bg-brand-hover rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-8 shadow-sm border border-brand-hover"
          >
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-zinc-950/10 p-2 rounded-xl">
                  <ChartBar size={24} weight="fill" className="text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Intelligence</h3>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-zinc-900/10 pb-4">
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Waitlist Density</span>
                  <span className={`text-xl font-black ${
                    waitlistDensity === "High" ? "text-red-600" : waitlistDensity === "Medium" ? "text-amber-600" : "text-green-600"
                  }`}>
                    {waitlistDensity}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-zinc-900/10 pb-4">
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Conversion Rate</span>
                  <span className="text-xl font-black text-zinc-900">{conversionRate}%</span>
                </div>
                <div className="flex justify-between items-end border-b border-zinc-900/10 pb-4">
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Revenue Concentration</span>
                  <span className="text-xl font-black text-zinc-900">{concentrationPct}%</span>
                </div>
                <p className="text-xs font-bold text-zinc-700/60 leading-relaxed pt-2">
                  {insightText}
                </p>
             </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
