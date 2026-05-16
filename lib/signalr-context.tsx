"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { HubConnectionBuilder, HubConnection, LogLevel, HttpTransportType } from "@microsoft/signalr";
import { API_BASE } from "./api";
import { useAuth } from "./auth-context";

type SignalrContextValue = {
  connection: HubConnection | null;
  connected: boolean;
  unreadCount: number;
};

const SignalrContext = createContext<SignalrContextValue>({ connection: null, connected: false, unreadCount: 0 });

export function SignalrProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const connectionRef = useRef<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      connectionRef.current?.stop();
      connectionRef.current = null;
      setConnected(false);
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/notifications`, {
        withCredentials: true,
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("NewNotification", (notification) => {
      window.dispatchEvent(new CustomEvent("signalr-notification", { detail: notification }));
    });

    connection.on("UnreadCount", (count: number) => {
      setUnreadCount(count);
    });

    connection.onreconnecting(() => setConnected(false));
    connection.onreconnected(() => setConnected(true));
    connection.onclose(() => setConnected(false));

    connection.start()
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [user]);

  return (
    <SignalrContext.Provider value={{ connection: connectionRef.current, connected, unreadCount }}>
      {children}
    </SignalrContext.Provider>
  );
}

export function useSignalr() {
  return useContext(SignalrContext);
}
