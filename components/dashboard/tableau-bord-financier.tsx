"use client";

import { useState, useEffect } from "react";

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
  "Janvier","Fevrier","Mars","Avril","Mai","Juin",
  "Juillet","Aout","Septembre","Octobre","Novembre","Decembre",
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
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
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
      {/* Export */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Exports</h3>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1">Periode</label>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value as "mois" | "annee")}
                className="h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="mois">Mois</option>
                <option value="annee">Annee complete</option>
              </select>
            </div>
            {exportScope === "mois" && (
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">Mois</label>
                <select
                  value={exportMois}
                  onChange={(e) => setExportMois(e.target.value)}
                  className="h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {MOIS_SELECT.map((m, i) => (
                    <option key={i} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1">Annee</label>
              <input
                type="number"
                value={exportAnnee}
                onChange={(e) => setExportAnnee(e.target.value)}
                className="h-9 w-24 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={exportExcel}
              className="h-9 px-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Export Excel (.xlsx)
            </button>
            <button
              onClick={exportBilanPDF}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition-colors"
            >
              Bilan PDF
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-green-600">Recettes du mois</p>
            <p className="text-2xl font-bold text-green-700">{formatFCFA(data.recettes_mois)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-red-600">Depenses du mois</p>
            <p className="text-2xl font-bold text-red-700">{formatFCFA(data.depenses_mois)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-indigo-500">Solde net</p>
            <p className={`text-2xl font-bold ${data.solde_net >= 0 ? "text-green-700" : "text-red-700"}`}>
              {data.solde_net >= 0 ? "+" : ""}{formatFCFA(data.solde_net)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="pt-4 pb-4 text-center">
            <p className="text-sm text-indigo-500">Taux de recouvrement</p>
            <p className="text-2xl font-bold text-indigo-600">{data.taux_recouvrement}%</p>
            <p className="text-xs text-neutral-400">
              {data.mensualites_payees}/{data.mensualites_total} mensualites
            </p>
          </div>
        </div>
      </div>

      {/* Jauge recouvrement */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Recouvrement du mois</h3>
        </div>
        <div className="px-6 py-4">
          <div className="w-full bg-neutral-200 rounded-full h-6 overflow-hidden">
            <div
              className={`h-6 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all ${
                data.taux_recouvrement >= 80
                  ? "bg-green-500"
                  : data.taux_recouvrement >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(data.taux_recouvrement, 100)}%` }}
            >
              {data.taux_recouvrement > 15 ? `${data.taux_recouvrement}%` : ""}
            </div>
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Graphique barres 12 mois */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Recettes vs Depenses -- 12 derniers mois</h3>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-neutral-500">Recettes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span className="text-neutral-500">Depenses</span>
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
                        className="w-4 bg-green-500 rounded-t transition-all hover:bg-green-600 relative group"
                        style={{ height: Math.max(rH, 2) }}
                        title={`Recettes: ${formatFCFA(h.recettes)}`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                          {formatFCFA(h.recettes)}
                        </div>
                      </div>
                      <div
                        className="w-4 bg-red-400 rounded-t transition-all hover:bg-red-500 relative group"
                        style={{ height: Math.max(dH, 2) }}
                        title={`Depenses: ${formatFCFA(h.depenses)}`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                          {formatFCFA(h.depenses)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500 text-center leading-tight">
                      {h.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
