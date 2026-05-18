"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type NotificationUiContextValue = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const NotificationUiContext = createContext<NotificationUiContextValue | null>(null);

export function NotificationUiProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);

  const value = useMemo(
    () => ({ drawerOpen, openDrawer, closeDrawer, toggleDrawer }),
    [drawerOpen, openDrawer, closeDrawer, toggleDrawer]
  );

  return <NotificationUiContext.Provider value={value}>{children}</NotificationUiContext.Provider>;
}

export function useNotificationUi() {
  const ctx = useContext(NotificationUiContext);
  if (!ctx) throw new Error("useNotificationUi must be used within NotificationUiProvider");
  return ctx;
}
