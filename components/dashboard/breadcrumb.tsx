"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Administration",
  comptable: "Comptabilité",
  censeur: "Scolarité",
  professeur: "Enseignement",
  eleve: "Mon espace",
  notes: "Notes",
  eleves: "Élèves",
  paiements: "Paiements",
  depenses: "Dépenses",
  bulletins: "Bulletins",
  absences: "Absences",
  cours: "Cours",
  "emplois-du-temps": "Emplois du temps",
  configuration: "Configuration",
  equipe: "Équipe",
  audit: "Journal d'audit",
  impayes: "Impayés",
  documents: "Documents",
  nouveau: "Nouveau",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;
    return { href, label, segment, isLast };
  });

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={13} className="text-neutral-300 shrink-0" />}
          {index === 0 ? (
            <Link
              href={crumb.href}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${
                crumb.isLast
                  ? "text-neutral-700"
                  : "text-neutral-400 hover:text-indigo-500"
              }`}
            >
              <Home size={14} />
              {crumbs.length === 1 && <span className="font-medium">Dashboard</span>}
            </Link>
          ) : crumb.isLast ? (
            <span className="text-neutral-700 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-neutral-400 hover:text-indigo-500 transition-colors duration-150"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
