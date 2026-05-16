"use client";

import { Receipt, DownloadSimple, CheckCircle, Clock } from "@phosphor-icons/react";

export default function ParentInvoicesPage() {
  const invoices = [
    { id: "INV-2026-0042", amount: "600 EGP", date: "May 28, 2026", status: "paid", item: "Intro to C++ Enrollment (Omar)" },
    { id: "INV-2026-0015", amount: "500 EGP", date: "April 15, 2026", status: "paid", item: "Scratch Basics Enrollment (Lina)" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Invoices & Payments</h1>
        <p className="text-zinc-500 font-medium">View your payment history and download receipts.</p>
      </div>

      {/* Pending section if any (currently empty) */}
      <div className="mb-12">
        <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Pending Payments</h2>
        <div className="bg-zinc-50 border border-dashed border-black/10 rounded-[2.5rem] p-8 text-center">
           <div className="w-16 h-16 bg-zinc-200 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle size={32} weight="fill" />
           </div>
           <h3 className="font-bold text-zinc-900 mb-1">All caught up!</h3>
           <p className="text-sm font-medium text-zinc-500">You have no pending invoices at the moment.</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Payment History</h2>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Invoice</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-zinc-900">{inv.item}</div>
                      <div className="text-xs font-medium text-zinc-500 font-mono mt-1">{inv.id}</div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-zinc-600">{inv.date}</td>
                    <td className="py-4 px-4 font-black text-zinc-900">{inv.amount}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        <CheckCircle size={14} weight="fill" /> Paid
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-colors inline-flex">
                         <DownloadSimple size={18} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
