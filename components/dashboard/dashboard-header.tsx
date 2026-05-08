"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "./breadcrumb";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/admin": "Vue d'ensemble",
  "/dashboard/admin/equipe": "Gestion de l'équipe",
  "/dashboard/admin/configuration": "Configuration",
  "/dashboard/admin/audit": "Journal d'audit",
  "/dashboard/comptable": "Tableau de bord financier",
  "/dashboard/comptable/paiements": "Paiements",
  "/dashboard/comptable/impayes": "Impayés",
  "/dashboard/comptable/depenses": "Dépenses",
  "/dashboard/censeur": "Scolarité",
  "/dashboard/censeur/eleves": "Gestion des élèves",
  "/dashboard/censeur/eleves/nouveau": "Nouvel élève",
  "/dashboard/censeur/notes": "Saisie des notes",
  "/dashboard/censeur/bulletins": "Bulletins",
  "/dashboard/censeur/absences": "Absences",
  "/dashboard/censeur/emplois-du-temps": "Emplois du temps",
  "/dashboard/professeur": "Espace enseignant",
  "/dashboard/professeur/notes": "Mes notes",
  "/dashboard/professeur/absences": "Absences",
  "/dashboard/professeur/cours": "Mes cours",
  "/dashboard/eleve": "Mon espace",
  "/dashboard/eleve/documents": "Mes documents",
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

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
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
  const title = getPageTitle(pathname);
  const rc = ROLE_CONFIG[role] ?? {
    label: role,
    dot: "bg-slate-400",
    pill: "bg-slate-50 text-slate-600 ring-1 ring-slate-500/20",
  };

  return (
    <div className="space-y-3 pb-2">
      <Breadcrumb />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-[800] tracking-[-0.035em] text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="text-[0.8125rem] text-slate-400 mt-0.5 font-medium">
            {formatDate()}
          </p>
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
