"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode, useRef } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification as apiBroadcast,
} from "./api";
import { useAuth } from "./auth-context";
import { useSignalr } from "./signalr-context";
import { useToast } from "./toast-context";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  destination?: string;
  createdAt: string;
};

type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  broadcast: (title: string, message: string, type?: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function mapNotification(raw: any): AppNotification {
  const n = raw ?? {};
  return {
    id: String(n.id ?? n.notificationId ?? ""),
    title: String(n.subject ?? n.title ?? ""),
    message: String(n.body ?? n.message ?? ""),
    type: String(n.type ?? "info"),
    isRead: n.status !== "Unread" && n.status !== undefined ? true : Boolean(n.isRead),
    destination: n.destination ? String(n.destination) : undefined,
    createdAt: String(n.createdAt ?? ""),
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { connected } = useSignalr();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    lastFetchRef.current = Date.now();
    setLoading(true);
    try {
      const data = await getNotifications();
      const items = Array.isArray(data) ? data : (data as any).items ?? [];
      setNotifications(items.map(mapNotification));
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Listen for SignalR real-time notifications
  useEffect(() => {
    if (!user) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      const n = mapNotification(detail);
      setNotifications(prev => [n, ...prev]);
      toast(`${n.title}: ${n.message}`, "info");
    };
    window.addEventListener("signalr-notification", handler);
    return () => window.removeEventListener("signalr-notification", handler);
  }, [user, toast]);

  // Fallback polling when SignalR is disconnected
  useEffect(() => {
    refresh();
    if (connected) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh, connected]);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark all read", e);
    }
  };

  const broadcast = async (title: string, message: string, type = "info") => {
    await apiBroadcast(title, message, type);
    await refresh();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, broadcast, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
}
