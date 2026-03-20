"use client";

import { useState, useEffect } from "react";
import { EmploiDuTempsViewer } from "@/components/public/emploi-du-temps-viewer";

interface NoteItem {
  valeur: number;
  type: string;
}

interface MatiereData {
  nom: string;
  coefficient: number;
  notes: NoteItem[];
  moyenne: number | null;
}

interface PaiementItem {
  id: string;
  mois: number;
  annee: number;
  montant: number;
  statut: "PAYE" | "NON_PAYE";
  recu_numero: string | null;
  date_paiement: string | null;
  mode: string | null;
}

interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  lu: boolean;
  type: string | null;
  date_envoi: string;
}

interface ResumeData {
  eleve: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
    classe: { id: string; nom: string; niveau: string };
  };
  sequence: number;
  matieres: MatiereData[];
  moyenneGenerale: number | null;
  rang: number;
  totalEleves: number;
  paiements: PaiementItem[];
  moisRestants: number;
  totalAbsences: number;
  totalHeures: number;
  absencesNonJustifiees: number;
  notifications: NotificationItem[];
}

const MOIS_NOMS = [
  "", "Jan", "Fev", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aou", "Sep", "Oct", "Nov", "Dec",
];

const MOIS_COMPLETS = [
  "", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Especes",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT: "Virement",
};

export function DashboardEleve() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/eleve/resume")
      .then((r) => {
        if (!r.ok) throw new Error("Erreur");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Impossible de charger les donnees."))
      .finally(() => setLoading(false));
  }, []);

  async function marquerLu(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setData((prev) =>
      prev
        ? {
            ...prev,
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, lu: true } : n
            ),
          }
        : prev
    );
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
      </div>
    );
  if (error || !data) return <p className="text-sm text-red-500">{error}</p>;

  const nonLues = data.notifications.filter((n) => !n.lu).length;

  return (
    <div className="space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-indigo-50 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">Moyenne generale</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">
            {data.moyenneGenerale !== null
              ? `${data.moyenneGenerale.toFixed(2)}`
              : "--"}
          </p>
          <p className="text-sm text-neutral-400 mt-1">/20 -- Seq. {data.sequence}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <p className="text-xs text-amber-500 uppercase tracking-wider font-semibold">Rang</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">
            {data.rang}
            <span className="text-base">{data.rang === 1 ? "er" : "e"}</span>
          </p>
          <p className="text-sm text-neutral-400 mt-1">sur {data.totalEleves} eleves</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${data.moisRestants > 0 ? "bg-red-50" : "bg-green-50"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={data.moisRestants > 0 ? "#ef4444" : "#22c55e"} strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <p className={`text-xs uppercase tracking-wider font-semibold ${data.moisRestants > 0 ? "text-red-500" : "text-green-500"}`}>Mois restants a payer</p>
          <p className={`text-3xl font-bold mt-1 ${data.moisRestants > 0 ? "text-red-600" : "text-green-600"}`}>
            {data.moisRestants}
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            sur {data.paiements.length} mensualites
          </p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${data.absencesNonJustifiees > 0 ? "bg-red-50" : "bg-neutral-100"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={data.absencesNonJustifiees > 0 ? "#ef4444" : "#a3a3a3"} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Absences</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{data.totalAbsences}</p>
          <p className="text-sm text-neutral-400 mt-1">
            {data.totalHeures}h -- {data.absencesNonJustifiees} non justifiee(s)
          </p>
        </div>
      </div>

      {/* MES NOTES */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Mes notes -- Sequence {data.sequence}
          </h2>
        </div>
        <div className="p-6">
          {data.matieres.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <p className="text-sm text-neutral-500">Aucune note disponible pour le moment.</p>
              <p className="text-xs text-neutral-400 mt-1">Les notes apparaitront ici une fois saisies par vos professeurs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Matiere</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500 w-14">Coef.</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500">Notes</th>
                    <th className="text-center px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-500 w-20">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matieres.map((m, i) => (
                    <tr
                      key={m.nom}
                      className={`border-b border-neutral-100 ${i % 2 === 0 ? "bg-white" : "bg-neutral-50"}`}
                    >
                      <td className="px-3 py-2 text-sm font-medium text-neutral-900">{m.nom}</td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">{m.coefficient}</td>
                      <td className="px-3 py-2 text-center text-sm text-neutral-500">
                        {m.notes.length > 0
                          ? m.notes.map((n) => n.valeur.toFixed(1)).join(" / ")
                          : "--"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {m.moyenne !== null ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                              m.moyenne >= 10
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {m.moyenne.toFixed(2)}
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.moyenneGenerale !== null && (
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-600">
                Moyenne generale ponderee
              </span>
              <span className="text-lg font-bold text-indigo-700">
                {data.moyenneGenerale.toFixed(2)} / 20
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MA SITUATION FINANCIERE */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Ma situation financiere</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.paiements.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg border p-3 text-center transition-all ${
                  p.statut === "PAYE"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <p className="text-sm font-semibold text-neutral-900">
                  {MOIS_COMPLETS[p.mois]}
                </p>
                <p className="text-sm text-neutral-400">{p.annee}</p>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      p.statut === "PAYE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.statut === "PAYE" ? "Paye" : "Non paye"}
                  </span>
                </div>
                {p.statut === "PAYE" && (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-sm font-medium text-green-700">
                      {p.montant.toLocaleString("fr-FR")} F
                    </p>
                    <p className="text-xs text-neutral-400">
                      {MODE_LABELS[p.mode || ""] || ""}
                    </p>
                    {p.recu_numero && (
                      <a
                        href={`/api/paiements/recu?paiement_id=${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-500 hover:underline"
                      >
                        Recu
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MON EMPLOI DU TEMPS */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Mon emploi du temps</h2>
        </div>
        <div>
          <EmploiDuTempsViewer classeId={data.eleve.classe.id} />
        </div>
      </div>

      {/* MES NOTIFICATIONS */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-900">
              Mes notifications
            </h2>
            {nonLues > 0 && (
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                {nonLues}
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          {data.notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
              <p className="text-sm text-neutral-500">Aucune notification pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`border border-neutral-200 rounded-lg p-3 transition-all ${
                    n.lu ? "bg-white" : "bg-indigo-50 border-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-neutral-900">{n.titre}</span>
                        {n.type && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-50 text-neutral-500 border border-neutral-200">
                            {n.type}
                          </span>
                        )}
                        {!n.lu && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">{n.message}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {new Date(n.date_envoi).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.lu && (
                      <button
                        onClick={() => marquerLu(n.id)}
                        className="text-sm text-indigo-500 hover:underline shrink-0"
                      >
                        Lu
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
