"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "./breadcrumb";
import { BookOpen, GraduationCap, LayoutDashboard, Shield, Wallet } from "lucide-react";

const PAGE_TITLES: Record<string, { title: string; description?: string; icon?: React.ReactNode }> = {
  "/dashboard/admin":                   { title: "Vue d'ensemble",       description: "Tableau de bord de l'établissement",   icon: <LayoutDashboard size={18} /> },
  "/dashboard/admin/equipe":            { title: "Gestion de l'équipe",  description: "Gérer les comptes utilisateurs",        icon: <GraduationCap size={18} /> },
  "/dashboard/admin/configuration":     { title: "Configuration",         description: "Paramètres de l'établissement",        icon: <Shield size={18} /> },
  "/dashboard/admin/audit":             { title: "Journal d'audit",       description: "Historique des actions",               icon: <Shield size={18} /> },
  "/dashboard/comptable":               { title: "Tableau de bord financier", description: "Suivi des paiements et dépenses",  icon: <Wallet size={18} /> },
  "/dashboard/comptable/paiements":     { title: "Paiements",             description: "Enregistrer et suivre les paiements",  icon: <Wallet size={18} /> },
  "/dashboard/comptable/impayes":       { title: "Impayés",               description: "Élèves en retard de paiement" },
  "/dashboard/comptable/depenses":      { title: "Dépenses",              description: "Gestion des dépenses" },
  "/dashboard/censeur":                 { title: "Scolarité",             description: "Vue d'ensemble de la scolarité" },
  "/dashboard/censeur/eleves":          { title: "Gestion des élèves",    description: "Liste et suivi des élèves" },
  "/dashboard/censeur/eleves/nouveau":  { title: "Nouvel élève",           description: "Inscrire un élève dans l'établissement" },
  "/dashboard/censeur/notes":           { title: "Saisie des notes",      description: "Enregistrer les notes par séquence",   icon: <BookOpen size={18} /> },
  "/dashboard/censeur/bulletins":       { title: "Bulletins",             description: "Génération des bulletins" },
  "/dashboard/censeur/absences":        { title: "Absences",              description: "Suivi des absences" },
  "/dashboard/censeur/emplois-du-temps":{ title: "Emplois du temps",      description: "Planning des cours" },
  "/dashboard/professeur":              { title: "Espace enseignant",     description: "Vue d'ensemble de l'enseignant" },
  "/dashboard/professeur/notes":        { title: "Mes notes",             description: "Saisie des notes" },
  "/dashboard/professeur/absences":     { title: "Absences",              description: "Signalement des absences" },
  "/dashboard/professeur/cours":        { title: "Mes cours",             description: "Liste des cours" },
  "/dashboard/eleve":                   { title: "Mon espace",            description: "Tableau de bord élève" },
  "/dashboard/eleve/documents":         { title: "Mes documents",         description: "Documents personnels" },
};

const ROLE_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  SUPER_ADMIN: {
    label: "Administrateur",
    dot: "bg-indigo-400",
    pill: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20",
  },
  COMPTABLE: {
    label: "Comptable",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
  },
  CENSEUR: {
    label: "Censeur",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20",
  },
  PROFESSEUR: {
    label: "Professeur",
    dot: "bg-violet-400",
    pill: "bg-violet-50 text-violet-600 ring-1 ring-violet-500/20",
  },
  ELEVE: {
    label: "Élève",
    dot: "bg-sky-400",
    pill: "bg-sky-50 text-sky-600 ring-1 ring-sky-500/20",
  },
};

function getPageInfo(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return { title: last.charAt(0).toUpperCase() + last.slice(1), description: undefined };
}

function formatDate(): string {
  const d = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export function DashboardHeader({ role }: { role: string }) {
  const pathname = usePathname();
  const page = getPageInfo(pathname);
  const rc = ROLE_CONFIG[role] ?? {
    label: role,
    dot: "bg-slate-400",
    pill: "bg-slate-50 text-slate-600 ring-1 ring-slate-500/20",
  };

  return (
    <div className="space-y-3 pb-2">
      <Breadcrumb />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-black tracking-[-0.03em] text-slate-900 leading-tight truncate">
            {page.title}
          </h1>
          {page.description ? (
            <p className="text-[0.8125rem] text-slate-400 mt-0.5 font-medium">{page.description}</p>
          ) : (
            <p className="text-[0.8125rem] text-slate-400 mt-0.5 font-medium">{formatDate()}</p>
          )}
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.75rem] font-semibold shrink-0 mt-0.5 ${rc.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
          {rc.label}
        </span>
      </div>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-slate-200/80 via-slate-200/40 to-transparent" />
    </div>
  );
}
