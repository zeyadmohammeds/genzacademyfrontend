"use client";

import { useEffect, useState } from "react";
import { getAdminPayments } from "@/lib/api";
import Link from "next/link";
import { MoneyWavy, ArrowLeft, DownloadSimple } from "@phosphor-icons/react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminPayments().then(setPayments).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8">
        <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={14} weight="bold" /> Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Payments</h1>
        <p className="text-zinc-500 font-medium">Track enrollment payments and revenue.</p>
      </div>
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/5">
        {payments.length === 0 ? (
          <div className="text-center py-16">
            <MoneyWavy size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">ID</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Method</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p.id || idx} className="border-b border-black/5 hover:bg-zinc-50">
                    <td className="py-4 px-4 font-mono text-sm font-bold text-zinc-500">{p.id}</td>
                    <td className="py-4 px-4 font-bold text-zinc-900">{p.student}</td>
                    <td className="py-4 px-4 font-bold text-zinc-900">{p.amount}</td>
                    <td className="py-4 px-4 text-zinc-500 text-sm">{p.date}</td>
                    <td className="py-4 px-4 text-zinc-600">{p.method}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</span>
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