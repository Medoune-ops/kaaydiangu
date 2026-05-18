"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PenLine, Calendar, BookOpen,
  ChevronRight, Zap, Users, Layers,
  TrendingUp,
} from "lucide-react";

interface Matiere {
  id: string;
  nom: string;
  classe: { id: string; nom: string; niveau: string };
}

const NAV_LINKS = [
  {
    href: "/dashboard/professeur/notes",
    label: "Saisie des notes",
    description: "Saisir et gérer les notes de vos élèves par séquence",
    icon: <PenLine size={24} />,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    href: "/dashboard/professeur/absences",
    label: "Pointage des absences",
    description: "Marquer et suivre les absences lors de vos cours",
    icon: <Calendar size={24} />,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    accent: "from-amber-400 to-orange-500",
  },
  {
    href: "/dashboard/professeur/cours",
    label: "Dépôt de cours",
    description: "Déposer des supports de cours pour vos élèves",
    icon: <BookOpen size={24} />,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accent: "from-emerald-400 to-teal-500",
  },
];

export function DashboardProfesseur({ firstName }: { firstName: string }) {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/professeur/matieres")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMatieres)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const nbClasses = new Set(matieres.map((m) => m.classe.id)).size;

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 p-6 text-white shadow-lg shadow-violet-500/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute right-20 bottom-0 h-28 w-28 rounded-full bg-violet-300/20 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 top-0 h-20 w-40 rounded-full bg-purple-200/10 blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-violet-200" />
              <span className="text-xs font-semibold text-violet-200 uppercase tracking-widest">Espace Enseignant</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              Bonjour, {firstName} !
            </h2>
            <p className="text-violet-200 text-sm mt-1">
              Gérez vos cours, notes et absences depuis ce tableau de bord.
            </p>
          </div>

          {loaded && matieres.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
                <p className="text-2xl font-black tabular-nums">{matieres.length}</p>
                <p className="text-[10px] text-violet-200 font-semibold uppercase tracking-wider mt-0.5">matières</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
                <p className="text-2xl font-black tabular-nums">{nbClasses}</p>
                <p className="text-[10px] text-violet-200 font-semibold uppercase tracking-wider mt-0.5">classe{nbClasses > 1 ? "s" : ""}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats KPIs ── */}
      {loaded && matieres.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 border-l-violet-500
            shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[0.8rem] font-semibold text-slate-500">Mes matières</p>
              <span className="p-2 rounded-lg bg-violet-50 text-violet-600"><Layers size={16} /></span>
            </div>
            <div className="text-[2rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
              {matieres.length}
            </div>
            <div className="flex items-center gap-1 text-[0.72rem] font-medium mt-2 text-violet-500">
              <TrendingUp size={11} />
              <span>assignées cette année</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 border-l-indigo-500
            shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[0.8rem] font-semibold text-slate-500">Classes encadrées</p>
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><Users size={16} /></span>
            </div>
            <div className="text-[2rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
              {nbClasses}
            </div>
            <div className="flex items-center gap-1 text-[0.72rem] font-medium mt-2 text-indigo-500">
              <TrendingUp size={11} />
              <span>classe{nbClasses > 1 ? "s" : ""} actives</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Matières list (if any) ── */}
      {loaded && matieres.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
            <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Mes matières</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {matieres.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{m.nom}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100/70">
                  {m.classe.nom}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation cards ── */}
      <div>
        <p className="text-[0.75rem] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-3 px-0.5">
          Modules
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative bg-white border border-slate-100/80 rounded-2xl p-6 overflow-hidden
                shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]
                hover:shadow-[0_8px_30px_rgba(15,23,42,0.12)] hover:-translate-y-1
                transition-all duration-300 flex items-start gap-4"
            >
              <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${link.accent}`} />
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
