"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { NotificationProvider } from "@/lib/notification-context";
import { CartProvider } from "@/lib/cart-context";
import { CartUiProvider } from "@/lib/cart-ui-context";
import { SignalrProvider } from "@/lib/signalr-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SignalrProvider>
          <NotificationProvider>
            <CartProvider>
              <CartUiProvider>
                <ToastProvider>{children}</ToastProvider>
              </CartUiProvider>
            </CartProvider>
          </NotificationProvider>
        </SignalrProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
