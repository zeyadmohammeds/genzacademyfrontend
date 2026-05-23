"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRinging, CheckCircle, X, ArrowRight, CaretDown, CaretUp } from "@phosphor-icons/react";
import { useNotifications } from "@/lib/notification-context";
import { useNotificationUi } from "@/lib/notification-ui-context";
import { useState } from "react";

export function NotificationDrawer() {
  const { drawerOpen, closeDrawer } = useNotificationUi();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="notif-drawer-title"
            className="fixed top-0 right-0 z-[201] h-full w-full max-w-md bg-canvas shadow-2xl border-l border-ink/10 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-ink/10 shrink-0">
              <div className="flex items-center gap-3">
                <Bell size={22} weight="duotone" className="text-brand" />
                <h2 id="notif-drawer-title" className="font-display font-black text-lg text-ink">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand text-brand-fg text-[10px] font-black">{unreadCount} new</span>
                )}
              </div>
              <button onClick={closeDrawer} className="w-9 h-9 rounded-xl hover:bg-canvas-soft flex items-center justify-center text-mute hover:text-ink transition-all" aria-label="Close">
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-ink/5 shrink-0">
              <span className="text-[10px] font-bold text-mute uppercase tracking-widest">
                {loading ? "Loading..." : `${notifications.length} notifications`}
              </span>
              {unreadCount > 0 && (
                <button onClick={() => markAllAsRead()} className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1">
                  <CheckCircle size={12} weight="bold" /> Mark all read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading && (
                <div className="p-8 text-center text-mute font-medium text-sm animate-pulse">Syncing...</div>
              )}
              {!loading && notifications.length === 0 && (
                <div className="p-12 text-center">
                  <Bell size={36} weight="duotone" className="mx-auto text-mute mb-3 opacity-50" />
                  <p className="text-ink font-bold mb-1">All caught up</p>
                  <p className="text-mute text-sm">New notifications appear here instantly.</p>
                </div>
              )}
              {!loading && notifications.map((n) => {
                const expanded = openId === n.id;
                return (
                  <div key={n.id} className={`border-b border-ink/5 last:border-b-0 transition-colors ${n.isRead ? '' : 'bg-brand/[0.03]'}`}>
                    <button
                      onClick={() => {
                        setOpenId(expanded ? null : n.id);
                        if (!n.isRead) markAsRead(n.id);
                      }}
                      className="w-full text-left p-4 flex gap-3 items-start hover:bg-canvas-soft/50 transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.isRead ? (
                          <CheckCircle size={18} weight="duotone" className="text-positive" />
                        ) : (
                          <BellRinging size={18} weight="duotone" className="text-brand" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-bold text-sm leading-tight ${n.isRead ? 'text-ink/70' : 'text-ink'}`}>{n.title}</span>
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                        </div>
                        <p className="text-xs text-mute font-medium line-clamp-2">{n.message}</p>
                        <p className="text-[10px] font-semibold text-mute mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="shrink-0 text-mute">{expanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}</div>
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 pl-[3.25rem] flex flex-col gap-2">
                        <div className="rounded-xl bg-canvas-soft border border-ink/10 p-3.5 text-ink text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {n.message}
                        </div>
                        {n.destination && (
                          <Link
                            href={n.destination}
                            onClick={closeDrawer}
                            className="self-start text-xs font-bold text-brand hover:underline flex items-center gap-1 mt-1 bg-brand/5 px-3 py-1.5 rounded-lg border border-brand/10 hover:bg-brand/10 transition-all"
                          >
                            Go to Destination <ArrowRight size={12} weight="bold" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-ink/10 p-4 shrink-0">
              <Link
                href="/notifications"
                onClick={closeDrawer}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ink text-canvas font-bold text-sm hover:bg-ink/90 transition-all"
              >
                View All Notifications <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
