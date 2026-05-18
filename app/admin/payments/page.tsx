"use client";

import { useEffect, useState } from "react";
import { getAdminPayments, getPendingPayments, approvePaymentReceipt } from "@/lib/api";
import Link from "next/link";
import { MoneyWavy, ArrowLeft, CheckCircle, Image as ImageIcon } from "@phosphor-icons/react";
import { useToast } from "@/lib/toast-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = () => {
    Promise.all([getAdminPayments(), getPendingPayments()])
      .then(([p, pendingP]) => {
        setPayments(p);
        setPending(pendingP);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (applicationId: string) => {
    setApproving(applicationId);
    try {
      await approvePaymentReceipt(applicationId);
      toast("Payment approved and student enrolled!", "success");
      loadData();
    } catch (e: any) {
      toast(e.message || "Failed to approve payment", "error");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8">
        <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={14} weight="bold" /> Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Payments</h1>
        <p className="text-zinc-500 font-medium">Track enrollment payments and revenue.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-black/5">
          <SkeletonTable rows={6} cols={6} />
        </div>
      ) : (
      <div className="flex flex-col gap-8">
        
        {pending.length > 0 && (
          <div className="bg-brand-hover rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-brand/20">
            <h2 className="font-display text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <ImageIcon size={24} className="text-brand-fg" weight="bold" /> Pending Screenshot Approvals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.map(p => (
                <div key={p.id} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col gap-4 card-lift">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-zinc-900 line-clamp-1">{p.studentName}</h3>
                      <p className="text-xs font-medium text-zinc-500">{p.courseTitle}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{p.paymentMethod}</span>
                  </div>
                  
                  {p.paymentReceiptUrl ? (
                    <a href={p.paymentReceiptUrl} target="_blank" rel="noreferrer" className="block relative h-32 rounded-xl overflow-hidden border border-black/5 group cursor-zoom-in">
                      <img src={p.paymentReceiptUrl} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">View Full Image</span>
                      </div>
                    </a>
                  ) : (
                    <div className="h-32 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center text-xs text-zinc-400 font-bold">No Image</div>
                  )}

                  <div className="flex justify-between items-center mt-2 pt-4 border-t border-black/5">
                    <span className="text-[10px] text-zinc-400 font-medium">{p.submittedAt}</span>
                    <button
                      onClick={() => handleApprove(p.id)}
                      disabled={approving === p.id}
                      className="bg-brand text-brand-fg px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-brand-hover active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 btn-micro"
                    >
                      {approving === p.id ? "Approving..." : <><CheckCircle size={14} weight="bold" /> Approve & Enroll</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-black/5">
          <h2 className="font-display text-xl font-bold text-zinc-900 mb-6">Payment History</h2>
          {payments.length === 0 ? (
            <EmptyState
              icon={<MoneyWavy size={32} className="text-zinc-300" />}
              title="No payment records found"
              description="Payments will appear here once students start enrolling."
            />
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
                  <tr key={p.id || idx} className="border-b border-black/5 row-hover">
                    <td className="py-4 px-4 font-mono text-sm font-bold text-zinc-500">{p.id?.slice?.(0, 8) || p.id}</td>
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
      )}
    </div>
  );
}
