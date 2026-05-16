"use client";

import { useEffect, useState } from "react";
import { getAdminEnrollments } from "@/lib/api";
import Link from "next/link";
import { CheckSquare, Funnel, MagnifyingGlass, Check, X, ArrowLeft, User } from "@phosphor-icons/react";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminEnrollments().then(data => setEnrollments(data.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-10 flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Enrollments</h1>
          <p className="text-zinc-500 font-medium">Manage and review student applications.</p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/5">
         {enrollments.length === 0 ? (
           <div className="text-center py-16">
             <User size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
             <p className="text-zinc-500 font-medium">No enrollments found.</p>
           </div>
         ) : (
           <>
             <div className="flex flex-col md:flex-row gap-4 mb-8">
               <div className="relative flex-1">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <MagnifyingGlass size={20} className="text-zinc-400" />
                 </div>
                 <input type="text" placeholder="Search applications..." className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
               </div>
               <button className="px-6 py-3 bg-zinc-50 border border-black/10 rounded-2xl font-bold text-sm text-zinc-700 flex items-center gap-2 hover:bg-zinc-100 transition-colors">
                 <Funnel size={18} weight="bold" /> Filter
               </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-black/5">
                      <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Course</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Price</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((app, idx) => (
                      <tr key={app.id || idx} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-zinc-900">{app.studentName}</td>
                        <td className="py-4 px-4 text-zinc-500 text-sm">{app.studentEmail}</td>
                        <td className="py-4 px-4 text-zinc-600 font-medium">{app.courseName}</td>
                        <td className="py-4 px-4 font-bold text-zinc-900">{app.finalPriceEgp} EGP</td>
                        <td className="py-4 px-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.enrollmentStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {app.enrollmentStatus || 'Active'}
                           </span>
                        </td>
                        <td className="py-4 px-4 text-zinc-500 text-sm">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </>
         )}
      </div>
    </div>
  );
}
