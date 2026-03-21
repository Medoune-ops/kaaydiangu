import { auth } from "@/auth";
import Link from "next/link";
import {
  Users,
  PenLine,
  BarChart3,
  Calendar,
  Clock,
} from "lucide-react";

export default async function CenseurPage() {
  const session = await auth();

  const links = [
    {
      href: "/dashboard/censeur/eleves",
      label: "Gestion des élèves",
      description: "Inscrire et gérer les élèves de l'établissement",
      icon: <Users size={22} />,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-50",
      accent: "linear-gradient(90deg, #6366f1, #818cf8)",
    },
    {
      href: "/dashboard/censeur/notes",
      label: "Saisie des notes",
      description: "Saisir et gérer les notes de toutes les classes",
      icon: <PenLine size={22} />,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50",
      accent: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
    },
    {
      href: "/dashboard/censeur/bulletins",
      label: "Bulletins de notes",
      description: "Générer et télécharger les bulletins par classe et séquence",
      icon: <BarChart3 size={22} />,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
      accent: "linear-gradient(90deg, #a855f7, #c084fc)",
    },
    {
      href: "/dashboard/censeur/absences",
      label: "Suivi des absences",
      description: "Consulter et justifier les absences des élèves",
      icon: <Calendar size={22} />,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
      accent: "linear-gradient(90deg, #f59e0b, #fbbf24)",
    },
    {
      href: "/dashboard/censeur/emplois-du-temps",
      label: "Emplois du temps",
      description: "Gérer les emplois du temps de chaque classe",
      icon: <Clock size={22} />,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
      accent: "linear-gradient(90deg, #22c55e, #4ade80)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-neutral-500 text-sm">
          Bienvenue, <span className="font-medium text-neutral-700">{session?.user.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="dash-action-card p-6 group"
            style={{ "--card-accent": link.accent } as React.CSSProperties}
          >
            <div className={`w-12 h-12 rounded-xl ${link.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <span className={link.iconColor}>{link.icon}</span>
            </div>
            <h3 className="text-[15px] font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors">
              {link.label}
            </h3>
            <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
