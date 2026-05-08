import { auth } from "@/auth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  PenLine,
  Calendar,
  BookOpen,
} from "lucide-react";

export default async function ProfesseurPage() {
  const session = await auth();

  const links = [
    {
      href: "/dashboard/professeur/notes",
      label: "Saisie des notes",
      description: "Saisir et gérer les notes de vos élèves par séquence",
      icon: <PenLine size={22} />,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      accent: "bg-gradient-to-r from-indigo-500 to-violet-500",
    },
    {
      href: "/dashboard/professeur/absences",
      label: "Pointage des absences",
      description: "Marquer et suivre les absences lors de vos cours",
      icon: <Calendar size={22} />,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      accent: "bg-gradient-to-r from-amber-400 to-orange-500",
    },
    {
      href: "/dashboard/professeur/cours",
      label: "Dépôt de cours",
      description: "Déposer des supports de cours pour vos élèves",
      icon: <BookOpen size={22} />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      accent: "bg-gradient-to-r from-emerald-400 to-teal-500",
    },
  ];

  const firstName = session?.user.name?.split(" ")[0] ?? "Professeur";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 p-6 text-white shadow-lg shadow-violet-500/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute right-16 bottom-0 h-20 w-20 rounded-full bg-violet-300/20 blur-xl" />
        <div className="relative">
          <p className="text-xs font-semibold text-violet-200 uppercase tracking-widest mb-1">Espace Enseignant</p>
          <h2 className="text-2xl font-black tracking-tight">Bonjour, {firstName} !</h2>
          <p className="text-violet-200 text-sm mt-1">Gérez vos cours, notes et absences depuis ce tableau de bord.</p>
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group relative bg-white border border-slate-100/80 rounded-2xl p-6 overflow-hidden
              shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]
              hover:shadow-[0_4px_20px_rgba(15,23,42,0.10)] hover:-translate-y-0.5
              transition-all duration-200 flex items-start gap-4"
          >
            {/* Colored top bar */}
            <div className={`absolute top-0 inset-x-0 h-[3px] ${link.accent}`} />

            <div className={`w-12 h-12 rounded-xl ${link.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
              <span className={link.iconColor}>{link.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                {link.label}
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{link.description}</p>
            </div>

            <ChevronRight
              size={15}
              className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
