"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Clock } from "lucide-react";

interface Notification {
  id: string;
  titre: string;
  message: string;
  lu: boolean;
  type: string | null;
  date_envoi: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function charger() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setNonLues(data.nonLues);
      }
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function marquerLu(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
    setNonLues((prev) => Math.max(0, prev - 1));
  }

  async function toutMarquerLu() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tout_lu: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setNonLues(0);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ring-2 ring-white">
            {nonLues > 99 ? "99+" : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl border border-neutral-200/80 shadow-xl shadow-black/8 z-50 max-h-[480px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <span className="text-sm font-semibold text-neutral-900">Notifications</span>
            {nonLues > 0 && (
              <button
                onClick={toutMarquerLu}
                className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
              >
                <CheckCheck size={13} />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                  <Bell size={18} className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-neutral-50 last:border-b-0 hover:bg-neutral-50/70 transition-colors ${
                    !n.lu ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.lu ? "bg-indigo-100" : "bg-neutral-100"}`}>
                      <TypeIcon type={n.type} unread={!n.lu} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-neutral-900 truncate">
                          {n.titre}
                        </span>
                        {!n.lu && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Clock size={10} />
                          {formatRelative(n.date_envoi)}
                        </span>
                        {!n.lu && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              marquerLu(n.id);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                          >
                            <Check size={11} /> Lu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-neutral-100 px-4 py-2.5 text-center bg-neutral-50/50">
              <span className="text-xs text-neutral-400">
                {notifications.length} notification(s)
                {nonLues > 0 && (
                  <span className="ml-1.5 text-indigo-500 font-medium">
                    • {nonLues} non lue(s)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TypeIcon({ type, unread }: { type: string | null; unread: boolean }) {
  const color = unread ? "text-indigo-500" : "text-neutral-400";
  const size = 14;
  switch (type) {
    case "NOTE":
      return <svg className={color} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "PAIEMENT":
    case "RAPPEL_PAIEMENT":
      return <svg className={color} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    case "BULLETIN":
      return <svg className={color} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
    default:
      return <Bell size={size} className={color} />;
  }
}

function formatRelative(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
