"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Download,
  FileText,
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
  historique: HistoriqueItem[];
}

function formatFCFA(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

const MOIS_SELECT = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
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
      <div className="flex items-center gap-3 py-12 justify-center">
        <div className="dash-spinner" />
        <p className="text-sm text-neutral-500">Chargement des statistiques...</p>
      </div>
    );
  if (!data) return <p className="text-sm text-red-500">Erreur de chargement.</p>;

  const maxBar = Math.max(
    ...data.historique.map((h) => Math.max(h.recettes, h.depenses)),
    1
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-kpi p-5" style={{ "--kpi-accent": "#22c55e" } as React.CSSProperties}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">Recettes du mois</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1 tracking-tight">{formatFCFA(data.recettes_mois)}</p>
        </div>

        <div className="dash-kpi p-5" style={{ "--kpi-accent": "#ef4444" } as React.CSSProperties}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">Dépenses du mois</p>
          <p className="text-2xl font-bold text-red-700 mt-1 tracking-tight">{formatFCFA(data.depenses_mois)}</p>
        </div>

        <div className="dash-kpi p-5" style={{ "--kpi-accent": data.solde_net >= 0 ? "#22c55e" : "#ef4444" } as React.CSSProperties}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.solde_net >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
              <Wallet size={20} className={data.solde_net >= 0 ? "text-emerald-500" : "text-red-500"} />
            </div>
          </div>
          <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">Solde net</p>
          <p className={`text-2xl font-bold mt-1 tracking-tight ${data.solde_net >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {data.solde_net >= 0 ? "+" : ""}{formatFCFA(data.solde_net)}
          </p>
        </div>

        <div className="dash-kpi p-5" style={{ "--kpi-accent": "#6366f1" } as React.CSSProperties}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Clock size={20} className="text-indigo-500" />
            </div>
          </div>
          <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">Recouvrement</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1 tracking-tight">{data.taux_recouvrement}%</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {data.mensualites_payees}/{data.mensualites_total} mensualités
          </p>
        </div>
      </div>

      {/* Jauge recouvrement */}
      <div className="dash-section">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Recouvrement du mois</h3>
        </div>
        <div className="px-6 py-5">
          <div className="w-full bg-neutral-100 rounded-full h-7 overflow-hidden">
            <div
              className={`h-7 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all duration-700 ${
                data.taux_recouvrement >= 80
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : data.taux_recouvrement >= 50
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-red-500 to-red-400"
              }`}
              style={{ width: `${Math.min(data.taux_recouvrement, 100)}%` }}
            >
              {data.taux_recouvrement > 15 ? `${data.taux_recouvrement}%` : ""}
            </div>
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1.5 px-0.5">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Graphique barres 12 mois */}
      <div className="dash-section">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Recettes vs Dépenses — 12 derniers mois</h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-6 text-sm mb-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-neutral-500 text-xs font-medium">Recettes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-400" />
              <span className="text-neutral-500 text-xs font-medium">Dépenses</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex items-end gap-2 min-w-[700px]" style={{ height: 220 }}>
              {data.historique.map((h) => {
                const rH = maxBar > 0 ? (h.recettes / maxBar) * 180 : 0;
                const dH = maxBar > 0 ? (h.depenses / maxBar) * 180 : 0;

                return (
                  <div key={h.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-0.5" style={{ height: 180 }}>
                      <div
                        className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all hover:from-emerald-700 hover:to-emerald-500 relative group cursor-pointer"
                        style={{ height: Math.max(rH, 2) }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-lg">
                          {formatFCFA(h.recettes)}
                        </div>
                      </div>
                      <div
                        className="w-4 bg-gradient-to-t from-red-500 to-red-300 rounded-t-sm transition-all hover:from-red-600 hover:to-red-400 relative group cursor-pointer"
                        style={{ height: Math.max(dH, 2) }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-lg">
                          {formatFCFA(h.depenses)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium text-center leading-tight mt-1">
                      {h.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="dash-section">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Exports</h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Période</label>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value as "mois" | "annee")}
                className="h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              >
                <option value="mois">Mois</option>
                <option value="annee">Année complète</option>
              </select>
            </div>
            {exportScope === "mois" && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Mois</label>
                <select
                  value={exportMois}
                  onChange={(e) => setExportMois(e.target.value)}
                  className="h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                >
                  {MOIS_SELECT.map((m, i) => (
                    <option key={i} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Année</label>
              <input
                type="number"
                value={exportAnnee}
                onChange={(e) => setExportAnnee(e.target.value)}
                className="h-9 w-24 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
            <button
              onClick={exportExcel}
              className="h-9 px-4 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all inline-flex items-center gap-2"
            >
              <Download size={14} />
              Excel (.xlsx)
            </button>
            <button
              onClick={exportBilanPDF}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition-all inline-flex items-center gap-2 shadow-sm shadow-indigo-500/20"
            >
              <FileText size={14} />
              Bilan PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
