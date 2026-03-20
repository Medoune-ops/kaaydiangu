import { auth } from "@/auth";
import Link from "next/link";

export default async function ProfesseurPage() {
  const session = await auth();

  const links = [
    {
      href: "/dashboard/professeur/notes",
      label: "Saisie des notes",
      description: "Saisir et gerer les notes de vos eleves",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      ),
      iconBg: "bg-indigo-50",
    },
    {
      href: "/dashboard/professeur/absences",
      label: "Pointage des absences",
      description: "Marquer les absences de vos cours",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ),
      iconBg: "bg-amber-50",
    },
    {
      href: "/dashboard/professeur/cours",
      label: "Depot de cours",
      description: "Deposer des supports de cours pour vos eleves",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
      ),
      iconBg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Tableau de bord</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Bienvenue, {session?.user.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-xl border border-neutral-200 p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 group"
          >
            <div className={`w-12 h-12 rounded-lg ${link.iconBg} flex items-center justify-center mb-4`}>
              {link.icon}
            </div>
            <h3 className="text-base font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors">
              {link.label}
            </h3>
            <p className="text-sm text-neutral-500 mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
