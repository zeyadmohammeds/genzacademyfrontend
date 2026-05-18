"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "@phosphor-icons/react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastState = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastState>({ toast: () => {} });

let nextId = 1;

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} weight="fill" className="text-green-600" />,
  error: <XCircle size={18} weight="fill" className="text-red-500" />,
  info: <Info size={18} weight="fill" className="text-blue-500" />,
};

const BG: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  info: "bg-blue-50 border-blue-200",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-bold text-zinc-800 animate-slide-up ${BG[t.type]}`}
            style={{ animation: "slideUpToast 0.3s ease-out" }}
          >
            {ICONS[t.type]}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-40 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideUpToast {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
