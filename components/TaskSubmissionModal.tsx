"use client";

import { useState } from "react";
import { X, Link as LinkIcon, FileText, GithubLogo, UploadSimple } from "@phosphor-icons/react";
import { submitTask } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

type Props = {
  taskId: string;
  taskTitle: string;
  submissionType: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function TaskSubmissionModal({ taskId, taskTitle, submissionType, onClose, onSuccess }: Props) {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!submissionUrl && !submissionText) {
      toast("Provide a URL or text submission", "error");
      return;
    }
    setSaving(true);
    try {
      await submitTask(taskId, "", { submissionUrl: submissionUrl || undefined, repositoryUrl: repositoryUrl || undefined, submissionText: submissionText || undefined });
      toast("Submitted for review!", "success");
      onSuccess();
    } catch {
      toast("Submission failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const showUrl = submissionType === "Link" || submissionType === "Repository" || submissionType === "Image";
  const showRepo = submissionType === "Repository";
  const showText = submissionType === "Text" || submissionType === "File";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-lg shadow-2xl border border-black/5 max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900">Submit Work</h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center shrink-0">
            <X size={18} weight="bold" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <UploadSimple size={14} weight="bold" /> Submission Type: {submissionType}
          </div>

          {showUrl && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <LinkIcon size={12} weight="bold" /> Submission URL
              </label>
              <input value={submissionUrl} onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/your-username/project"
                className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/10 transition-all" />
            </div>
          )}

          {showRepo && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <GithubLogo size={12} weight="bold" /> Repository URL
              </label>
              <input value={repositoryUrl} onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/your-username/repo"
                className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/10 transition-all" />
            </div>
          )}

          {showText && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <FileText size={12} weight="bold" /> Written Response
              </label>
              <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} rows={5}
                placeholder="Paste your response, code, or notes here..."
                className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/10 transition-all resize-none" />
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 border-t border-black/5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
            <UploadSimple size={18} weight="bold" /> {saving ? "Submitting..." : "Submit Work"}
          </button>
        </div>
      </div>
    </div>
  );
}
