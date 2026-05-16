"use client";

import { useEffect, useState } from "react";
import { getAllApplications, updateApplicationStatus } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import {
  ClipboardText, ArrowLeft, Check, X, CheckCircle, Funnel, UserCircle
} from "@phosphor-icons/react";

const STATUSES = ["all", "Submitted", "QuestionsPassed", "PaymentPending", "Paid", "UnderReview", "Accepted", "Rejected"];

const FINAL_STATUSES = ["Accepted", "Rejected", "Cancelled"];

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    getAllApplications(statusFilter === "all" ? undefined : statusFilter)
      .then(data => setApps(data.items))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleReview = async (id: string, decision: "Accepted" | "Rejected") => {
    if (!confirm(`${decision === "Accepted" ? "Accept and enroll student" : "Reject this application"}?`)) return;
    try {
      await updateApplicationStatus(id, decision);
      setApps(apps.map(a => a.id === id ? { ...a, status: decision } : a));
      toast(`Application ${decision.toLowerCase()}`, "success");
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8">
        <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={14} weight="bold" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Application Intake</h1>
            <p className="text-zinc-500 font-medium">Review applications, accept/reject, and enroll students.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-black/5">
            <ClipboardText size={20} weight="fill" className="text-brand" />
            <span className="font-bold text-zinc-900">{apps.length}</span>
            <span className="text-sm text-zinc-500">applications</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {STATUSES.map((tab) => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              statusFilter === tab
                ? "bg-zinc-900 text-white shadow-lg"
                : "bg-white text-zinc-500 border border-black/5 hover:bg-zinc-50"
            }`}
          >
            {tab === "all" ? "All" : tab.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {apps.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] py-24 flex items-center justify-center border border-black/5">
            <div className="text-center">
              <CheckCircle size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-zinc-900 mb-1">No Applications</h3>
              <p className="text-zinc-500 text-sm">No applications match this filter.</p>
            </div>
          </div>
        ) : (
          apps.map((app) => {
            const isFinal = FINAL_STATUSES.includes(app.status);
            return (
              <div key={app.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-black/5 hover:border-black/10 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                      <UserCircle size={26} weight="fill" className="text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-zinc-900 truncate">{app.studentName}</h3>
                      <p className="text-xs text-zinc-500 truncate">{app.studentEmail} · {app.courseTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Score</div>
                      <div className="font-bold text-zinc-900 text-sm">{app.applicationScore || '-'}</div>
                    </div>
                    <div className="text-right hidden lg:block">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Submitted</div>
                      <div className="text-xs font-bold text-zinc-600">{app.submittedAt}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                      app.status === "Accepted" ? "bg-green-100 text-green-700" :
                      app.status === "Rejected" ? "bg-red-100 text-red-700" :
                      app.status === "PaymentPending" ? "bg-orange-100 text-orange-700" :
                      app.status === "Paid" ? "bg-blue-100 text-blue-700" :
                      "bg-brand-hover text-zinc-900"
                    }`}>
                      {app.status.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {!isFinal ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleReview(app.id, "Accepted")}
                          className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors"
                          title="Accept & Enroll">
                          <Check size={16} weight="bold" />
                        </button>
                        <button onClick={() => handleReview(app.id, "Rejected")}
                          className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition-colors"
                          title="Reject">
                          <X size={16} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-zinc-200"><CheckCircle size={18} weight="fill" /></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}