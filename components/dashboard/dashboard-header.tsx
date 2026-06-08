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

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: {
    label: "Admin",
    color: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20",
  },
  COMPTABLE: {
    label: "Comptable",
    color: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
  },
  CENSEUR: {
    label: "Censeur",
    color: "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20",
  },
  PROFESSEUR: {
    label: "Professeur",
    color: "bg-violet-50 text-violet-600 ring-1 ring-violet-500/20",
  },
  ELEVE: {
    label: "Élève",
    color: "bg-sky-50 text-sky-600 ring-1 ring-sky-500/20",
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
  const roleConfig = ROLE_CONFIG[role] || {
    label: role,
    color: "bg-neutral-50 text-neutral-600 ring-1 ring-neutral-500/20",
  };

  return (
    <div className="space-y-2">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">{formatDate()}</p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${roleConfig.color}`}
        >
          {roleConfig.label}
        </span>
      </div>
    </div>
  );
}
