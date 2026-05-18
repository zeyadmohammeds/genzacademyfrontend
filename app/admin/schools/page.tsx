"use client";

import { useEffect, useState } from "react";
import { getAdminSchools } from "@/lib/api";
import Link from "next/link";
import { Buildings, Plus, ArrowLeft } from "@phosphor-icons/react";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSchools().then(setSchools).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24"><SkeletonTable rows={5} cols={4} /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Partner Schools</h1>
          <p className="text-zinc-500 font-medium">Manage school partnerships and institutional accounts.</p>
        </div>
        <button className="w-full sm:w-auto bg-zinc-900 text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
          <Plus size={18} weight="bold" /> Add School
        </button>
      </div>
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/5">
        {schools.length === 0 ? (
          <EmptyState icon={<Buildings size={32} weight="fill" />} title="No partner schools yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((s, idx) => (
              <div key={s.id || idx} className="p-6 bg-zinc-50 rounded-2xl border border-black/5">
                <h3 className="font-bold text-zinc-900 mb-1">{s.name}</h3>
                <p className="text-sm text-zinc-500 mb-4">{s.activeStudents} active students</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}