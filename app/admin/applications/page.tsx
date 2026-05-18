"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllApplications, updateApplicationStatus, getApplicationDetails } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { exportToCsv } from "@/lib/csv-export";
import Image from "next/image";
import {
  ClipboardText, ArrowLeft, Check, X, CheckCircle, Funnel, UserCircle, Calendar, DownloadSimple, ImageSquare
} from "@phosphor-icons/react";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUSES = ["all", "Submitted", "QuestionsPassed", "PaymentPending", "Paid", "UnderReview", "Accepted", "Rejected"];
const FINAL_STATUSES = ["Accepted", "Rejected", "Cancelled"];

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [appDetails, setAppDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; decision: "Accepted" | "Rejected" } | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllApplications(statusFilter === "all" ? undefined : statusFilter)
      .then(data => setApps(data?.items ?? []))
      .catch(err => {
        toast(err?.message || "Failed to load applications", "error");
        setApps([]);
      })
      .finally(() => setLoading(false));
  }, [statusFilter, toast]);

  useEffect(() => {
    if (!selectedAppId) {
      setAppDetails(null);
      return;
    }
    setDetailsLoading(true);
    getApplicationDetails(selectedAppId)
      .then(res => setAppDetails(res))
      .catch(() => {
        toast("Failed to load application details", "error");
      })
      .finally(() => setDetailsLoading(false));
  }, [selectedAppId, toast]);

  const handleReview = async (id: string, decision: "Accepted" | "Rejected") => {
    try {
      await updateApplicationStatus(id, decision);
      setApps(apps.map(a => a.id === id ? { ...a, status: decision } : a));
      toast(`Application ${decision.toLowerCase()}`, "success");
      setConfirmAction(null);
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    }
  };

  const handleExport = () => {
    const data = apps.map(a => ({
      "Student Name": a.studentName,
      "Email": a.studentEmail,
      "Course": a.courseTitle,
      "Cohort": a.roundName || "General Admission",
      "Status": a.status,
      "Price EGP": a.amountEgp || a.coursePrice || "",
      "Score": a.applicationScore != null ? `${a.applicationScore}%` : "",
      "Submitted": a.submittedAt,
      "Payment Receipt URL": a.paymentReceiptUrl || "",
      "Application ID": a.id,
    }));
    exportToCsv(data, `applications-${statusFilter}`, {
      "Student Name": "Student Name",
      "Email": "Email",
      "Course": "Course",
      "Status": "Status",
      "Price EGP": "Price (EGP)",
      "Score": "Score",
      "Submitted": "Submitted Date",
      "Payment Receipt URL": "Payment Receipt URL",
      "Application ID": "Application ID",
    });
    toast("Applications exported to CSV", "success");
  };

  if (loading) return <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24"><SkeletonTable rows={6} cols={4} /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24 relative">
      <div className="mb-6 sm:mb-8">
        <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={14} weight="bold" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Application Intake</h1>
            <p className="text-zinc-500 font-medium">Review applications, accept/reject, and enroll students.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-black/5 hover:bg-zinc-50 transition-all text-sm font-bold text-zinc-700 micro-hover">
              <DownloadSimple size={18} weight="bold" /> Export CSV
            </button>
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-black/5">
              <ClipboardText size={20} weight="fill" className="text-brand" />
              <span className="font-bold text-zinc-900">{apps.length}</span>
              <span className="text-sm text-zinc-500">applications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {STATUSES.map((tab) => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap micro-hover ${
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
          <div className="bg-white rounded-[2.5rem] border border-black/5">
            <EmptyState icon={<CheckCircle size={32} weight="fill" />} title="No Applications" description="No applications match this filter." />
          </div>
        ) : (
          apps.map((app) => {
            const isFinal = FINAL_STATUSES.includes(app.status);
            return (
              <div 
                key={app.id} 
                onClick={() => setSelectedAppId(app.id)}
                className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-black/5 hover:border-black/20 hover:shadow-md cursor-pointer transition-all duration-300"
              >
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
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Price</div>
                      <div className="font-bold text-zinc-900 text-sm">{app.amountEgp ? `${app.amountEgp} EGP` : app.coursePrice ? `${app.coursePrice} EGP` : '-'}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Score</div>
                      <div className="font-bold text-zinc-900 text-sm">{app.applicationScore != null ? `${app.applicationScore}%` : '-'}</div>
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
                        <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: app.id, decision: "Accepted" }); }}
                          className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors micro-hover"
                          title="Accept & Enroll">
                          <Check size={16} weight="bold" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: app.id, decision: "Rejected" }); }}
                          className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition-colors micro-hover"
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

      {/* Slide-over Answers Panel */}
      {selectedAppId && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
            onClick={() => setSelectedAppId(null)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl h-full bg-zinc-50 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-500 ease-out border-l border-black/10">
            {/* Header */}
            <div className="p-8 border-b border-black/5 flex items-start justify-between bg-white relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand mb-3 flex items-center gap-2">
                  <span className="w-6 h-px bg-brand"></span> Candidate Review
                </span>
                <h2 className="text-3xl font-display font-black text-zinc-900 tracking-tight leading-none">
                  {detailsLoading ? "Loading Profile..." : appDetails?.studentName || "Candidate Profile"}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedAppId(null)}
                className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors bg-white hover:bg-zinc-50 hover:shadow-sm relative z-10 active:scale-95"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Content Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin shadow-lg shadow-brand/10" />
                  <span className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Retrieving dossier...</span>
                </div>
              ) : appDetails ? (
                <>
                  {/* Student & Cohort Metadata Bento Card */}
                  <div className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Email Address</span>
                        <span className="font-bold text-zinc-900 text-sm break-all">{appDetails.studentEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Applied Course</span>
                        <span className="font-bold text-zinc-900 text-sm">{appDetails.courseTitle}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Target Cohort</span>
                        <span className="font-bold text-zinc-900 text-sm">{appDetails.roundName || "General Admission"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Submission Date</span>
                        <span className="font-bold text-zinc-900 text-sm">{appDetails.submittedAt}</span>
                      </div>
                      <div className="col-span-2 pt-4 border-t border-black/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Screening Score</span>
                        <span className="font-black text-brand text-2xl">{appDetails.applicationScore != null ? `${appDetails.applicationScore}%` : "Pending"}</span>
                      </div>

                      {/* Price & Payment Section */}
                      {appDetails.coursePriceEgp > 0 && (
                        <div className="col-span-2 pt-4 border-t border-black/5">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">Pricing</span>
                          <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-zinc-500">Course Price</span>
                              <span className="text-sm font-black text-zinc-900">{appDetails.coursePriceEgp} EGP</span>
                            </div>
                            {appDetails.discountEgp > 0 && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                                    Discount {appDetails.promoCode ? <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Code: {appDetails.promoCode}</span> : ''}
                                  </span>
                                  <span className="text-sm font-black text-green-600">-{appDetails.discountEgp} EGP</span>
                                </div>
                                {appDetails.discountReason && (
                                  <div className="text-[10px] text-zinc-400 font-medium pl-2">{appDetails.discountReason}</div>
                                )}
                              </>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-black/10">
                              <span className="text-xs font-black text-zinc-700">Total Paid</span>
                              <span className="text-base font-black text-zinc-900">{appDetails.amountPaid || appDetails.coursePriceEgp} EGP</span>
                            </div>
                            {appDetails.paymentMethod && (
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Method</span>
                                <span className="text-xs font-bold text-zinc-600">{appDetails.paymentMethod}</span>
                              </div>
                            )}
                            {appDetails.paymentReference && (
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reference</span>
                                <span className="text-xs font-mono font-bold text-zinc-600">{appDetails.paymentReference}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {appDetails.paymentReceiptUrl && (
                        <div className="col-span-2 pt-4 border-t border-black/5">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">Payment Receipt</span>
                          <a href={appDetails.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video max-w-md rounded-xl overflow-hidden border border-black/10 bg-zinc-100 group">
                            <Image src={appDetails.paymentReceiptUrl} alt="Payment receipt" fill className="object-contain group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="text-white text-xs font-bold bg-black/60 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View Full Image</span>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Answers Section */}
                  <div className="space-y-4">
                    <h3 className="font-display font-black text-zinc-900 text-xl tracking-tight flex items-center gap-3">
                      Evaluation Answers
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg tracking-normal">
                        {appDetails.answers?.length || 0} Questions
                      </span>
                    </h3>
                    
                    {appDetails.answers && appDetails.answers.length > 0 ? (
                      <div className="space-y-4">
                        {appDetails.answers.map((answer: any, idx: number) => (
                          <div key={idx} className="border border-black/5 rounded-[1.5rem] p-6 bg-white shadow-sm space-y-4 transition-all hover:shadow-md hover:border-brand/20">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-3 items-start">
                                <span className="text-[10px] font-black text-brand bg-[#ffe6e6] px-2.5 py-1.5 rounded-lg shrink-0 mt-0.5">Q{idx + 1}</span>
                                <p className="text-sm font-bold text-zinc-900 leading-relaxed">{answer.questionText}</p>
                              </div>
                              {answer.isCorrect !== null && (
                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shrink-0 ${answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {answer.isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              )}
                            </div>
                            
                            <div className="bg-zinc-50 border border-black/5 rounded-[1rem] p-4 ml-11">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Student Response</span>
                              <p className="text-sm font-medium text-zinc-800 break-words leading-relaxed">{answer.answerText || "No answer provided."}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-black/10 rounded-[2rem] p-10 text-center">
                        <p className="text-zinc-400 text-sm font-bold">No application questions were configured.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white border border-dashed border-black/10 rounded-[2rem] p-10 text-center">
                  <p className="text-zinc-500 text-sm font-bold">Failed to retrieve candidate profile.</p>
                </div>
              )}
            </div>

            {/* Footer Review Decision Panel - Sticky */}
            {appDetails && !FINAL_STATUSES.includes(appDetails.status) && (
              <div className="p-6 border-t border-black/5 bg-white flex items-center gap-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
                <button 
                  onClick={() => { setConfirmAction({ id: appDetails.id, decision: "Accepted" }); }}
                  className="flex-1 py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-zinc-900/10 btn-micro"
                >
                  <Check size={18} weight="bold" /> Approve & Enroll
                </button>
                <button 
                  onClick={() => { setConfirmAction({ id: appDetails.id, decision: "Rejected" }); }}
                  className="w-32 py-4 bg-white border border-red-200 hover:border-red-500 text-red-600 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-black/5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                {confirmAction.decision === "Accepted" ? (
                  <CheckCircle size={32} className="text-green-600" weight="fill" />
                ) : (
                  <X size={32} className="text-red-500" weight="bold" />
                )}
              </div>
              <h3 className="text-2xl font-display font-black text-zinc-900 mb-2">
                {confirmAction.decision === "Accepted" ? "Accept & Enroll" : "Reject Application"}
              </h3>
              <p className="text-sm text-zinc-500 font-medium mb-6">
                {confirmAction.decision === "Accepted"
                  ? "This will mark the application as accepted and enroll the student in the course."
                  : "This will reject the application and notify the student."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)} className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-sm transition-all">
                  Cancel
                </button>
                <button onClick={() => handleReview(confirmAction.id, confirmAction.decision)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all text-white ${
                  confirmAction.decision === "Accepted"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}>
                  {confirmAction.decision === "Accepted" ? "Yes, Enroll" : "Yes, Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}