"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  BellRinging,
  CheckCircle,
  CaretDown,
  CaretUp,
  Faders,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";

export function NotificationsExperience() {
  const { user } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="w-full max-w-[1100px] mx-auto px-6 lg:px-10 pt-8 pb-24">
        <div className="rounded-[2.5rem] border border-ink/10 bg-canvas p-12 lg:p-16 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand/20 flex items-center justify-center mb-8">
            <Bell size={32} weight="duotone" className="text-ink" />
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-ink tracking-tight mb-4">Sign in for your feed</h1>
          <p className="text-mute font-medium text-lg max-w-md mx-auto mb-10">
            Session changes, payments, and academy broadcasts appear here — tied to your account.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand text-brand-fg font-bold hover:bg-brand-hover transition-colors"
          >
            Sign in <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto px-6 lg:px-10 pt-8 pb-24">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-positive-deep mb-3">Intelligence feed</p>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-ink tracking-tight leading-none">
            Notifications
          </h1>
          <p className="text-mute font-medium mt-4 max-w-xl">
            Full message body, timestamps, and read state — aligned with your channel preferences in profile.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-ink bg-canvas font-bold text-sm text-ink hover:bg-canvas-soft transition-colors"
          >
            <Faders size={18} weight="bold" /> Preferences
          </Link>
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-ink text-canvas font-bold text-sm hover:bg-ink/90 transition-colors"
          >
            <CheckCircle size={18} weight="bold" /> Mark all read
          </button>
        </div>
      </header>

      <div className="space-y-3">
        {loading && (
          <div className="rounded-2xl border border-ink/10 bg-canvas p-10 text-center text-mute font-medium animate-pulse">
            Syncing with the academy API…
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-ink/15 bg-canvas-soft/50 p-16 text-center">
            <Bell size={48} weight="duotone" className="mx-auto text-mute mb-4 opacity-60" />
            <p className="text-ink font-bold text-lg mb-1">You&apos;re all caught up</p>
            <p className="text-mute font-medium text-sm max-w-sm mx-auto">
              When your next session is scheduled or a broadcast goes out, it will land here instantly.
            </p>
          </div>
        )}
        {!loading &&
          notifications.map((n) => {
            const expanded = openId === n.id;
            return (
              <article
                key={n.id}
                className={`rounded-2xl border transition-all ${
                  n.isRead
                    ? "border-ink/10 bg-canvas-soft/40 opacity-90"
                    : "border-brand/30 bg-canvas shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : n.id)}
                  className="w-full text-left p-5 flex gap-4 items-start"
                >
                  <div className="mt-0.5 shrink-0">
                    {n.isRead ? (
                      <CheckCircle size={26} weight="duotone" className="text-positive" />
                    ) : (
                      <BellRinging size={26} weight="duotone" className="text-brand" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-display font-black text-lg text-ink leading-snug">{n.title}</span>
                      {!n.isRead && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand text-brand-fg">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-mute font-medium line-clamp-2">{n.message}</p>
                    <p className="text-[11px] font-semibold text-mute mt-3 uppercase tracking-widest">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0 text-mute pt-1">
                    {expanded ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                  </div>
                </button>
                {expanded && (
                  <div className="px-5 pb-5 pt-0 pl-[4.5rem] pr-5">
                    <div className="rounded-xl bg-canvas-soft/80 border border-ink/10 p-4 text-ink text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {n.message}
                    </div>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        className="mt-4 text-sm font-bold text-brand hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
      </div>
    </div>
  );
}
