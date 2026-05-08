"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Wallet,
  BarChart3,
  AlertTriangle,
  Clock,
  ChevronRight,
  X,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

interface ClasseInfo {
  id: string;
  nom: string;
  niveau: string;
  effectif: number;
}

interface EleveAbsence {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  absences_non_justifiees: number;
}

interface EleveImpaye {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  mois_impayes: number;
}

interface AdminStats {
  effectifTotal: number;
  classes: ClasseInfo[];
  tauxRecouvrement: number;
  moyenneEcole: number | null;
  sequenceRef: number;
  elevesAbsences: EleveAbsence[];
  nbAbsences: number;
  elevesImpayes: EleveImpaye[];
  nbImpayes: number;
}

type DetailView = "effectif" | "absences" | "impayes" | null;

export function DashboardAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailView>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-500 border-r-indigo-300 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-3 shadow-sm">
        <AlertTriangle size={18} className="text-red-500 shrink-0" />
        <p className="text-sm text-red-600">Erreur lors du chargement des statistiques.</p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Élèves inscrits",
      value: stats.effectifTotal,
      icon: <Users size={20} />,
      detailKey: "effectif" as DetailView,
      iconBg: "bg-gradient-to-br from-indigo-500 to-violet-600",
      iconShadow: "shadow-indigo-400/30",
      bar: "from-indigo-400 to-violet-400",
      hoverShadow: "hover:shadow-[0_6px_24px_rgba(99,102,241,0.13),0_20px_40px_rgba(99,102,241,0.06)]",
      activeBorder: "border-indigo-200",
    },
    {
      label: "Recouvrement",
      value: `${stats.tauxRecouvrement}%`,
      sublabel: "mois courant",
      icon: <Wallet size={20} />,
      detailKey: null as DetailView,
      iconBg: stats.tauxRecouvrement >= 70
        ? "bg-gradient-to-br from-emerald-400 to-teal-500"
        : "bg-gradient-to-br from-amber-400 to-orange-500",
      iconShadow: stats.tauxRecouvrement >= 70 ? "shadow-emerald-400/30" : "shadow-amber-400/30",
      bar: stats.tauxRecouvrement >= 70 ? "from-emerald-400 to-teal-400" : "from-amber-400 to-orange-400",
      hoverShadow: stats.tauxRecouvrement >= 70
        ? "hover:shadow-[0_6px_24px_rgba(16,185,129,0.12),0_20px_40px_rgba(16,185,129,0.05)]"
        : "hover:shadow-[0_6px_24px_rgba(245,158,11,0.12),0_20px_40px_rgba(245,158,11,0.05)]",
      activeBorder: "border-emerald-200",
    },
    {
      label: "Moyenne école",
      value: stats.moyenneEcole !== null ? `${stats.moyenneEcole}/20` : "N/A",
      sublabel: `Séquence ${stats.sequenceRef}`,
      icon: <BarChart3 size={20} />,
      detailKey: null as DetailView,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      iconShadow: "shadow-violet-400/30",
      bar: "from-violet-400 to-purple-400",
      hoverShadow: "hover:shadow-[0_6px_24px_rgba(139,92,246,0.12),0_20px_40px_rgba(139,92,246,0.05)]",
      activeBorder: "border-violet-200",
    },
    {
      label: "Absences",
      value: stats.nbAbsences,
      sublabel: "+3 non justifiées",
      icon: <AlertTriangle size={20} />,
      detailKey: "absences" as DetailView,
      iconBg: stats.nbAbsences > 0
        ? "bg-gradient-to-br from-red-500 to-rose-600"
        : "bg-gradient-to-br from-emerald-400 to-teal-500",
      iconShadow: stats.nbAbsences > 0 ? "shadow-red-400/30" : "shadow-emerald-400/30",
      bar: stats.nbAbsences > 0 ? "from-red-400 to-rose-400" : "from-emerald-400 to-teal-400",
      hoverShadow: stats.nbAbsences > 0
        ? "hover:shadow-[0_6px_24px_rgba(239,68,68,0.12),0_20px_40px_rgba(239,68,68,0.05)]"
        : "hover:shadow-[0_6px_24px_rgba(16,185,129,0.12),0_20px_40px_rgba(16,185,129,0.05)]",
      activeBorder: "border-red-200",
    },
    {
      label: "Impayés",
      value: stats.nbImpayes,
      sublabel: "en retard",
      icon: <Clock size={20} />,
      detailKey: "impayes" as DetailView,
      iconBg: stats.nbImpayes > 0
        ? "bg-gradient-to-br from-orange-500 to-amber-500"
        : "bg-gradient-to-br from-emerald-400 to-teal-500",
      iconShadow: stats.nbImpayes > 0 ? "shadow-orange-400/30" : "shadow-emerald-400/30",
      bar: stats.nbImpayes > 0 ? "from-orange-400 to-amber-400" : "from-emerald-400 to-teal-400",
      hoverShadow: stats.nbImpayes > 0
        ? "hover:shadow-[0_6px_24px_rgba(249,115,22,0.12),0_20px_40px_rgba(249,115,22,0.05)]"
        : "hover:shadow-[0_6px_24px_rgba(16,185,129,0.12),0_20px_40px_rgba(16,185,129,0.05)]",
      activeBorder: "border-orange-200",
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => {
          const isActive = detail === kpi.detailKey;
          return (
            <button
              key={kpi.label}
              onClick={() => kpi.detailKey && setDetail(isActive ? null : kpi.detailKey)}
              disabled={!kpi.detailKey}
              style={{ animationDelay: `${i * 0.07}s` }}
              className={[
                "group relative overflow-hidden text-left w-full",
                "bg-white rounded-2xl p-5",
                "border transition-all duration-300 ease-out",
                isActive
                  ? `${kpi.activeBorder} shadow-[0_0_0_3px_rgba(99,102,241,0.09),0_8px_28px_rgba(99,102,241,0.1)]`
                  : `border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_4px_14px_rgba(15,23,42,0.04)] ${kpi.hoverShadow} hover:border-slate-200 hover:-translate-y-0.5`,
                kpi.detailKey ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              {/* Accent bar */}
              <div className={`absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r ${kpi.bar} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon + chevron */}
              <div className="flex items-start justify-between mb-4">
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md ${kpi.iconBg} ${kpi.iconShadow} transition-transform duration-300 group-hover:scale-[1.06]`}>
                  {kpi.icon}
                </span>
                {kpi.detailKey && (
                  <ChevronRight
                    size={13}
                    className={`mt-0.5 transition-all duration-200 ${
                      isActive ? "rotate-90 text-indigo-400" : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-400"
                    }`}
                  />
                )}
              </div>

              {/* Value */}
              <div className="text-[1.875rem] font-[800] tracking-[-0.045em] text-slate-900 leading-none tabular-nums">
                {kpi.value}
              </div>
              <div className="text-[0.8125rem] font-medium text-slate-500 mt-1.5 leading-none">
                {kpi.label}
              </div>
              {"sublabel" in kpi && kpi.sublabel && (
                <div className="text-[0.72rem] text-slate-400 mt-1 leading-none">{kpi.sublabel}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Charts row ── */}
      {stats.classes.length > 0 && !detail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_4px_14px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
              <h3 className="text-[0.875rem] font-[650] text-slate-800 tracking-tight">
                Effectif par classe
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {stats.classes.map((c) => {
                const maxEffectif = Math.max(...stats.classes.map((cl) => cl.effectif), 1);
                const pct = (c.effectif / maxEffectif) * 100;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-[0.8rem] font-medium text-slate-400 w-20 shrink-0 truncate">
                      {c.nom}
                    </span>
                    <div className="flex-1 bg-slate-100/70 rounded-full h-7 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-end pr-2.5 transition-all duration-700 shadow-[0_2px_8px_rgba(99,102,241,0.22)]"
                        style={{ width: `${Math.max(pct, 14)}%` }}
                      >
                        <span className="text-xs font-bold text-white">{c.effectif}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donut chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_4px_14px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
              <h3 className="text-[0.875rem] font-[650] text-slate-800 tracking-tight">
                Taux de recouvrement
              </h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#rec-grad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${stats.tauxRecouvrement * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="rec-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-[-0.04em] tabular-nums">
                    {stats.tauxRecouvrement}%
                  </span>
                  <span className="text-[0.68rem] text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">
                    collecté
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-5 text-[0.8125rem] text-slate-500 bg-slate-50 rounded-full px-3 py-1.5 border border-slate-100">
                <TrendingUp size={13} className="text-indigo-500" />
                <span>
                  {stats.nbImpayes} élève{stats.nbImpayes > 1 ? "s" : ""} en retard
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail panels ── */}
      {detail === "effectif" && (
        <DetailPanel title="Effectif par classe" onClose={() => setDetail(null)}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Classe</th>
                <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Niveau</th>
                <th className="py-3 px-5 text-right text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Effectif</th>
              </tr>
            </thead>
            <tbody>
              {stats.classes.map((c, i) => (
                <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="py-3 px-5 font-semibold text-slate-800">{c.nom}</td>
                  <td className="py-3 px-5 text-slate-500">{c.niveau}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-[0.8rem] border border-indigo-100/70">
                      {c.effectif}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-indigo-50/40 border-t border-indigo-100/60">
                <td className="py-3 px-5 font-bold text-slate-900" colSpan={2}>Total</td>
                <td className="py-3 px-5 text-right font-bold text-slate-900">{stats.effectifTotal}</td>
              </tr>
            </tbody>
          </table>
        </DetailPanel>
      )}

      {detail === "absences" && (
        <DetailPanel title="Élèves avec +3 absences non justifiées" onClose={() => setDetail(null)}>
          {stats.elevesAbsences.length === 0 ? (
            <EmptyState text="Aucun élève concerné" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Élève</th>
                  <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Matricule</th>
                  <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Classe</th>
                  <th className="py-3 px-5 text-right text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Absences</th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesAbsences.map((e, i) => (
                  <tr key={e.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="py-3 px-5 font-semibold text-slate-800">{e.prenom} {e.nom}</td>
                    <td className="py-3 px-5 text-slate-400 font-mono text-xs">{e.matricule}</td>
                    <td className="py-3 px-5 text-slate-500">{e.classe}</td>
                    <td className="py-3 px-5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg bg-red-50 text-red-600 font-semibold text-[0.8rem] border border-red-100/70">
                        {e.absences_non_justifiees}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DetailPanel>
      )}

      {detail === "impayes" && (
        <DetailPanel title="Élèves en retard de paiement" onClose={() => setDetail(null)}>
          {stats.elevesImpayes.length === 0 ? (
            <EmptyState text="Tous les paiements sont à jour" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Élève</th>
                  <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Matricule</th>
                  <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Classe</th>
                  <th className="py-3 px-5 text-right text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Mois impayés</th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesImpayes.map((e, i) => (
                  <tr key={e.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="py-3 px-5 font-semibold text-slate-800">{e.prenom} {e.nom}</td>
                    <td className="py-3 px-5 text-slate-400 font-mono text-xs">{e.matricule}</td>
                    <td className="py-3 px-5 text-slate-500">{e.classe}</td>
                    <td className="py-3 px-5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 font-semibold text-[0.8rem] border border-amber-100/70">
                        {e.mois_impayes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DetailPanel>
      )}
    </div>
  );
}

function DetailPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_4px_14px_rgba(15,23,42,0.04)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 bg-gradient-to-r from-slate-50/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          <h3 className="text-[0.875rem] font-[650] text-slate-800 tracking-tight">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto overflow-x-auto">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
      <p className="text-[0.875rem] text-slate-500 font-medium">{text}</p>
    </div>
  );
}
