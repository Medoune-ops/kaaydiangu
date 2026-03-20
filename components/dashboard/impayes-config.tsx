"use client";

import { useEffect, useState } from "react";

export function ImpayesConfig() {
  const [active, setActive] = useState(false);
  const [seuil, setSeuil] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/ecole/impayes-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.impaye_liste_active !== undefined) {
          setActive(data.impaye_liste_active);
          setSeuil(data.impaye_seuil_jours);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(checked: boolean) {
    setActive(checked);
    await save({ impaye_liste_active: checked });
  }

  async function handleSaveSeuil() {
    await save({ impaye_seuil_jours: seuil });
  }

  async function save(body: Record<string, unknown>) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/ecole/impayes-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMessage("Sauvegarde");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("Erreur lors de la sauvegarde");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="p-8">
          <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Liste publique des impayes</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="impaye-toggle" className="text-sm font-medium text-neutral-900">Afficher sur le site vitrine</label>
            <p className="text-sm text-neutral-500">
              {active
                ? "La liste est visible publiquement."
                : "La liste est masquee du site."}
            </p>
          </div>
          <button
            id="impaye-toggle"
            role="switch"
            aria-checked={active}
            onClick={() => !saving && handleToggle(!active)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${active ? "bg-indigo-500" : "bg-neutral-200"}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="seuil" className="block text-sm font-medium text-neutral-900">Seuil de retard (jours)</label>
          <p className="text-sm text-neutral-500">
            Nombre de jours apres inscription avant apparition dans la liste.
          </p>
          <div className="flex items-center gap-3">
            <input
              id="seuil"
              type="number"
              min={1}
              value={seuil}
              onChange={(e) => setSeuil(Number(e.target.value))}
              className="w-24 h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={handleSaveSeuil}
              disabled={saving}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
              message === "Sauvegarde"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message === "Sauvegarde" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {message === "Sauvegarde" ? "Configuration sauvegardee avec succes." : message}
          </div>
        )}
      </div>
    </div>
  );
}
