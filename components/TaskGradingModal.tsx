"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, Star } from "@phosphor-icons/react";
import { gradeTask } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

type GradableSubmission = {
  id: string;
  studentName: string;
  studentEmail: string;
  submissionUrl: string | null;
  repositoryUrl: string | null;
  submissionText: string | null;
  submittedAt: string;
  status: string;
  score: number | null;
  feedback: string | null;
};

type Props = {
  taskTitle: string;
  submissions: GradableSubmission[];
  onClose: () => void;
  onGraded: () => void;
};

export function TaskGradingModal({ taskTitle, submissions, onClose, onGraded }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const sub = submissions[currentIdx];
  if (!sub) return null;

  const handleSubmit = async () => {
    const scoreEmpty = score === "";
    if (scoreEmpty || score < 0) {
      toast("Enter a valid score", "error");
      return;
    }
    setSaving(true);
    try {
      await gradeTask(sub.id, scoreEmpty ? 0 : (score as number), feedback || undefined);
      toast("Grade saved!", "success");
      onGraded();
      if (currentIdx < submissions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setScore("");
        setFeedback("");
      } else {
        onClose();
      }
    } catch {
      toast("Failed to save grade", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-2xl shadow-2xl border border-black/5 max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900">Grade Submission</h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center shrink-0">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-base font-black">
                {sub.studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-zinc-900">{sub.studentName}</p>
                <p className="text-xs text-zinc-500 font-medium">{sub.studentEmail}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{currentIdx + 1} / {submissions.length}</span>
          </div>

          {sub.submissionUrl && (
            <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Submission URL</p>
              <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand underline break-all">{sub.submissionUrl}</a>
            </div>
          )}
          {sub.repositoryUrl && (
            <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Repository URL</p>
              <a href={sub.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand underline break-all">{sub.repositoryUrl}</a>
            </div>
          )}
          {sub.submissionText && (
            <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Written Response</p>
              <pre className="text-sm font-bold text-zinc-900 whitespace-pre-wrap font-mono">{sub.submissionText}</pre>
            </div>
          )}

          <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Star size={12} weight="bold" /> Score (XP)
              </label>
              <input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
                className="w-full max-w-[120px] px-4 py-3 bg-white rounded-xl border border-black/10 font-bold outline-none focus:ring-2 focus:ring-black/10 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <CheckCircle size={12} weight="bold" /> Feedback
              </label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4}
                placeholder="Write constructive feedback..."
                className="w-full px-4 py-3 bg-white rounded-xl border border-black/10 font-bold text-sm outline-none focus:ring-2 focus:ring-black/10 transition-all resize-none" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-black/5 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 underline underline-offset-4">Skip for now</button>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={saving}
              className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg">
              <CheckCircle size={18} weight="bold" /> {saving ? "Saving..." : score !== "" && feedback ? "Submit Grade" : "Save & Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
