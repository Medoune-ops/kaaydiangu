"use client";

import { useState, useEffect } from "react";

const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
const JOURS_FR: Record<string, string> = {
  LUNDI: "Lun",
  MARDI: "Mar",
  MERCREDI: "Mer",
  JEUDI: "Jeu",
  VENDREDI: "Ven",
  SAMEDI: "Sam",
};

const CRENEAUX = [
  { debut: "08:00", fin: "09:00" },
  { debut: "09:00", fin: "10:00" },
  { debut: "10:00", fin: "11:00" },
  { debut: "11:00", fin: "12:00" },
  { debut: "12:00", fin: "13:00" },
  { debut: "13:00", fin: "14:00" },
  { debut: "14:00", fin: "15:00" },
  { debut: "15:00", fin: "16:00" },
  { debut: "16:00", fin: "17:00" },
  { debut: "17:00", fin: "18:00" },
];

interface Creneau {
  jour: string;
  heure_debut: string;
  heure_fin: string;
  salle: string | null;
  matiere: {
    nom: string;
    professeur: { nom: string; prenom: string } | null;
  };
}

export function EmploiDuTempsViewer({ classeId }: { classeId: string }) {
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/emplois-du-temps?classe_id=${classeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCreneaux(data);
      })
      .finally(() => setLoading(false));
  }, [classeId]);

  function getCreneau(jour: string, debut: string, fin: string) {
    return creneaux.find(
      (c) => c.jour === jour && c.heure_debut === debut && c.heure_fin === fin
    );
  }

  // Ne rien afficher si pas de creneaux
  const hasCreneaux = creneaux.length > 0;

  if (loading) {
    return (
      <div className="py-8 text-center text-neutral-600 text-sm">
        Chargement de l&apos;emploi du temps...
      </div>
    );
  }

  if (!hasCreneaux) {
    return (
      <p className="py-4 text-center text-neutral-600 text-sm">
        Emploi du temps non encore disponible.
      </p>
    );
  }

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="p-5 overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px] text-sm">
          <thead>
            <tr>
              <th className="w-16 p-2.5 font-semibold text-neutral-500 border border-white/[0.06] bg-white/[0.02]">
                Heure
              </th>
              {JOURS.map((j) => (
                <th key={j} className="p-2.5 font-semibold text-neutral-300 border border-white/[0.06] bg-white/[0.02]">
                  {JOURS_FR[j]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRENEAUX.map((slot) => {
              const hasAny = JOURS.some((j) => getCreneau(j, slot.debut, slot.fin));
              if (!hasAny) return null;
              return (
                <tr key={slot.debut}>
                  <td className="p-2.5 text-center font-mono text-neutral-500 border border-white/[0.06] bg-white/[0.02]">
                    {slot.debut}
                  </td>
                  {JOURS.map((jour) => {
                    const c = getCreneau(jour, slot.debut, slot.fin);
                    return (
                      <td
                        key={jour}
                        className={`border border-white/[0.06] p-2.5 align-top ${c ? "bg-emerald-500/[0.06]" : ""}`}
                      >
                        {c && (
                          <div>
                            <p className="font-semibold text-emerald-400">{c.matiere.nom}</p>
                            {c.matiere.professeur && (
                              <p className="text-emerald-500/70 text-xs mt-0.5">
                                {c.matiere.professeur.prenom[0]}. {c.matiere.professeur.nom}
                              </p>
                            )}
                            {c.salle && (
                              <p className="text-neutral-600 text-xs">Salle {c.salle}</p>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
