"use client";

import { useEffect, useState } from "react";

interface ProfPublic {
  id: string;
  nom: string;
  prenom: string;
  fonction: string | null;
}

function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function NotreEquipe() {
  const [profs, setProfs] = useState<ProfPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/professeurs")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data)) setProfs(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Ne rien afficher tant qu'il n'y a aucun professeur enregistré
  if (loading || profs.length === 0) return null;

  return (
    <section className="bg-white relative overflow-hidden section-lazy py-28">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-400/[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 scroll-animate">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span className="text-sm font-semibold text-cyan-700 tracking-wide">Notre équipe pédagogique</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Des enseignants dévoués
          </h2>
          <p className="text-neutral-500 mt-5 max-w-xl mx-auto text-lg leading-relaxed">
            Une équipe qualifiée et engagée au service de la réussite de chaque élève.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {profs.map((p, i) => (
            <div
              key={p.id}
              className={`scroll-animate scroll-animate-delay-${(i % 4) + 1} group rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50/60 to-white p-6 text-center hover:border-cyan-300/60 hover:shadow-lg transition-all duration-300`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center mx-auto mb-4 text-[#020c1b] font-extrabold text-lg shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">
                {initiales(p.prenom, p.nom)}
              </div>
              <p className="font-bold text-neutral-900 text-[15px]">{p.prenom} {p.nom}</p>
              {p.fonction && <p className="text-neutral-500 text-[13px] mt-1">{p.fonction}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
