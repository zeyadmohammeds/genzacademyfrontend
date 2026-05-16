"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/lib/api";
import Link from "next/link";
import { ChartBar, TrendUp, Student, Users, MoneyWavy, BookOpen, ClipboardText, ArrowLeft } from "@phosphor-icons/react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const kpis = [
    { label: "Active Students", value: data?.activeStudents ?? 0, icon: Student, color: "bg-blue-100 text-blue-600" },
    { label: "Total Revenue", value: `${((data?.totalRevenue ?? 0) / 1000).toFixed(1)}K`, suffix: "EGP", icon: MoneyWavy, color: "bg-green-100 text-green-600" },
    { label: "Active Courses", value: data?.totalCourses ?? 0, icon: BookOpen, color: "bg-purple-100 text-purple-600" },
    { label: "Pending Applications", value: data?.pendingApplications ?? 0, icon: ClipboardText, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-10">
        <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={14} weight="bold" /> Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Platform Analytics</h1>
        <p className="text-zinc-500 font-medium">Deep insights into academy performance, engagement, and growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {kpis.map((kpi) => (
           <div key={kpi.label} className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-black/5">
               <div className={`w-10 h-10 sm:w-12 sm:h-12 ${kpi.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                <kpi.icon size={24} weight="fill" />
              </div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{kpi.label}</div>
              <div className="text-3xl font-black text-zinc-900 flex items-end gap-3">
                {kpi.value}{kpi.suffix && <span className="text-sm font-bold text-zinc-400">{kpi.suffix}</span>}
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5">
          <h3 className="font-display text-lg sm:text-xl font-bold text-zinc-900 mb-4 sm:mb-6">Monthly Performance</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-black/5">
              <span className="font-medium text-zinc-600">Monthly Revenue</span>
              <span className="font-black text-zinc-900 text-xl">{data?.monthlyRevenue ?? 0} EGP</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-black/5">
              <span className="font-medium text-zinc-600">Monthly Enrollments</span>
              <span className="font-black text-zinc-900 text-xl">{data?.monthlyEnrollments ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-zinc-600">Total Applications</span>
              <span className="font-black text-zinc-900 text-xl">{data?.totalApplications ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
          <h3 className="font-display text-xl font-bold text-zinc-900 mb-6">Growth Overview</h3>
          <div className="h-40 flex items-center justify-center">
            <div className="text-center">
              <TrendUp size={48} weight="fill" className="text-brand mx-auto mb-2 opacity-50" />
              <p className="text-zinc-500 font-medium">Data visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
