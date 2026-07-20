"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const reduce = useReducedMotion();

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateX(40px) scale(0.95)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateX(0px) scale(1)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateX(40px) scale(0.95)", transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card"
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                  t.type === "success" && "bg-[color:var(--c-income)]/15 text-primary",
                  t.type === "error" && "bg-[color:var(--c-bills)]/15 text-[color:var(--c-bills)]",
                  t.type === "info" && "bg-accent/15 text-accent"
                )}
              >
                {t.type === "success" && <CheckCircle2 size={18} />}
                {t.type === "error" && <AlertTriangle size={18} />}
                {t.type === "info" && <Info size={18} />}
              </span>
              <span className="flex-1 text-sm font-medium text-ink">{t.message}</span>
              <button
                onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))}
                className="text-muted hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

