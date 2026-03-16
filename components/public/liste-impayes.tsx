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

    // Rafraichir toutes les 60 secondes
    const interval = setInterval(fetchImpayes, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="h-6 w-48 bg-white/[0.04] rounded-lg animate-pulse mx-auto" />
        </div>
      </section>
    );
  }

  if (!data || !data.active || data.eleves.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#050505] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.02] to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">En temps reel</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Eleves en retard de paiement
          </h2>
          <p className="text-neutral-500 mt-2">
            {MOIS_FR[data.mois!]} {data.annee} — Retard de plus de {data.seuil_jours} jours
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
          {/* Header desktop */}
          <div className="hidden md:grid grid-cols-4 gap-4 px-7 py-4 bg-white/[0.02] text-sm font-semibold text-neutral-500 border-b border-white/[0.06]">
            <span>Matricule</span>
            <span>Nom</span>
            <span>Prenom</span>
            <span>Classe</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {data.eleves.map((eleve) => (
              <div
                key={eleve.matricule}
                className="px-7 py-4 md:grid md:grid-cols-4 md:gap-4 flex flex-col gap-1.5 hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-mono text-emerald-400 font-semibold">
                  <span className="md:hidden text-xs text-neutral-600 mr-1.5">Matricule:</span>
                  {eleve.matricule}
                </span>
                <span className="font-medium text-white">
                  <span className="md:hidden text-xs text-neutral-600 mr-1.5">Nom:</span>
                  {eleve.nom}
                </span>
                <span className="text-neutral-400">
                  <span className="md:hidden text-xs text-neutral-600 mr-1.5">Prenom:</span>
                  {eleve.prenom}
                </span>
                <span>
                  <span className="text-xs font-semibold text-neutral-300 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1">
                    {eleve.classe}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-neutral-600 mt-6">
          Cette liste se met a jour automatiquement.
          Effectuez votre paiement pour ne plus y apparaitre.
        </p>
      </div>
    </section>
  );
}
