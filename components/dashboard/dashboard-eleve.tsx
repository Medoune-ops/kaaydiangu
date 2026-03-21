"use client";

import { useState, useEffect } from "react";
import { EmploiDuTempsViewer } from "@/components/public/emploi-du-temps-viewer";
import {
  BarChart3,
  Star,
  Wallet,
  Calendar,
  Bell,
  FileDown,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

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

const MOIS_COMPLETS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
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
      .catch(() => setError("Impossible de charger les données."))
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
      <div className="flex items-center justify-center py-16">
        <div className="dash-spinner" />
      </div>
    );
  if (error || !data) return <p className="text-sm text-red-500">{error}</p>;

  const nonLues = data.notifications.filter((n) => !n.lu).length;

  return (
    <div className="space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-kpi p-5 text-center" style={{ "--kpi-accent": "#6366f1" } as React.CSSProperties}>
          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center mb-2.5">
            <BarChart3 size={20} className="text-indigo-500" />
          </div>
          <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">Moyenne générale</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1 tracking-tight">
            {data.moyenneGenerale !== null ? `${data.moyenneGenerale.toFixed(2)}` : "--"}
          </p>
          <p className="text-sm text-neutral-400 mt-0.5">/20 — Séq. {data.sequence}</p>
        </div>

        <div className="dash-kpi p-5 text-center" style={{ "--kpi-accent": "#f59e0b" } as React.CSSProperties}>
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 flex items-center justify-center mb-2.5">
            <Star size={20} className="text-amber-500" />
          </div>
          <p className="text-xs text-amber-500 uppercase tracking-wider font-semibold">Rang</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1 tracking-tight">
            {data.rang}
            <span className="text-base font-medium text-neutral-400">{data.rang === 1 ? "er" : "e"}</span>
          </p>
          <p className="text-sm text-neutral-400 mt-0.5">sur {data.totalEleves} élèves</p>
        </div>

        <div className="dash-kpi p-5 text-center" style={{ "--kpi-accent": data.moisRestants > 0 ? "#ef4444" : "#22c55e" } as React.CSSProperties}>
          <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2.5 ${data.moisRestants > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
            <Wallet size={20} className={data.moisRestants > 0 ? "text-red-500" : "text-emerald-500"} />
          </div>
          <p className={`text-xs uppercase tracking-wider font-semibold ${data.moisRestants > 0 ? "text-red-500" : "text-emerald-500"}`}>
            Mois restants
          </p>
          <p className={`text-3xl font-bold mt-1 tracking-tight ${data.moisRestants > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {data.moisRestants}
          </p>
          <p className="text-sm text-neutral-400 mt-0.5">sur {data.paiements.length} mensualités</p>
        </div>

        <div className="dash-kpi p-5 text-center" style={{ "--kpi-accent": data.absencesNonJustifiees > 0 ? "#ef4444" : "#94a3b8" } as React.CSSProperties}>
          <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2.5 ${data.absencesNonJustifiees > 0 ? "bg-red-50" : "bg-neutral-100"}`}>
            <Calendar size={20} className={data.absencesNonJustifiees > 0 ? "text-red-500" : "text-neutral-400"} />
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Absences</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1 tracking-tight">{data.totalAbsences}</p>
          <p className="text-sm text-neutral-400 mt-0.5">
            {data.totalHeures}h — {data.absencesNonJustifiees} non justifiée(s)
          </p>
        </div>
      </div>

      {/* MES NOTES */}
      <div className="dash-section">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">
            Mes notes — Séquence {data.sequence}
          </h2>
        </div>
        <div className="p-6">
          {data.matieres.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <BarChart3 size={22} className="text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-500">Aucune note disponible pour le moment.</p>
              <p className="text-xs text-neutral-400 mt-1">Les notes apparaîtront ici une fois saisies par vos professeurs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-neutral-400">Matière</th>
                    <th className="text-center px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-neutral-400 w-14">Coef.</th>
                    <th className="text-center px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-neutral-400">Notes</th>
                    <th className="text-center px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-neutral-400 w-20">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matieres.map((m, i) => (
                    <tr
                      key={m.nom}
                      className={`border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors ${i % 2 ? "bg-neutral-50/30" : ""}`}
                    >
                      <td className="px-4 py-2.5 text-sm font-medium text-neutral-900">{m.nom}</td>
                      <td className="px-4 py-2.5 text-center text-sm text-neutral-400">{m.coefficient}</td>
                      <td className="px-4 py-2.5 text-center text-sm text-neutral-500">
                        {m.notes.length > 0
                          ? m.notes.map((n) => n.valeur.toFixed(1)).join(" / ")
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {m.moyenne !== null ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-sm font-semibold ${
                              m.moyenne >= 10
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {m.moyenne.toFixed(2)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.moyenneGenerale !== null && (
            <div className="mt-5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-600">
                Moyenne générale pondérée
              </span>
              <span className="text-xl font-bold text-indigo-700 tracking-tight">
                {data.moyenneGenerale.toFixed(2)} / 20
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MA SITUATION FINANCIÈRE */}
      <div className="dash-section">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Ma situation financière</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.paiements.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl border p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                  p.statut === "PAYE"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <p className="text-sm font-semibold text-neutral-800">{MOIS_COMPLETS[p.mois]}</p>
                <p className="text-xs text-neutral-400">{p.annee}</p>
                <div className="mt-2">
                  {p.statut === "PAYE" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={12} /> Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                      <XCircle size={12} /> Non payé
                    </span>
                  )}
                </div>
                {p.statut === "PAYE" && (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-sm font-medium text-emerald-700">
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
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-0.5"
                      >
                        <FileDown size={11} /> Reçu
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
      <div className="dash-section">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Mon emploi du temps</h2>
        </div>
        <div>
          <EmploiDuTempsViewer classeId={data.eleve.classe.id} />
        </div>
      </div>

      {/* MES NOTIFICATIONS */}
      <div className="dash-section">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900">Notifications</h2>
            {nonLues > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold bg-red-500 text-white">
                {nonLues}
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          {data.notifications.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <Bell size={22} className="text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-500">Aucune notification pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-3.5 transition-all duration-200 ${
                    n.lu ? "bg-white border-neutral-100" : "bg-indigo-50/50 border-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-neutral-900 truncate">{n.titre}</span>
                        {n.type && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-500 border border-neutral-200">
                            {n.type}
                          </span>
                        )}
                        {!n.lu && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-400">
                        <Clock size={11} />
                        <span>
                          {new Date(n.date_envoi).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    {!n.lu && (
                      <button
                        onClick={() => marquerLu(n.id)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium shrink-0 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
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
