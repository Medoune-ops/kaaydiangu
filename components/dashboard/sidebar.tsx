"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  PenLine,
  FileText,
  Calendar,
  Clock,
  Wallet,
  AlertTriangle,
  Receipt,
  BookOpen,
  FolderOpen,
  Search,
  LogOut,
  GraduationCap,
  X,
  Menu,
  BarChart3,
} from "lucide-react";

/* ─── Types ─── */

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/* ─── Navigation config per role ─── */

const NAV_CONFIG: Record<string, { roleLabel: string; groups: NavGroup[] }> = {
  SUPER_ADMIN: {
    roleLabel: "Administrateur",
    groups: [
      {
        title: "Principal",
        items: [
          { label: "Vue d'ensemble", href: "/dashboard/admin", icon: <LayoutDashboard size={18} /> },
        ],
      },
      {
        title: "Gestion",
        items: [
          { label: "Équipe", href: "/dashboard/admin/equipe", icon: <Users size={18} /> },
          { label: "Configuration", href: "/dashboard/admin/configuration", icon: <Settings size={18} /> },
          { label: "Journal d'audit", href: "/dashboard/admin/audit", icon: <Shield size={18} /> },
        ],
      },
    ],
  },
  CENSEUR: {
    roleLabel: "Censeur",
    groups: [
      {
        title: "Principal",
        items: [
          { label: "Vue d'ensemble", href: "/dashboard/censeur", icon: <LayoutDashboard size={18} /> },
        ],
      },
      {
        title: "Pédagogie",
        items: [
          { label: "Élèves", href: "/dashboard/censeur/eleves", icon: <Users size={18} /> },
          { label: "Notes", href: "/dashboard/censeur/notes", icon: <PenLine size={18} /> },
          { label: "Bulletins", href: "/dashboard/censeur/bulletins", icon: <BarChart3 size={18} /> },
        ],
      },
      {
        title: "Suivi",
        items: [
          { label: "Absences", href: "/dashboard/censeur/absences", icon: <Calendar size={18} /> },
          { label: "Emploi du temps", href: "/dashboard/censeur/emplois-du-temps", icon: <Clock size={18} /> },
        ],
      },
    ],
  },
  COMPTABLE: {
    roleLabel: "Comptable",
    groups: [
      {
        title: "Principal",
        items: [
          { label: "Vue d'ensemble", href: "/dashboard/comptable", icon: <LayoutDashboard size={18} /> },
        ],
      },
      {
        title: "Finances",
        items: [
          { label: "Paiements", href: "/dashboard/comptable/paiements", icon: <Wallet size={18} /> },
          { label: "Impayés", href: "/dashboard/comptable/impayes", icon: <AlertTriangle size={18} /> },
          { label: "Dépenses", href: "/dashboard/comptable/depenses", icon: <Receipt size={18} /> },
        ],
      },
    ],
  },
  PROFESSEUR: {
    roleLabel: "Professeur",
    groups: [
      {
        title: "Principal",
        items: [
          { label: "Vue d'ensemble", href: "/dashboard/professeur", icon: <LayoutDashboard size={18} /> },
        ],
      },
      {
        title: "Enseignement",
        items: [
          { label: "Notes", href: "/dashboard/professeur/notes", icon: <PenLine size={18} /> },
          { label: "Absences", href: "/dashboard/professeur/absences", icon: <Calendar size={18} /> },
          { label: "Cours", href: "/dashboard/professeur/cours", icon: <BookOpen size={18} /> },
        ],
      },
    ],
  },
  ELEVE: {
    roleLabel: "Élève",
    groups: [
      {
        title: "Mon espace",
        items: [
          { label: "Tableau de bord", href: "/dashboard/eleve", icon: <LayoutDashboard size={18} /> },
          { label: "Documents", href: "/dashboard/eleve/documents", icon: <FolderOpen size={18} /> },
        ],
      },
    ],
  },
};

/* ─── Role colors ─── */

const ROLE_COLORS: Record<string, { gradient: string; ring: string; badge: string }> = {
  SUPER_ADMIN: { gradient: "from-indigo-500 to-violet-600", ring: "ring-indigo-400/30", badge: "bg-indigo-500/15 text-indigo-300" },
  COMPTABLE: { gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-400/30", badge: "bg-emerald-500/15 text-emerald-300" },
  CENSEUR: { gradient: "from-amber-500 to-orange-600", ring: "ring-amber-400/30", badge: "bg-amber-500/15 text-amber-300" },
  PROFESSEUR: { gradient: "from-violet-500 to-purple-600", ring: "ring-violet-400/30", badge: "bg-violet-500/15 text-violet-300" },
  ELEVE: { gradient: "from-sky-500 to-cyan-600", ring: "ring-sky-400/30", badge: "bg-sky-500/15 text-sky-300" },
};

/* ─── Sidebar component ─── */

export function Sidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = NAV_CONFIG[role] || NAV_CONFIG.ELEVE;
  const colors = ROLE_COLORS[role] || ROLE_COLORS.ELEVE;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const checkActive = (href: string) => {
    if (pathname === href) return true;
    const roots = ["/dashboard/admin", "/dashboard/censeur", "/dashboard/comptable", "/dashboard/professeur", "/dashboard/eleve"];
    if (roots.includes(href)) return pathname === href;
    return pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a]">
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-80" />

      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-25 group-hover:opacity-45 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap size={20} className="text-white" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight block leading-none">IREF</span>
            <span className="text-[11px] text-slate-500 tracking-wide leading-none mt-0.5 block">Gestion scolaire</span>
          </div>
        </Link>
      </div>

      {/* Search trigger */}
      <div className="px-4 mb-3">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-500 text-[13px] hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-200"
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
          }}
        >
          <Search size={14} />
          <span className="flex-1 text-left">Rechercher...</span>
          <kbd className="hidden sm:inline-flex items-center rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-600/40">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-slate-700/40 mb-2" />

      {/* Navigation groups */}
      <nav className="flex-1 px-3 py-1 space-y-5 overflow-y-auto scrollbar-thin" aria-label="Menu principal">
        {config.groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.14em]">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = checkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 group/nav ${
                      active
                        ? "bg-indigo-500/[0.12] text-white"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-400 shadow-lg shadow-indigo-500/50" />
                    )}
                    <span className={`shrink-0 transition-colors duration-150 ${active ? "text-indigo-400" : "text-slate-500 group-hover/nav:text-slate-400"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 py-3 mt-auto border-t border-slate-700/40">
        <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-xs font-bold ring-2 ${colors.ring} shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-200 truncate">{userName}</p>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors.badge} mt-0.5`}>
              {config.roleLabel}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 shrink-0"
            title="Déconnexion"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-xl border border-neutral-200/80 shadow-sm text-neutral-500 hover:text-neutral-800 hover:shadow-md transition-all duration-200"
        aria-label="Ouvrir le menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-[272px] z-30 shadow-2xl shadow-black/20">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-[272px] z-50 shadow-2xl shadow-black/30 transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
