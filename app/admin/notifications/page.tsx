"use client";

import { useState } from "react";
import { Bell, MegaphoneSimple, PaperPlaneRight, ArrowLeft, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { useNotifications } from "@/lib/notification-context";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const { broadcast } = useNotifications();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return;
    setBusy(true);
    try {
      await broadcast(title, body, "info");
      toast("Broadcast dispatched successfully.", "success");
      setTitle("");
      setBody("");
    } catch (e: any) {
      toast(e.message || "Failed to send broadcast.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8">
        <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={14} weight="bold" /> Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Broadcast Orchestration</h1>
        <p className="text-zinc-500 font-medium">Dispatch real-time directives and global announcements across the academy network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 sm:gap-8">
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5">
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900 mb-1 flex items-center gap-2">
                <MegaphoneSimple size={20} weight="duotone" className="text-brand" /> Signal Transmission
              </h2>
              <p className="text-sm text-zinc-500">Execute a global notification to all active student terminals.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Transmission Subject</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Hackathon 2026 is Live!" required className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none font-bold" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Protocol Directive (Message Body)</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Detail the announcement objectives..." rows={6} required className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none resize-none" />
            </div>
            <button disabled={busy} type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              <PaperPlaneRight size={18} weight="fill" /> {busy ? "Broadcasting Signal..." : "Initialize Global Broadcast"}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-hover flex items-center justify-center">
                <Sparkle size={22} weight="duotone" className="text-zinc-900" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Transmission Tip</span>
                <h3 className="font-bold text-zinc-900">Impactful Subject Lines</h3>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">Use concise, action-oriented titles to ensure maximum student engagement on mobile devices.</p>
          </div>

          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Bell size={22} weight="duotone" className="text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Network Protocol</span>
                <h3 className="font-bold text-zinc-900">Channel Saturation</h3>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">Signals are automatically routed via In-App alerts, Push notifications, and Email backups.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
