"use client";

import { useEffect, useState } from "react";

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
        <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
        Erreur lors du chargement des statistiques.
      </div>
    );
  }

  const kpis = [
    {
      label: "Eleves inscrits",
      value: stats.effectifTotal,
      icon: <IconUsers />,
      detailKey: "effectif" as DetailView,
    },
    {
      label: "Recouvrement",
      value: `${stats.tauxRecouvrement}%`,
      sublabel: "mois courant",
      icon: <IconWallet />,
      accent: stats.tauxRecouvrement >= 70,
      detailKey: null as DetailView,
    },
    {
      label: "Moyenne ecole",
      value: stats.moyenneEcole !== null ? `${stats.moyenneEcole}/20` : "N/A",
      sublabel: `seq. ${stats.sequenceRef}`,
      icon: <IconChart />,
      detailKey: null as DetailView,
    },
    {
      label: "Absences",
      value: stats.nbAbsences,
      sublabel: "+3 non justifiees",
      icon: <IconAlert />,
      warning: stats.nbAbsences > 0,
      detailKey: "absences" as DetailView,
    },
    {
      label: "Impayes",
      value: stats.nbImpayes,
      sublabel: "en retard",
      icon: <IconClock />,
      warning: stats.nbImpayes > 0,
      detailKey: "impayes" as DetailView,
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
            className={`bg-white rounded-xl border border-neutral-200 p-5 text-left transition-all ${
              kpi.detailKey ? "cursor-pointer hover:border-indigo-200 hover:shadow-sm" : "cursor-default"
            } ${detail === kpi.detailKey ? "ring-2 ring-indigo-500 border-indigo-200" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                kpi.warning ? "bg-red-50 text-red-500" : "bg-neutral-50 text-neutral-400"
              }`}>
                {kpi.icon}
              </span>
              {kpi.detailKey && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300"><polyline points="9 18 15 12 9 6"/></svg>
              )}
            </div>
            <div className="text-2xl font-bold text-neutral-900 tracking-tight">{kpi.value}</div>
            <div className="text-sm text-neutral-500 mt-0.5">{kpi.label}</div>
            {kpi.sublabel && <div className="text-xs text-neutral-400">{kpi.sublabel}</div>}
          </button>
        ))}
      </div>

      {/* Charts row */}
      {stats.classes.length > 0 && !detail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Effectif par classe */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Effectif par classe</h3>
            <div className="space-y-2.5">
              {stats.classes.map((c) => {
                const maxEffectif = Math.max(...stats.classes.map((cl) => cl.effectif), 1);
                const pct = (c.effectif / maxEffectif) * 100;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500 w-20 shrink-0 truncate">{c.nom}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 flex items-center justify-end pr-2 transition-all duration-700"
                        style={{ width: `${Math.max(pct, 10)}%` }}
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
          <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-neutral-900 mb-6">Taux de recouvrement</h3>
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f5f5f5" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.tauxRecouvrement * 3.14} 314`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-neutral-900">{stats.tauxRecouvrement}%</span>
                <span className="text-xs text-neutral-400">collecte</span>
              </div>
            </div>
            <p className="text-sm text-neutral-500 mt-4">
              {stats.nbImpayes} eleve(s) en retard
            </p>
          </div>
        </div>
      )}

      {/* Detail Panels */}
      {detail === "effectif" && (
        <DetailPanel title="Effectif par classe" onClose={() => setDetail(null)}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Classe</th>
                <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Niveau</th>
                <th className="py-2.5 px-4 text-right text-sm font-medium text-neutral-400 uppercase tracking-wider">Effectif</th>
              </tr>
            </thead>
            <tbody>
              {stats.classes.map((c) => (
                <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="py-2.5 px-4 text-sm font-medium text-neutral-900">{c.nom}</td>
                  <td className="py-2.5 px-4 text-sm text-neutral-500">{c.niveau}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-md text-sm font-semibold">
                      {c.effectif}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-neutral-50 font-semibold">
                <td className="py-2.5 px-4 text-sm text-neutral-900" colSpan={2}>Total</td>
                <td className="py-2.5 px-4 text-right text-sm text-neutral-900">{stats.effectifTotal}</td>
              </tr>
            </tbody>
          </table>
        </DetailPanel>
      )}

      {detail === "absences" && (
        <DetailPanel title="Eleves avec +3 absences non justifiees" onClose={() => setDetail(null)}>
          {stats.elevesAbsences.length === 0 ? (
            <EmptyState text="Aucun eleve concerne" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Eleve</th>
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Matricule</th>
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Classe</th>
                  <th className="py-2.5 px-4 text-right text-sm font-medium text-neutral-400 uppercase tracking-wider">Absences</th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesAbsences.map((e) => (
                  <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="py-2.5 px-4 text-sm font-medium text-neutral-900">{e.prenom} {e.nom}</td>
                    <td className="py-2.5 px-4 text-sm text-neutral-500">{e.matricule}</td>
                    <td className="py-2.5 px-4 text-sm text-neutral-500">{e.classe}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-md text-sm font-semibold">
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
        <DetailPanel title="Eleves en retard de paiement" onClose={() => setDetail(null)}>
          {stats.elevesImpayes.length === 0 ? (
            <EmptyState text="Tous les paiements sont a jour" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Eleve</th>
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Matricule</th>
                  <th className="py-2.5 px-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Classe</th>
                  <th className="py-2.5 px-4 text-right text-sm font-medium text-neutral-400 uppercase tracking-wider">Mois impayes</th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesImpayes.map((e) => (
                  <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="py-2.5 px-4 text-sm font-medium text-neutral-900">{e.prenom} {e.nom}</td>
                    <td className="py-2.5 px-4 text-sm text-neutral-500">{e.matricule}</td>
                    <td className="py-2.5 px-4 text-sm text-neutral-500">{e.classe}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-md text-sm font-semibold">
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
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-10 h-10 mx-auto rounded-lg bg-green-50 flex items-center justify-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p className="text-sm text-neutral-500">{text}</p>
    </div>
  );
}

// ─── ICONS ───

function IconUsers() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconWallet() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function IconChart() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IconAlert() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IconClock() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
