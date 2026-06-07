"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
} from "lucide-react";

interface HistoriqueItem {
  label: string;
  recettes: number;
  depenses: number;
}

interface StatsData {
  recettes_mois: number;
  depenses_mois: number;
  solde_net: number;
  taux_recouvrement: number;
  mensualites_total: number;
  mensualites_payees: number;
  total_inscriptions: number;
  nb_inscriptions_payees: number;
  total_mensualites_annee: number;
  nb_mensualites_payees_annee: number;
  nb_mensualites_total_annee: number;
  total_depenses_annee: number;
  solde_annee: number;
  nb_eleves: number;
  historique: HistoriqueItem[];
}

function formatFCFA(n: number) {
  return n.toLocaleString("fr-FR") + " F";
}

const MOIS_SELECT = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MOIS_NOMS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function TableauBordFinancier() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportMois, setExportMois] = useState(String(new Date().getMonth() + 1));
  const [exportAnnee, setExportAnnee] = useState(String(new Date().getFullYear()));
  const [exportScope, setExportScope] = useState<"mois" | "annee">("mois");

  useEffect(() => {
    fetch("/api/comptabilite/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  function exportExcel() {
    const params = new URLSearchParams({ annee: exportAnnee });
    if (exportScope === "mois") params.set("mois", exportMois);
    window.open(`/api/comptabilite/export-excel?${params}`, "_blank");
  }

  function exportBilanPDF() {
    const params = new URLSearchParams({ annee: exportAnnee });
    if (exportScope === "mois") params.set("mois", exportMois);
    window.open(`/api/comptabilite/bilan-pdf?${params}`, "_blank");
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 border-r-emerald-300 animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Chargement...</span>
      </div>
    );
  if (!data) return <p className="text-sm text-red-500">Erreur de chargement.</p>;

  const maxBar = Math.max(...data.historique.map((h) => Math.max(h.recettes, h.depenses)), 1);
  const moisNom = MOIS_NOMS[new Date().getMonth() + 1];

  const soldePct = Math.abs(data.solde_net) > 0
    ? Math.min(Math.round((Math.abs(data.solde_net) / Math.max(data.recettes_mois, 1)) * 100), 100)
    : 0;

  const kpisMois = [
    {
      label: "Recettes du mois",
      value: formatFCFA(data.recettes_mois),
      icon: <TrendingUp size={18} />,
      border: "border-l-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600",
      badge: <span className="flex items-center gap-0.5 text-emerald-500 text-[0.72rem] font-medium"><ArrowUpRight size={11} /> entrées</span>,
    },
    {
      label: "Dépenses du mois",
      value: formatFCFA(data.depenses_mois),
      icon: <TrendingDown size={18} />,
      border: "border-l-red-500",
      iconBg: "bg-red-50 text-red-600",
      badge: <span className="flex items-center gap-0.5 text-red-500 text-[0.72rem] font-medium"><ArrowDownRight size={11} /> sorties</span>,
    },
    {
      label: "Solde net",
      value: `${data.solde_net >= 0 ? "+" : ""}${formatFCFA(data.solde_net)}`,
      icon: <Wallet size={18} />,
      border: data.solde_net >= 0 ? "border-l-emerald-500" : "border-l-red-500",
      iconBg: data.solde_net >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
      badge: <span className={`text-[0.72rem] font-medium ${data.solde_net >= 0 ? "text-emerald-500" : "text-red-500"}`}>{soldePct}% du CA</span>,
    },
    {
      label: "Recouvrement",
      value: `${data.taux_recouvrement}%`,
      icon: <Clock size={18} />,
      border: data.taux_recouvrement >= 70 ? "border-l-indigo-500" : "border-l-amber-500",
      iconBg: data.taux_recouvrement >= 70 ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600",
      badge: <span className="text-[0.72rem] font-medium text-slate-400">{data.mensualites_payees}/{data.mensualites_total} mensualités</span>,
    },
  ];

  return (
    <div className="space-y-5">

      {/* Bannière */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg shadow-emerald-500/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute right-16 bottom-0 h-20 w-20 rounded-full bg-teal-300/20 blur-xl" />
        <div className="relative">
          <p className="text-xs font-semibold text-emerald-100 uppercase tracking-widest mb-1">Tableau de bord financier</p>
          <h2 className="text-2xl font-black tracking-tight">Finances de l&apos;établissement</h2>
          <p className="text-emerald-100 text-sm mt-1">
            {data.nb_eleves} élèves actifs · Recouvrement{" "}
            <span className={`font-bold ${data.taux_recouvrement >= 70 ? "text-white" : "text-amber-300"}`}>
              {data.taux_recouvrement}%
            </span>
            {" "}· Solde annuel{" "}
            <span className={`font-bold ${data.solde_annee >= 0 ? "text-white" : "text-red-300"}`}>
              {data.solde_annee >= 0 ? "+" : ""}{formatFCFA(data.solde_annee)}
            </span>
          </p>
        </div>
      </div>

      {/* ── Année scolaire 2025–2026 ── */}
      <div>
        <p className="text-[0.72rem] font-bold text-slate-400 uppercase tracking-widest mb-3">Année scolaire 2025 – 2026</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Inscriptions perçues",
              value: formatFCFA(data.total_inscriptions),
              sub: `${data.nb_inscriptions_payees} élèves inscrits`,
              icon: <BookOpen size={18} />,
              border: "border-l-violet-500",
              iconBg: "bg-violet-50 text-violet-600",
            },
            {
              label: "Mensualités perçues",
              value: formatFCFA(data.total_mensualites_annee),
              sub: `${data.nb_mensualites_payees_annee}/${data.nb_mensualites_total_annee} mois payés`,
              icon: <TrendingUp size={18} />,
              border: "border-l-emerald-500",
              iconBg: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Dépenses annuelles",
              value: formatFCFA(data.total_depenses_annee),
              sub: "charges de l'année",
              icon: <TrendingDown size={18} />,
              border: "border-l-red-500",
              iconBg: "bg-red-50 text-red-600",
            },
            {
              label: "Solde annuel",
              value: `${data.solde_annee >= 0 ? "+" : ""}${formatFCFA(data.solde_annee)}`,
              sub: "recettes − dépenses",
              icon: <Wallet size={18} />,
              border: data.solde_annee >= 0 ? "border-l-emerald-500" : "border-l-red-500",
              iconBg: data.solde_annee >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
            },
          ].map((kpi) => (
            <div key={kpi.label} className={`relative bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 ${kpi.border} shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-3 gap-2">
                <p className="text-[0.8125rem] font-semibold text-slate-500">{kpi.label}</p>
                <span className={`p-2 rounded-lg shrink-0 ${kpi.iconBg}`}>{kpi.icon}</span>
              </div>
              <div className="text-[1.4rem] font-black tracking-[-0.03em] text-slate-900 leading-none tabular-nums mb-2 break-all">{kpi.value}</div>
              <p className="text-[0.72rem] text-slate-400 font-medium">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mois courant ── */}
      <div>
        <p className="text-[0.72rem] font-bold text-slate-400 uppercase tracking-widest mb-3">{moisNom} {new Date().getFullYear()}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpisMois.map((kpi) => (
            <div key={kpi.label} className={`relative bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 ${kpi.border} shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-3 gap-2">
                <p className="text-[0.8125rem] font-semibold text-slate-500">{kpi.label}</p>
                <span className={`p-2 rounded-lg shrink-0 ${kpi.iconBg}`}>{kpi.icon}</span>
              </div>
              <div className="text-[1.6rem] font-black tracking-[-0.03em] text-slate-900 leading-none tabular-nums mb-2 break-all">{kpi.value}</div>
              <div>{kpi.badge}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Jauge recouvrement */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
          <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Recouvrement du mois</h3>
          <span className="ml-auto text-[0.8125rem] font-black text-slate-900 tabular-nums">{data.taux_recouvrement}%</span>
        </div>
        <div className="px-6 py-5">
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                data.taux_recouvrement >= 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : data.taux_recouvrement >= 50 ? "bg-gradient-to-r from-amber-500 to-amber-400"
                : "bg-gradient-to-r from-red-500 to-red-400"
              }`}
              style={{ width: `${Math.min(data.taux_recouvrement, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[0.72rem] text-slate-400 mt-2 px-0.5 font-medium">
            <span>0%</span>
            <span className="text-slate-300">Objectif 80%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Recettes vs Dépenses — 12 mois</h3>
          </div>
          <div className="flex items-center gap-4 text-[0.72rem] font-medium">
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-emerald-400 inline-block" /> Recettes</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-3 rounded bg-gradient-to-t from-red-500 to-red-300 inline-block" /> Dépenses</span>
          </div>
        </div>
        <div className="px-6 py-5 overflow-x-auto">
          <div className="flex items-end gap-3 min-w-[600px]" style={{ height: 230 }}>
            {data.historique.map((h) => {
              const rH = maxBar > 0 ? (h.recettes / maxBar) * 190 : 0;
              const dH = maxBar > 0 ? (h.depenses / maxBar) * 190 : 0;
              return (
                <div key={h.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1.5" style={{ height: 190 }}>
                    <div className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg hover:from-emerald-700 hover:to-emerald-500 relative group cursor-pointer transition-all duration-200" style={{ height: Math.max(rH, 4), minWidth: 12 }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-xl z-10">{formatFCFA(h.recettes)}</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-red-500 to-rose-300 rounded-t-lg hover:from-red-600 hover:to-rose-400 relative group cursor-pointer transition-all duration-200" style={{ height: Math.max(dH, 4), minWidth: 12 }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-xl z-10">{formatFCFA(h.depenses)}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold text-center leading-tight mt-1.5">{h.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exports */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
          <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-slate-400 to-slate-500" />
          <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Exports</h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-[0.72rem] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Période</label>
              <select value={exportScope} onChange={(e) => setExportScope(e.target.value as "mois" | "annee")} className="h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all">
                <option value="mois">Mois</option>
                <option value="annee">Année complète</option>
              </select>
            </div>
            {exportScope === "mois" && (
              <div>
                <label className="block text-[0.72rem] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Mois</label>
                <select value={exportMois} onChange={(e) => setExportMois(e.target.value)} className="h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all">
                  {MOIS_SELECT.map((m, i) => (<option key={i} value={String(i + 1)}>{m}</option>))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-[0.72rem] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Année</label>
              <input type="number" value={exportAnnee} onChange={(e) => setExportAnnee(e.target.value)} className="h-9 w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
            </div>
            <button onClick={exportExcel} className="h-9 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all inline-flex items-center gap-2">
              <Download size={14} />Excel (.xlsx)
            </button>
            <button onClick={exportBilanPDF} className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-semibold hover:bg-indigo-600 transition-all inline-flex items-center gap-2 shadow-sm shadow-indigo-500/20">
              <FileText size={14} />Bilan PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
