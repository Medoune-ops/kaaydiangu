"use client";

import { useState, useEffect } from "react";

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

  const totalFiltre = depenses.reduce((s, d) => s + d.montant, 0);

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
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">Libelle</label>
                <input
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  placeholder="Ex: Salaire enseignants mars"
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">Montant (FCFA)</label>
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
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Enregistrement..." : "Enregistrer la depense"}
            </button>
            {message && (
              <p className={`text-sm ${message.includes("enregistree") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-semibold text-neutral-900">Liste des depenses</h3>
            <div className="flex flex-wrap items-center gap-3">
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
                <option value="">Toutes</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
              <p className="text-sm text-neutral-500">Chargement...</p>
            </div>
          ) : depenses.length === 0 ? (
            <p className="text-sm text-neutral-500">Aucune depense pour cette periode.</p>
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
                    {depenses.map((d) => (
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
