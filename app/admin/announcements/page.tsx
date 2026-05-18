"use client";

import { useEffect, useState } from "react";
import { MegaphoneSimple, PaperPlaneRight, ArrowLeft, Bell, Sparkle, Users, Student, ChalkboardTeacher, IdentificationBadge } from "@phosphor-icons/react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { useNotifications } from "@/lib/notification-context";
import { getNotifications } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";

type RoleTarget = "all" | "student" | "engineer" | "cta" | "academy_admin" | "parent";

const ROLE_OPTIONS: { value: RoleTarget; label: string; icon: typeof Users; desc: string }[] = [
  { value: "all", label: "All Roles", icon: Users, desc: "Every user on the platform" },
  { value: "student", label: "Students Only", icon: Student, desc: "Active enrolled learners" },
  { value: "engineer", label: "Engineers Only", icon: ChalkboardTeacher, desc: "Engineering team members" },
  { value: "cta", label: "CTAs Only", icon: IdentificationBadge, desc: "Teaching assistants" },
  { value: "academy_admin", label: "Admins Only", icon: MegaphoneSimple, desc: "Platform administrators" },
  { value: "parent", label: "Parents Only", icon: Users, desc: "Parent/guardian accounts" },
];

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState<RoleTarget>("all");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const { broadcast } = useNotifications();

  useEffect(() => {
    getNotifications(1, 20).then(data => {
      const items = Array.isArray(data) ? data : (data as any).items ?? [];
      setHistory(items.slice(0, 10));
    }).catch(() => {});
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return;
    setBusy(true);
    try {
      const prefix = targetRole !== "all" ? `[${targetRole.toUpperCase()}] ` : "";
      await broadcast(prefix + title, body, "info");
      toast("Announcement broadcast dispatched successfully.", "success");
      setTitle("");
      setBody("");
      setTargetRole("all");
    } catch (e: any) {
      toast(e.message || "Failed to send announcement.", "error");
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
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Announcements</h1>
        <p className="text-zinc-500 font-medium">Send role-targeted broadcasts to academy members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 sm:gap-8">
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5">
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900 mb-1 flex items-center gap-2">
                <MegaphoneSimple size={20} weight="duotone" className="text-brand" /> New Broadcast
              </h2>
              <p className="text-sm text-zinc-500">Compose and dispatch an announcement to your selected audience.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Target Audience</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTargetRole(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                        targetRole === opt.value
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-transparent bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <Icon size={18} weight={targetRole === opt.value ? "fill" : "regular"} />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Subject</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Hackathon 2026 is Live!" required className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none font-bold" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Detail the announcement..." rows={6} required className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none resize-none" />
            </div>
            <button disabled={busy} type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              <PaperPlaneRight size={18} weight="fill" /> {busy ? "Dispatching..." : `Send to ${ROLE_OPTIONS.find(r => r.value === targetRole)?.label || "All"}`}
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pro Tip</span>
                <h3 className="font-bold text-zinc-900">Targeted Messaging</h3>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">Use role targeting to send relevant announcements only to specific groups. This reduces notification fatigue and improves engagement.</p>
          </div>

          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5 flex-1">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Bell size={18} weight="duotone" /> Recent Broadcasts
            </h3>
            {history.length === 0 ? (
              <EmptyState icon={<Bell size={28} />} title="No broadcasts yet" description="Your sent announcements will appear here." mini />
            ) : (
              <div className="space-y-3">
                {history.map((n, i) => (
                  <div key={n.id || i} className="p-3 rounded-xl bg-zinc-50 border border-black/5">
                    <div className="text-xs font-bold text-zinc-900 truncate">{n.title || n.subject}</div>
                    <div className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">{n.body || n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}