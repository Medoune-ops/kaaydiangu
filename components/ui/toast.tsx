"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

// ─── Types ───

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

// ─── Context ───

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

// ─── Icons ───

function SuccessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const ICONS: Record<ToastType, () => React.ReactElement> = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
  warning: WarningIcon,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  info: "border-l-blue-500",
  warning: "border-l-orange-500",
};

// ─── Single Toast Item ───

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [state, setState] = useState<"entering" | "visible" | "exiting">("entering");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setState("visible"), 10);

    // Auto-dismiss after 4 seconds
    timerRef.current = setTimeout(() => {
      setState("exiting");
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  function handleClose() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState("exiting");
    setTimeout(() => onDismiss(toast.id), 300);
  }

  const Icon = ICONS[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 w-80 bg-neutral-900 border border-neutral-800 border-l-4 ${BORDER_COLORS[toast.type]}
        rounded-lg px-4 py-3 shadow-xl
        transition-all duration-300 ease-out
        ${state === "entering" ? "translate-x-full opacity-0" : ""}
        ${state === "visible" ? "translate-x-0 opacity-100" : ""}
        ${state === "exiting" ? "translate-x-full opacity-0" : ""}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{toast.description}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300 transition-colors"
        aria-label="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ───

let globalId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${++globalId}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast: addToast, dismiss }}>
      {children}
      {/* Toast container — top right, stacked */}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
