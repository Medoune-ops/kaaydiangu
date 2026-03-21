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
      <div className="flex items-center justify-center py-20">
        <div className="dash-spinner" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dash-section p-5 flex items-center gap-3 border-red-100">
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
      iconBg: "bg-indigo-50 text-indigo-500",
      accent: "#6366f1",
    },
    {
      label: "Recouvrement",
      value: `${stats.tauxRecouvrement}%`,
      sublabel: "mois courant",
      icon: <Wallet size={20} />,
      detailKey: null as DetailView,
      iconBg: stats.tauxRecouvrement >= 70 ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500",
      accent: stats.tauxRecouvrement >= 70 ? "#22c55e" : "#f59e0b",
    },
    {
      label: "Moyenne école",
      value: stats.moyenneEcole !== null ? `${stats.moyenneEcole}/20` : "N/A",
      sublabel: `Séquence ${stats.sequenceRef}`,
      icon: <BarChart3 size={20} />,
      detailKey: null as DetailView,
      iconBg: "bg-violet-50 text-violet-500",
      accent: "#8b5cf6",
    },
    {
      label: "Absences",
      value: stats.nbAbsences,
      sublabel: "+3 non justifiées",
      icon: <AlertTriangle size={20} />,
      detailKey: "absences" as DetailView,
      iconBg: stats.nbAbsences > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500",
      accent: stats.nbAbsences > 0 ? "#ef4444" : "#22c55e",
    },
    {
      label: "Impayés",
      value: stats.nbImpayes,
      sublabel: "en retard",
      icon: <Clock size={20} />,
      detailKey: "impayes" as DetailView,
      iconBg: stats.nbImpayes > 0 ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-500",
      accent: stats.nbImpayes > 0 ? "#f97316" : "#22c55e",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            onClick={() => kpi.detailKey && setDetail(detail === kpi.detailKey ? null : kpi.detailKey)}
            disabled={!kpi.detailKey}
            className={`dash-kpi text-left p-5 ${
              kpi.detailKey ? "cursor-pointer" : "cursor-default"
            } ${detail === kpi.detailKey ? "ring-2 ring-indigo-500/40 !border-indigo-200" : ""}`}
            style={{ "--kpi-accent": kpi.accent } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                {kpi.icon}
              </span>
              {kpi.detailKey && (
                <ChevronRight size={14} className={`text-neutral-300 transition-transform ${detail === kpi.detailKey ? "rotate-90" : ""}`} />
              )}
            </div>
            <div className="text-2xl font-bold text-neutral-900 tracking-tight">{kpi.value}</div>
            <div className="text-sm text-neutral-500 mt-0.5">{kpi.label}</div>
            {kpi.sublabel && <div className="text-xs text-neutral-400 mt-0.5">{kpi.sublabel}</div>}
          </button>
        ))}
      </div>

      {/* Charts row */}
      {stats.classes.length > 0 && !detail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Effectif par classe */}
          <div className="dash-section">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">Effectif par classe</h3>
            </div>
            <div className="p-6 space-y-3">
              {stats.classes.map((c) => {
                const maxEffectif = Math.max(...stats.classes.map((cl) => cl.effectif), 1);
                const pct = (c.effectif / maxEffectif) * 100;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500 w-20 shrink-0 truncate">{c.nom}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-7 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-end pr-2.5 transition-all duration-700"
                        style={{ width: `${Math.max(pct, 12)}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{c.effectif}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recouvrement */}
          <div className="dash-section flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">Taux de recouvrement</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#recouvrement-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${stats.tauxRecouvrement * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="recouvrement-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-neutral-900 tracking-tight">{stats.tauxRecouvrement}%</span>
                  <span className="text-xs text-neutral-400 mt-0.5">collecté</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-sm text-neutral-500">
                <TrendingUp size={14} className="text-indigo-500" />
                <span>{stats.nbImpayes} élève(s) en retard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panels */}
      {detail === "effectif" && (
        <DetailPanel title="Effectif par classe" onClose={() => setDetail(null)}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Classe</th>
                <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Niveau</th>
                <th className="py-3 px-5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Effectif</th>
              </tr>
            </thead>
            <tbody>
              {stats.classes.map((c, i) => (
                <tr key={c.id} className={`border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors ${i % 2 ? "bg-neutral-50/30" : ""}`}>
                  <td className="py-3 px-5 font-medium text-neutral-900">{c.nom}</td>
                  <td className="py-3 px-5 text-neutral-500">{c.niveau}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-semibold text-sm">
                      {c.effectif}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-neutral-50 font-semibold">
                <td className="py-3 px-5 text-neutral-900" colSpan={2}>Total</td>
                <td className="py-3 px-5 text-right text-neutral-900">{stats.effectifTotal}</td>
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
                <tr className="border-b border-neutral-100">
                  <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Élève</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Matricule</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Classe</th>
                  <th className="py-3 px-5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Absences</th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesAbsences.map((e, i) => (
                  <tr key={e.id} className={`border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors ${i % 2 ? "bg-neutral-50/30" : ""}`}>
                    <td className="py-3 px-5 font-medium text-neutral-900">{e.prenom} {e.nom}</td>
                    <td className="py-3 px-5 text-neutral-500 font-mono text-xs">{e.matricule}</td>
                    <td className="py-3 px-5 text-neutral-500">{e.classe}</td>
                    <td className="py-3 px-5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-red-50 text-red-600 font-semibold text-sm">
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
                <tr className="border-b border-neutral-100">
                  <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Élève</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Matricule</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Classe</th>
                  <th className="py-3 px-5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Mois impayés</th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesImpayes.map((e, i) => (
                  <tr key={e.id} className={`border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors ${i % 2 ? "bg-neutral-50/30" : ""}`}>
                    <td className="py-3 px-5 font-medium text-neutral-900">{e.prenom} {e.nom}</td>
                    <td className="py-3 px-5 text-neutral-500 font-mono text-xs">{e.matricule}</td>
                    <td className="py-3 px-5 text-neutral-500">{e.classe}</td>
                    <td className="py-3 px-5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 font-semibold text-sm">
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
    <div className="dash-section animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
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
    <div className="text-center py-10">
      <div className="w-11 h-11 mx-auto rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
      <p className="text-sm text-neutral-500">{text}</p>
    </div>
  );
}
