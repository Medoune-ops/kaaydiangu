"use client";

import { useEffect, useState } from "react";

interface EleveImpaye {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
}

interface ImpayesData {
  active: boolean;
  seuil_jours?: number;
  mois?: number;
  annee?: number;
  eleves: EleveImpaye[];
}

const MOIS_FR = [
  "", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export function ListeImpayes() {
  const [data, setData] = useState<ImpayesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchImpayes() {
      try {
        const res = await fetch("/api/impayes");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setData(json);
      } catch {
        // silently fail
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchImpayes();
    const interval = setInterval(fetchImpayes, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-6 w-48 skeleton-shimmer" />
            <div className="h-4 w-72 skeleton-shimmer" />
            <div className="mt-6 w-full max-w-4xl space-y-3">
              <div className="h-12 skeleton-shimmer" />
              <div className="h-12 skeleton-shimmer" />
              <div className="h-12 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!data || !data.active || data.eleves.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-400/[0.03] blur-[100px] rounded-full" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-lg shadow-red-500/30" />
            </span>
            <span className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">En temps reel</span>
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Eleves en retard de paiement
          </h2>
          <p className="text-neutral-500 mt-3">
            {MOIS_FR[data.mois!]} {data.annee} — Retard de plus de {data.seuil_jours} jours
          </p>
        </div>

        <div className="max-w-4xl mx-auto gradient-border overflow-hidden">
          {/* Header desktop */}
          <div className="hidden md:grid grid-cols-4 gap-4 px-7 py-4 bg-neutral-50 text-sm font-semibold text-neutral-500 border-b border-neutral-200">
            <span>Matricule</span>
            <span>Nom</span>
            <span>Prenom</span>
            <span>Classe</span>
          </div>

          <div className="divide-y divide-neutral-100">
            {data.eleves.map((eleve) => (
              <div
                key={eleve.matricule}
                className="px-7 py-4 md:grid md:grid-cols-4 md:gap-4 flex flex-col gap-1.5 hover:bg-neutral-50 transition-colors duration-200"
              >
                <span className="font-mono text-cyan-600 font-semibold text-[15px]">
                  <span className="md:hidden text-xs text-neutral-400 mr-1.5">Matricule:</span>
                  {eleve.matricule}
                </span>
                <span className="font-medium text-neutral-900 text-[15px]">
                  <span className="md:hidden text-xs text-neutral-400 mr-1.5">Nom:</span>
                  {eleve.nom}
                </span>
                <span className="text-neutral-500 text-[15px]">
                  <span className="md:hidden text-xs text-neutral-400 mr-1.5">Prenom:</span>
                  {eleve.prenom}
                </span>
                <span>
                  <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1">
                    {eleve.classe}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-neutral-400 mt-6">
          Cette liste se met a jour automatiquement.
          Effectuez votre paiement pour ne plus y apparaitre.
        </p>
      </div>
    </section>
  );
}
