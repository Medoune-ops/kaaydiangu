"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, PenLine, BarChart3, Calendar, Clock,
  ChevronRight, Zap, AlertTriangle, TrendingUp,
  Minus, GraduationCap,
} from "lucide-react";

interface CenseurStats {
  nbClasses: number;
  nbEleves: number;
  nbAbsencesNJ: number;
  moyenneEcole: number | null;
  sequenceRef: number;
}

const NAV_LINKS = [
  {
    href: "/dashboard/censeur/eleves",
    label: "Gestion des élèves",
    description: "Inscrire, modifier et suivre les élèves de l'établissement",
    icon: <Users size={24} />,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    accent: "from-indigo-500 to-violet-500",
    hoverShadow: "hover:shadow-indigo-100",
  },
  {
    href: "/dashboard/censeur/notes",
    label: "Saisie des notes",
    description: "Saisir et gérer les notes de toutes les classes",
    icon: <PenLine size={24} />,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    accent: "from-violet-500 to-purple-500",
    hoverShadow: "hover:shadow-violet-100",
  },
  {
    href: "/dashboard/censeur/bulletins",
    label: "Bulletins de notes",
    description: "Générer et télécharger les bulletins par classe et séquence",
    icon: <BarChart3 size={24} />,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    accent: "from-purple-500 to-fuchsia-500",
    hoverShadow: "hover:shadow-purple-100",
  },
  {
    href: "/dashboard/censeur/absences",
    label: "Suivi des absences",
    description: "Consulter et justifier les absences des élèves",
    icon: <Calendar size={24} />,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    accent: "from-amber-400 to-orange-500",
    hoverShadow: "hover:shadow-amber-100",
  },
  {
    href: "/dashboard/censeur/emplois-du-temps",
    label: "Emplois du temps",
    description: "Gérer les emplois du temps de chaque classe",
    icon: <Clock size={24} />,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accent: "from-emerald-400 to-teal-500",
    hoverShadow: "hover:shadow-emerald-100",
  },
];

export function DashboardCenseur({ firstName }: { firstName: string }) {
  const [stats, setStats] = useState<CenseurStats | null>(null);

  useEffect(() => {
    fetch("/api/censeur/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  const absencesOk = !stats || stats.nbAbsencesNJ === 0;

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-6 text-white shadow-lg shadow-amber-500/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute right-20 bottom-0 h-28 w-28 rounded-full bg-orange-300/20 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 top-0 h-20 w-40 rounded-full bg-amber-200/10 blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-amber-200" />
              <span className="text-xs font-semibold text-amber-100 uppercase tracking-widest">Espace Censeur</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              Bonjour, {firstName} !
            </h2>
            <p className="text-amber-100 text-sm mt-1">
              Gérez la scolarité de l&apos;établissement depuis ce tableau de bord.
            </p>
          </div>

          {stats && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
                <p className="text-2xl font-black tabular-nums">{stats.nbEleves}</p>
                <p className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider mt-0.5">élèves actifs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
                <p className="text-2xl font-black tabular-nums">{stats.nbClasses}</p>
                <p className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider mt-0.5">classes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick KPIs ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Effectif */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 border-l-indigo-500
            shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[0.8rem] font-semibold text-slate-500">Effectif total</p>
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><GraduationCap size={16} /></span>
            </div>
            <div className="text-[2rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
              {stats.nbEleves}
            </div>
            <div className="flex items-center gap-1 text-[0.72rem] font-medium mt-2 text-indigo-500">
              <TrendingUp size={11} />
              <span>{stats.nbClasses} classe{stats.nbClasses > 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Absences */}
          <div className={`bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4
            shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] ${
            absencesOk ? "border-l-emerald-500" : "border-l-red-500"
          }`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-[0.8rem] font-semibold text-slate-500">Absences NJ</p>
              <span className={`p-2 rounded-lg ${absencesOk ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                <AlertTriangle size={16} />
              </span>
            </div>
            <div className="text-[2rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
              {stats.nbAbsencesNJ}
            </div>
            <div className={`flex items-center gap-1 text-[0.72rem] font-medium mt-2 ${absencesOk ? "text-emerald-500" : "text-red-500"}`}>
              {absencesOk
                ? <><TrendingUp size={11} /> aucun problème</>
                : <><AlertTriangle size={11} /> à surveiller</>}
            </div>
          </div>

          {/* Moyenne école */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 border-l-violet-500
            shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[0.8rem] font-semibold text-slate-500">Moyenne école</p>
              <span className="p-2 rounded-lg bg-violet-50 text-violet-600"><BarChart3 size={16} /></span>
            </div>
            <div className="text-[2rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
              {stats.moyenneEcole !== null ? stats.moyenneEcole : "—"}
            </div>
            <div className="flex items-center gap-1 text-[0.72rem] font-medium mt-2 text-slate-400">
              <Minus size={11} />
              <span>/20 · Séquence {stats.sequenceRef}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation cards ── */}
      <div>
        <p className="text-[0.75rem] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-3 px-0.5">
          Modules
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative bg-white border border-slate-100/80 rounded-2xl p-6 overflow-hidden
                shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]
                hover:shadow-[0_8px_30px_rgba(15,23,42,0.12)] hover:-translate-y-1
                transition-all duration-300 flex items-start gap-4`}
            >
              {/* Gradient top bar */}
              <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${link.accent}`} />

              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${link.accent} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none`} />

              <div className={`w-14 h-14 rounded-2xl ${link.iconBg} flex items-center justify-center shrink-0
                transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                <span className={link.iconColor}>{link.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-snug">
                  {link.label}
                </h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{link.description}</p>
              </div>

              <ChevronRight
                size={16}
                className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
