"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "./breadcrumb";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/admin": "Administration",
  "/dashboard/admin/equipe": "Gestion de l'equipe",
  "/dashboard/admin/configuration": "Configuration",
  "/dashboard/admin/audit": "Journal d'audit",
  "/dashboard/comptable": "Comptabilite",
  "/dashboard/comptable/paiements": "Paiements",
  "/dashboard/comptable/impayes": "Impayes",
  "/dashboard/comptable/depenses": "Depenses",
  "/dashboard/censeur": "Scolarite",
  "/dashboard/censeur/eleves": "Gestion des eleves",
  "/dashboard/censeur/eleves/nouveau": "Nouvel eleve",
  "/dashboard/censeur/notes": "Saisie des notes",
  "/dashboard/censeur/bulletins": "Bulletins",
  "/dashboard/censeur/absences": "Absences",
  "/dashboard/censeur/emplois-du-temps": "Emplois du temps",
  "/dashboard/professeur": "Enseignement",
  "/dashboard/professeur/notes": "Mes notes",
  "/dashboard/professeur/absences": "Absences",
  "/dashboard/professeur/cours": "Mes cours",
  "/dashboard/eleve": "Mon espace",
  "/dashboard/eleve/documents": "Mes documents",
};

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: {
    label: "Administrateur",
    color: "bg-indigo-500/15 text-indigo-400 ring-indigo-500/20",
  },
  COMPTABLE: {
    label: "Comptable",
    color: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  },
  CENSEUR: {
    label: "Censeur",
    color: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  },
  PROFESSEUR: {
    label: "Professeur",
    color: "bg-violet-500/15 text-violet-400 ring-violet-500/20",
  },
  ELEVE: {
    label: "Eleve",
    color: "bg-sky-500/15 text-sky-400 ring-sky-500/20",
  },
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Fallback: use last segment
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function formatDate(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DashboardHeader({ role }: { role: string }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const roleConfig = ROLE_CONFIG[role] || {
    label: role,
    color: "bg-neutral-500/15 text-neutral-400 ring-neutral-500/20",
  };
  const dateStr = formatDate();
  // Capitalize first letter of date
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="space-y-3">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">{formattedDate}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${roleConfig.color}`}
        >
          {roleConfig.label}
        </span>
      </div>
    </div>
  );
}
