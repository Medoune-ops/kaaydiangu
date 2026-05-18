"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Classe {
  id: string;
  nom: string;
  niveau: string;
  filiere: string | null;
  _count: { eleves: number; matieres: number };
}

interface ClassesListeProps {
  classes: Classe[];
}

export function ClassesListe({ classes }: ClassesListeProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.niveau.toLowerCase().includes(q) ||
        (c.filiere && c.filiere.toLowerCase().includes(q))
    );
  }, [query, classes]);

  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, Classe[]>>((acc, classe) => {
        if (!acc[classe.niveau]) acc[classe.niveau] = [];
        acc[classe.niveau].push(classe);
        return acc;
      }, {}),
    [filtered]
  );

  return (
    <>
      {/* Barre de recherche */}
      <div className="mb-12 max-w-xl mx-auto">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une classe, un niveau, une filière..."
            className="w-full h-12 pl-11 pr-10 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.04)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Effacer la recherche"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
        {query && (
          <p className="mt-2 text-sm text-neutral-500 text-center">
            {filtered.length === 0
              ? "Aucune classe ne correspond à votre recherche"
              : `${filtered.length} classe${filtered.length > 1 ? "s" : ""} trouvée${filtered.length > 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* Liste des classes */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="h-16 w-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-neutral-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <h3 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>
            Aucune classe trouvée
          </h3>
          <p className="text-neutral-500 mt-2">
            Essayez avec un autre terme de recherche.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(grouped).map(([niveau, classesDuNiveau]) => (
            <div key={niveau} className="scroll-animate">
              <h2
                className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="w-1 h-8 rounded-full bg-gradient-to-b from-cyan-500 to-teal-500" />
                {niveau}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesDuNiveau.map((classe) => (
                  <Link key={classe.id} href={`/nos-classes/${classe.id}`}>
                    <div className="relative bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.05),0_4px_16px_rgba(15,23,42,0.03)] p-7 group cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-teal-500" />
                      <div className="flex items-center justify-between mb-5">
                        <h3
                          className="text-lg font-bold text-neutral-900 group-hover:text-cyan-700 transition-colors duration-200"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {classe.nom}
                        </h3>
                        {classe.filiere && (
                          <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1">
                            {classe.filiere}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-5 text-[14px]">
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          {classe._count.eleves} élèves
                        </span>
                        <span className="flex items-center gap-1.5 text-neutral-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
                          {classe._count.matieres} matières
                        </span>
                      </div>
                      <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-cyan-600 group-hover:text-cyan-500 transition-colors inline-flex items-center gap-1 group-hover:gap-2 duration-200">
                          Voir le détail
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </span>
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">{classe.niveau}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
