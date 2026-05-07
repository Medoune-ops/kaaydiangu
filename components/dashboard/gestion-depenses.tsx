"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";

interface DepenseItem {
  id: string;
  libelle: string;
  montant: number;
  date: string;
  categorie: string;
  enregistre_par: { nom: string; prenom: string };
}

const CATEGORIES = [
  { value: "SALAIRE", label: "Salaires" },
  { value: "FOURNITURE", label: "Fournitures" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "AUTRE", label: "Autre" },
];

const CAT_BADGE: Record<string, string> = {
  SALAIRE: "dash-badge dash-badge-info",
  FOURNITURE: "dash-badge dash-badge-neutral",
  MAINTENANCE: "dash-badge dash-badge-orange",
  AUTRE: "dash-badge dash-badge-neutral",
};

export function GestionDepenses() {
  const { toast } = useToast();
  const [depenses, setDepenses] = useState<DepenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire
  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categorie, setCategorie] = useState("SALAIRE");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Filtres
  const [filtreMois, setFiltreMois] = useState(String(new Date().getMonth() + 1));
  const [filtreAnnee, setFiltreAnnee] = useState(String(new Date().getFullYear()));
  const [filtreCategorie, setFiltreCategorie] = useState("");
  const [recherche, setRecherche] = useState("");

  async function charger() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtreMois) params.set("mois", filtreMois);
      if (filtreAnnee) params.set("annee", filtreAnnee);
      if (filtreCategorie) params.set("categorie", filtreCategorie);
      const res = await fetch(`/api/depenses?${params}`);
      if (res.ok) setDepenses(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    charger();
  }, [filtreMois, filtreAnnee, filtreCategorie]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/depenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libelle, montant: parseFloat(montant), date, categorie }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || "Erreur");
        return;
      }
      setMessage("Depense enregistree !");
      toast({ type: "success", title: "Depense enregistree", description: `${libelle} — ${montant} FCFA` });
      setLibelle("");
      setMontant("");
      setDate(new Date().toISOString().split("T")[0]);
      charger();
    } catch {
      setMessage("Erreur reseau");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette depense ?")) return;
    const res = await fetch(`/api/depenses?id=${id}`, { method: "DELETE" });
    if (res.ok) setDepenses((prev) => prev.filter((d) => d.id !== id));
  }

  // Filtrage client par recherche
  const depensesFiltrees = depenses.filter((d) => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return (
      d.libelle.toLowerCase().includes(q) ||
      d.enregistre_par.nom.toLowerCase().includes(q) ||
      d.enregistre_par.prenom.toLowerCase().includes(q) ||
      d.montant.toString().includes(q)
    );
  });

  const totalFiltre = depensesFiltrees.reduce((s, d) => s + d.montant, 0);

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="dash-section">
        <div className="dash-section-header">
          <span className="dash-section-title">Nouvelle dépense</span>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="dash-label">Libellé <span className="text-red-400">*</span></label>
                <input
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  placeholder="Ex: Salaire enseignants mars"
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label className="dash-label">Montant (FCFA) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex: 150000"
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label className="dash-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label className="dash-label">Catégorie</label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  className="dash-input"
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="dash-btn-primary">
              {submitting && (
                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
              )}
              {submitting ? "Enregistrement..." : "Enregistrer la dépense"}
            </button>
            {message && (
              <div className={`text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium ${message.includes("enregistree") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {message.includes("enregistree") ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                )}
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Liste */}
      <div className="dash-section">
        <div className="dash-section-header">
          <div className="flex items-center gap-3">
            <span className="dash-section-title">Liste des dépenses</span>
            {!loading && <span className="dash-count">{depensesFiltrees.length} résultat(s)</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/70">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                data-search-input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher..."
                className="dash-input w-44 pl-9"
              />
            </div>
            <select
              value={filtreMois}
              onChange={(e) => setFiltreMois(e.target.value)}
              className="dash-input w-auto px-3"
            >
              {[
                "Janvier","Février","Mars","Avril","Mai","Juin",
                "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
              ].map((m, i) => (
                <option key={i} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={filtreAnnee}
              onChange={(e) => setFiltreAnnee(e.target.value)}
              className="dash-input w-24"
            />
            <select
              value={filtreCategorie}
              onChange={(e) => setFiltreCategorie(e.target.value)}
              className="dash-input w-auto px-3"
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {(recherche || filtreCategorie) && (
              <button
                onClick={() => { setRecherche(""); setFiltreCategorie(""); }}
                className="dash-btn-secondary text-xs"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center gap-3 justify-center py-8">
              <div className="dash-spinner" />
              <p className="text-sm text-slate-500">Chargement...</p>
            </div>
          ) : depensesFiltrees.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/></svg>
              </div>
              <p className="text-sm font-medium text-neutral-600">Aucune dépense pour cette période</p>
              <p className="text-xs text-neutral-400 mt-1">Utilisez le formulaire ci-dessus pour enregistrer une dépense.</p>
            </div>
          ) : (
            <>
              <div className="dash-total-box mb-5">
                <p>Total de la période</p>
                <p>{totalFiltre.toLocaleString("fr-FR")} FCFA</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Date</th>
                      <th className="text-left">Libellé</th>
                      <th className="text-center">Catégorie</th>
                      <th className="text-right">Montant</th>
                      <th className="text-center">Par</th>
                      <th className="text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {depensesFiltrees.map((d) => (
                      <tr key={d.id}>
                        <td className="text-xs text-slate-500">
                          {new Date(d.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="font-semibold text-slate-800">{d.libelle}</td>
                        <td className="text-center">
                          <span className={CAT_BADGE[d.categorie] || "dash-badge dash-badge-neutral"}>
                            {CATEGORIES.find((c) => c.value === d.categorie)?.label || d.categorie}
                          </span>
                        </td>
                        <td className="text-right font-bold text-slate-800">
                          {d.montant.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="text-center text-xs text-slate-500">
                          {d.enregistre_par.prenom} {d.enregistre_par.nom}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="inline-flex items-center h-8 px-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs rounded-lg font-semibold shadow-sm shadow-red-500/20 hover:shadow-red-500/35 hover:-translate-y-px transition-all"
                          >
                            Suppr.
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
