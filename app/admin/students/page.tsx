"use client";

import { useEffect, useState } from "react";
import { getAdminStudents } from "@/lib/api";
import Link from "next/link";
import { Student, Funnel, MagnifyingGlass, UserPlus, ArrowLeft } from "@phosphor-icons/react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminStudents(search || undefined).then(data => setStudents(data.items)).finally(() => setLoading(false));
  }, [search]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Students Registry</h1>
          <p className="text-zinc-500 font-medium">Complete database of all academy students.</p>
        </div>
        <button className="w-full sm:w-fit bg-ink text-canvas px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
          <UserPlus size={18} weight="bold" /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/5">
         <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <MagnifyingGlass size={20} className="text-zinc-400" />
             </div>
             <input 
               type="text" 
               placeholder="Search by name, email, or course..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" 
             />
           </div>
           <button className="px-6 py-3 bg-zinc-50 border border-black/10 rounded-2xl font-bold text-sm text-zinc-700 flex items-center gap-2 hover:bg-zinc-100 transition-colors">
             <Funnel size={18} weight="bold" /> Filters
           </button>
         </div>

         {students.length === 0 ? (
           <div className="text-center py-16">
             <Student size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
             <p className="text-zinc-500 font-medium">No students found.</p>
           </div>
         ) : (
           <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student Info</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Course</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">XP</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Joined</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((stu, idx) => (
                    <tr key={stu.id || idx} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                             <Student size={20} weight="fill" />
                           </div>
                           <div>
                             <div className="font-bold text-zinc-900">{stu.studentName}</div>
                             <div className="text-xs font-medium text-zinc-500 font-mono">{stu.studentEmail}</div>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-700">{stu.courseName}</td>
                      <td className="py-4 px-4 font-bold text-brand">{stu.studentXp || 0}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${stu.enrollmentStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                          {stu.enrollmentStatus || 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-500 text-sm">{stu.createdAt ? new Date(stu.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="py-4 px-4 text-right">
                         <button className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors">Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
         )}
      </div>
    </div>
  );
}
