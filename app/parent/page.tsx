"use client";

import { useAuth } from "@/lib/auth-context";
import { Student, Clock, Receipt } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getParentDashboard } from "@/lib/api";

export default function ParentDashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParentDashboard().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="w-full px-6 pt-10 text-zinc-500 font-bold">Loading dashboard...</div>;
  }

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Parent Portal</h1>
        <p className="text-zinc-500 font-medium">Welcome back, {user?.displayName?.split(" ")[0] || "Parent"}. Here is an overview of your children's progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {data?.children?.map((child: any, idx: number) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                 <Student size={32} weight="fill" />
               </div>
               <div>
                 <h2 className="text-2xl font-display font-bold text-zinc-900">{child.name}</h2>
                 <p className="text-zinc-500 font-medium">Age {child.age} • {child.xp} XP</p>
               </div>
             </div>
             
             <div className="space-y-4">
                <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5 flex items-center gap-3">
                  <Clock size={24} className="text-zinc-400" />
                  <div>
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Next Session</div>
                    <div className="font-bold text-zinc-900">{child.nextSession}</div>
                  </div>
                </div>
             </div>
             
             <div className="mt-6 flex gap-3">
               <Link href={`/parent/progress/${child.id}`} className="flex-1 px-4 py-3 bg-ink text-canvas text-center rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors">
                 Full Report
               </Link>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-200">
         <div className="flex items-center gap-3 mb-4">
           <Receipt size={28} className="text-orange-500" weight="fill" />
           <h2 className="text-xl font-display font-bold text-orange-900">Pending Invoices</h2>
         </div>
         {data?.pendingInvoices?.length > 0 ? (
           <div className="space-y-3">
             {data.pendingInvoices.map((inv: any, idx: number) => (
               <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border border-orange-100">
                 <div>
                   <div className="font-bold text-zinc-900">{inv.amount}</div>
                   <div className="text-xs text-zinc-500 font-medium">Due: {inv.dueDate}</div>
                 </div>
                 <Link href="/parent/invoices" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors">
                   Pay Now
                 </Link>
               </div>
             ))}
           </div>
         ) : (
           <p className="text-orange-800 text-sm font-medium">All payments are up to date.</p>
         )}
      </div>
    </div>
  );
}
