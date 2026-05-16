"use client";

import { useState } from "react";
import { broadcastNotification } from "@/lib/api";
import Link from "next/link";
import { MegaphoneSimple, PaperPlaneRight, CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import { useToast } from "@/lib/toast-context";

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<{ title: string; audience: string; date: string }[]>([]);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!title || !body) { toast("Subject and message required", "error"); return; }
    setSending(true);
    try {
      await broadcastNotification(title, body, "info");
      setHistory(prev => [{ title, audience: "All Users", date: "Just now" }, ...prev]);
      setTitle(""); setBody("");
      toast("Broadcast sent to all users", "success");
    } catch (e: any) {
      toast(e.message || "Failed to send", "error");
    } finally { setSending(false); }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8">
        <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={14} weight="bold" /> Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Announcements</h1>
        <p className="text-zinc-500 font-medium">Broadcast messages across the academy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5">
          <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900 mb-4 sm:mb-6 flex items-center gap-2">
            <MegaphoneSimple size={20} weight="duotone" className="text-brand" /> New Broadcast
          </h2>
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Subject</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Platform Maintenance" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none font-bold" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Write your announcement..." className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none resize-none" />
            </div>
            <button onClick={handleSend} disabled={sending} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              <PaperPlaneRight size={18} weight="fill" /> {sending ? "Sending..." : "Send Announcement"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5">
          <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900 mb-4 sm:mb-6">Recent Broadcasts</h2>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <MegaphoneSimple size={40} weight="fill" className="text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-500 font-medium text-sm">No broadcasts sent yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((msg, idx) => (
                <div key={idx} className="p-4 bg-zinc-50 border border-black/5 rounded-2xl">
                  <h4 className="font-bold text-zinc-900">{msg.title}</h4>
                  <div className="text-xs text-zinc-500 font-medium mt-1">Sent to: {msg.audience} · {msg.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}