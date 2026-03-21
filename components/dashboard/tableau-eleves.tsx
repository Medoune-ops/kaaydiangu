"use client";

import { useState } from "react";

interface Eleve {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  actif: boolean;
  classe: { nom: string; niveau: string };
  user: { email: string };
}

export function TableauEleves({ eleves }: { eleves: Eleve[] }) {
  const [recherche, setRecherche] = useState("");
  const [filtreClasse, setFiltreClasse] = useState("");

  // Extraire les classes uniques
  const classesUniques = Array.from(
    new Map(eleves.map((e) => [e.classe.nom, e.classe])).values()
  ).sort((a, b) => a.nom.localeCompare(b.nom));

  const elevesFiltres = eleves.filter((e) => {
    if (filtreClasse && e.classe.nom !== filtreClasse) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      return (
        e.nom.toLowerCase().includes(q) ||
        e.prenom.toLowerCase().includes(q) ||
        e.matricule.toLowerCase().includes(q) ||
        e.user.email.toLowerCase().includes(q) ||
        e.classe.nom.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (eleves.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Barre de recherche et filtres */}
      <div className="px-4 py-4 border-b border-neutral-100">
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
              placeholder="Rechercher par nom, prenom, matricule..."
              className="h-9 w-72 bg-white border border-neutral-200 rounded-lg pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <select
            value={filtreClasse}
            onChange={(e) => setFiltreClasse(e.target.value)}
            className="h-9 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">Toutes les classes</option>
            {classesUniques.map((c) => (
              <option key={c.nom} value={c.nom}>
                {c.nom} ({c.niveau})
              </option>
            ))}
          </select>
          {(recherche || filtreClasse) && (
            <button
              onClick={() => { setRecherche(""); setFiltreClasse(""); }}
              className="h-9 px-3 text-sm text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Reinitialiser
            </button>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-neutral-100 text-neutral-500">
            {elevesFiltres.length} resultat(s)
          </span>
        </div>
      </div>

      {elevesFiltres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-500">Aucun eleve ne correspond a votre recherche.</p>
          <p className="text-xs text-neutral-400 mt-1">Modifiez les filtres pour affiner votre recherche.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Matricule</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Nom & Prenom</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Classe</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 text-sm uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody>
              {elevesFiltres.map((eleve) => (
                <tr key={eleve.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-indigo-500">{eleve.matricule}</td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {eleve.nom} {eleve.prenom}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5">{eleve.classe.nom}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{eleve.user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium rounded-md px-2 py-0.5 ${
                      eleve.actif
                        ? "text-green-600 bg-green-50"
                        : "text-red-600 bg-red-50"
                    }`}>
                      {eleve.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
