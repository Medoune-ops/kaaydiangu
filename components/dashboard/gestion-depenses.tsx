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

const CAT_COLORS: Record<string, string> = {
  SALAIRE: "bg-indigo-50 text-indigo-700",
  FOURNITURE: "bg-neutral-50 text-neutral-700",
  MAINTENANCE: "bg-orange-50 text-orange-700",
  AUTRE: "bg-neutral-50 text-neutral-500",
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
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Nouvelle depense</h3>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">Libelle <span className="text-red-500">*</span></label>
                <input
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  placeholder="Ex: Salaire enseignants mars"
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">Montant (FCFA) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex: 150000"
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">Categorie</label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
              )}
              {submitting ? "Enregistrement..." : "Enregistrer la depense"}
            </button>
            {message && (
              <div
                className={`text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                  message.includes("enregistree")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.includes("enregistree") ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                )}
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Liste des depenses
              {!loading && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-neutral-100 text-neutral-500">
                  {depensesFiltrees.length} resultat(s)
                </span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  data-search-input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher une depense..."
                  className="h-9 w-56 bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <select
                value={filtreMois}
                onChange={(e) => setFiltreMois(e.target.value)}
                className="h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {[
                  "Janvier","Fevrier","Mars","Avril","Mai","Juin",
                  "Juillet","Aout","Septembre","Octobre","Novembre","Decembre",
                ].map((m, i) => (
                  <option key={i} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={filtreAnnee}
                onChange={(e) => setFiltreAnnee(e.target.value)}
                className="w-24 h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <select
                value={filtreCategorie}
                onChange={(e) => setFiltreCategorie(e.target.value)}
                className="h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Toutes categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {(recherche || filtreCategorie) && (
                <button
                  onClick={() => { setRecherche(""); setFiltreCategorie(""); }}
                  className="h-9 px-3 text-sm text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Reinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
              <p className="text-sm text-neutral-500">Chargement...</p>
            </div>
          ) : depensesFiltrees.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/></svg>
              </div>
              <p className="text-sm text-neutral-500">Aucune depense pour cette periode.</p>
              <p className="text-xs text-neutral-400 mt-1">Utilisez le formulaire ci-dessus pour enregistrer une depense.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
                <p className="text-sm text-neutral-500">Total de la periode</p>
                <p className="text-xl font-bold text-neutral-900">
                  {totalFiltre.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Date</th>
                      <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Libelle</th>
                      <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Categorie</th>
                      <th className="text-right px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Montant</th>
                      <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Par</th>
                      <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {depensesFiltrees.map((d) => (
                      <tr key={d.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                        <td className="px-3 py-2 text-sm text-neutral-500">
                          {new Date(d.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-neutral-900">{d.libelle}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium ${CAT_COLORS[d.categorie] || "bg-neutral-50 text-neutral-500"}`}>
                            {CATEGORIES.find((c) => c.value === d.categorie)?.label || d.categorie}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium text-neutral-900">
                          {d.montant.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="px-3 py-2 text-center text-sm text-neutral-500">
                          {d.enregistre_par.prenom} {d.enregistre_par.nom}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="h-9 px-4 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition-colors"
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
