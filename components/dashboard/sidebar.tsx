"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { ShortcutHint } from "./shortcut-hint";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <IconGrid /> },
    { label: "Équipe", href: "/dashboard/admin/equipe", icon: <IconUsers /> },
    { label: "Configuration", href: "/dashboard/admin/configuration", icon: <IconSettings /> },
    { label: "Audit", href: "/dashboard/admin/audit", icon: <IconClipboard /> },
  ],
  CENSEUR: [
    { label: "Dashboard", href: "/dashboard/censeur", icon: <IconGrid /> },
    { label: "Élèves", href: "/dashboard/censeur/eleves", icon: <IconUsers /> },
    { label: "Saisie des notes", href: "/dashboard/censeur/notes", icon: <IconClipboard /> },
    { label: "Bulletins", href: "/dashboard/censeur/bulletins", icon: <IconChart /> },
    { label: "Absences", href: "/dashboard/censeur/absences", icon: <IconCalendar /> },
    { label: "Emploi du temps", href: "/dashboard/censeur/emplois-du-temps", icon: <IconClock /> },
  ],
  COMPTABLE: [
    { label: "Dashboard", href: "/dashboard/comptable", icon: <IconGrid /> },
    { label: "Paiements", href: "/dashboard/comptable/paiements", icon: <IconWallet /> },
    { label: "Impayés", href: "/dashboard/comptable/impayes", icon: <IconAlert /> },
    { label: "Dépenses", href: "/dashboard/comptable/depenses", icon: <IconReceipt /> },
  ],
  PROFESSEUR: [
    { label: "Dashboard", href: "/dashboard/professeur", icon: <IconGrid /> },
    { label: "Notes", href: "/dashboard/professeur/notes", icon: <IconChart /> },
    { label: "Absences", href: "/dashboard/professeur/absences", icon: <IconCalendar /> },
    { label: "Cours", href: "/dashboard/professeur/cours", icon: <IconBook /> },
  ],
  ELEVE: [
    { label: "Dashboard", href: "/dashboard/eleve", icon: <IconGrid /> },
    { label: "Documents", href: "/dashboard/eleve/documents", icon: <IconFolder /> },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Administrateur",
  COMPTABLE: "Comptable",
  CENSEUR: "Censeur",
  PROFESSEUR: "Professeur",
  ELEVE: "Élève",
};

export function Sidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = NAV_ITEMS[role] || [];

  const toggleSidebar = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Gradient accent strip at top */}
      <div className="sidebar-accent-top" />

      {/* Logo */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-40" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-[18px] font-bold text-white tracking-tight">Mon Ecole</span>
            <div className="text-[10px] text-white/30 tracking-widest uppercase">Espace Admin</div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-6 h-px bg-white/[0.06] mb-1" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 py-2" aria-label="Menu principal">
        <p className="px-3 mb-2 text-[10px] font-bold text-neutral-600 uppercase tracking-[0.15em]">Navigation</p>
        {items.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/admin" && item.href !== "/dashboard/censeur" && item.href !== "/dashboard/comptable" && item.href !== "/dashboard/professeur" && item.href !== "/dashboard/eleve" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? "sidebar-active-glow text-indigo-300"
                  : "text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200"
              }`}
            >
              <span className={`shrink-0 transition-colors duration-200 ${isActive ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-400"}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-[14px]">{item.label}</span>
              {index < 5 && (
                <ShortcutHint keys={`Alt+${index + 1}`} />
              )}
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 mt-auto border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-1">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-30" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-bold">
              {initials}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-100 truncate text-[14px]">{userName}</p>
            <p className="text-xs text-neutral-500 truncate">{ROLE_LABEL[role] || role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl text-neutral-500 hover:bg-red-500/[0.08] hover:text-red-400 hover:border-red-500/10 border border-transparent text-[13px] font-medium transition-all duration-200 w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-[240px] bg-[#0a0a0a] border-r border-white/[0.06] z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-[240px] bg-[#0a0a0a] border-r border-white/[0.06] z-50 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}

// ─── ICONS ───

function IconGrid() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function IconUsers() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconSettings() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
}
function IconClipboard() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
}
function IconChart() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IconCalendar() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconClock() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconWallet() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function IconAlert() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IconReceipt() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/></svg>;
}
function IconBook() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
}
function IconFolder() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
