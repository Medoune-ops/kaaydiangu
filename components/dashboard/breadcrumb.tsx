"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Administration",
  comptable: "Comptabilite",
  censeur: "Scolarite",
  professeur: "Enseignement",
  eleve: "Mon espace",
  notes: "Notes",
  eleves: "Eleves",
  paiements: "Paiements",
  depenses: "Depenses",
  bulletins: "Bulletins",
  absences: "Absences",
  cours: "Cours",
  "emplois-du-temps": "Emplois du temps",
  configuration: "Configuration",
  equipe: "Equipe",
  audit: "Journal d'audit",
  impayes: "Impayes",
  documents: "Documents",
  nouveau: "Nouveau",
};

function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-500"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build crumbs: skip "dashboard" as label, use it only for home icon
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;
    return { href, label, segment, isLast };
  });

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {index > 0 && <ChevronIcon />}
          {index === 0 ? (
            // Dashboard = home icon
            <Link
              href={crumb.href}
              className={`flex items-center gap-1 transition-colors duration-150 ${
                crumb.isLast
                  ? "text-white"
                  : "text-neutral-400 hover:text-indigo-400"
              }`}
            >
              <HomeIcon />
              {crumbs.length === 1 && <span>Dashboard</span>}
            </Link>
          ) : crumb.isLast ? (
            <span className="text-white font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-neutral-400 hover:text-indigo-400 transition-colors duration-150"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
