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
      <div className="dash-section">
        <div className="p-8 flex justify-center">
          <div className="dash-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-section overflow-hidden">
      <div className="dash-section-header">
        <span className="dash-section-title">Liste publique des impayés</span>
        <span className={`dash-badge ${active ? "dash-badge-success" : "dash-badge-neutral"}`}>
          {active ? "Active" : "Masquée"}
        </span>
      </div>
      <div className="px-6 py-5 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50/40">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-neutral-900">Afficher sur le site vitrine</p>
            <p className="text-xs text-neutral-500">
              {active ? "La liste est visible publiquement." : "La liste est masquée du site."}
            </p>
          </div>
          <button
            id="impaye-toggle"
            role="switch"
            aria-checked={active}
            onClick={() => !saving && handleToggle(!active)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${active ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-neutral-200"}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="space-y-3 p-4 rounded-xl border border-neutral-100 bg-neutral-50/40">
          <div>
            <label htmlFor="seuil" className="dash-label">Seuil de retard (jours)</label>
            <p className="text-xs text-neutral-500 mb-3">
              Nombre de jours après inscription avant apparition dans la liste.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="seuil"
              type="number"
              min={1}
              value={seuil}
              onChange={(e) => setSeuil(Number(e.target.value))}
              className="dash-input w-24"
            />
            <button onClick={handleSaveSeuil} disabled={saving} className="dash-btn-primary">
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </div>

        {message && (
          <div className={`text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium ${message === "Sauvegarde" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message === "Sauvegarde" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {message === "Sauvegarde" ? "Configuration sauvegardée avec succès." : message}
          </div>
        )}
      </div>
    </div>
  );
}
