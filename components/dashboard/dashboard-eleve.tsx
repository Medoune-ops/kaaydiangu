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
  BookOpen,
  TrendingUp,
  TrendingDown,
  Zap,
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
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-sky-100 border-t-sky-500 border-r-sky-300 animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Chargement...</span>
      </div>
    );

  if (error || !data)
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-3">
        <p className="text-sm text-red-500">{error || "Erreur de chargement"}</p>
      </div>
    );

  const nonLues = data.notifications.filter((n) => !n.lu).length;
  const paiementsPayes = data.paiements.filter((p) => p.statut === "PAYE").length;

  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-sky-500/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute right-24 bottom-0 h-24 w-24 rounded-full bg-blue-300/20 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-sky-200" />
              <span className="text-xs font-semibold text-sky-200 uppercase tracking-widest">Mon espace</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Bonjour, {data.eleve.prenom} !
            </h2>
            <p className="text-sky-100 text-sm mt-1">
              Classe {data.eleve.classe.nom} · Matricule{" "}
              <span className="font-bold text-white font-mono">{data.eleve.matricule}</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 text-center shrink-0">
            <p className="text-2xl font-black tabular-nums">
              {data.moyenneGenerale !== null ? data.moyenneGenerale.toFixed(2) : "—"}
            </p>
            <p className="text-[10px] text-sky-200 font-semibold uppercase tracking-wider mt-0.5">
              /20 · Rang {data.rang}/{data.totalEleves}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Moyenne */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 border-l-indigo-500
          shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[0.8rem] font-semibold text-slate-500">Moyenne</p>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><BarChart3 size={16} /></span>
          </div>
          <div className="text-[1.75rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
            {data.moyenneGenerale !== null ? data.moyenneGenerale.toFixed(2) : "—"}
          </div>
          <p className="text-[0.72rem] text-slate-400 mt-1.5">/20 · Séquence {data.sequence}</p>
          <div className={`flex items-center gap-1 text-[0.72rem] font-medium mt-1 ${
            data.moyenneGenerale !== null && data.moyenneGenerale >= 10 ? "text-emerald-500" : "text-red-500"
          }`}>
            {data.moyenneGenerale !== null && data.moyenneGenerale >= 10
              ? <><TrendingUp size={11} /> au-dessus de la moyenne</>
              : <><TrendingDown size={11} /> en dessous de la moyenne</>
            }
          </div>
        </div>

        {/* Rang */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4 border-l-amber-500
          shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[0.8rem] font-semibold text-slate-500">Classement</p>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600"><Star size={16} /></span>
          </div>
          <div className="text-[1.75rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
            {data.rang}
            <span className="text-base font-bold text-slate-400 ml-0.5">
              {data.rang === 1 ? "er" : "e"}
            </span>
          </div>
          <p className="text-[0.72rem] text-slate-400 mt-1.5">sur {data.totalEleves} élèves</p>
          <div className={`flex items-center gap-1 text-[0.72rem] font-medium mt-1 ${
            data.rang <= Math.ceil(data.totalEleves / 3) ? "text-emerald-500" : "text-amber-500"
          }`}>
            {data.rang <= Math.ceil(data.totalEleves / 3)
              ? <><TrendingUp size={11} /> top du classement</>
              : <><Star size={11} /> continuez vos efforts</>
            }
          </div>
        </div>

        {/* Paiements */}
        <div className={`bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4
          shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] ${
          data.moisRestants > 0 ? "border-l-red-500" : "border-l-emerald-500"
        }`}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-[0.8rem] font-semibold text-slate-500">Paiements</p>
            <span className={`p-2 rounded-lg ${data.moisRestants > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              <Wallet size={16} />
            </span>
          </div>
          <div className="text-[1.75rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
            {paiementsPayes}
            <span className="text-base font-bold text-slate-400 ml-0.5">/{data.paiements.length}</span>
          </div>
          <p className="text-[0.72rem] text-slate-400 mt-1.5">mensualités payées</p>
          <div className={`flex items-center gap-1 text-[0.72rem] font-medium mt-1 ${
            data.moisRestants > 0 ? "text-red-500" : "text-emerald-500"
          }`}>
            {data.moisRestants > 0
              ? <><TrendingDown size={11} /> {data.moisRestants} mois restant{data.moisRestants > 1 ? "s" : ""}</>
              : <><CheckCircle2 size={11} /> tout à jour</>
            }
          </div>
        </div>

        {/* Absences */}
        <div className={`bg-white rounded-2xl p-5 border border-slate-100/80 border-l-4
          shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] ${
          data.absencesNonJustifiees > 0 ? "border-l-rose-500" : "border-l-slate-300"
        }`}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-[0.8rem] font-semibold text-slate-500">Absences</p>
            <span className={`p-2 rounded-lg ${data.absencesNonJustifiees > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"}`}>
              <Calendar size={16} />
            </span>
          </div>
          <div className="text-[1.75rem] font-black tracking-[-0.04em] text-slate-900 tabular-nums leading-none">
            {data.totalAbsences}
          </div>
          <p className="text-[0.72rem] text-slate-400 mt-1.5">{data.totalHeures}h · {data.absencesNonJustifiees} non justifiée{data.absencesNonJustifiees > 1 ? "s" : ""}</p>
          <div className={`flex items-center gap-1 text-[0.72rem] font-medium mt-1 ${
            data.absencesNonJustifiees > 0 ? "text-rose-500" : "text-slate-400"
          }`}>
            {data.absencesNonJustifiees > 0
              ? <><TrendingDown size={11} /> à régulariser</>
              : <><CheckCircle2 size={11} /> aucune non justifiée</>
            }
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
            <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Mes notes — Séquence {data.sequence}</h3>
          </div>
          <BookOpen size={14} className="text-slate-300" />
        </div>

        {data.matieres.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <BarChart3 size={18} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Aucune note disponible</p>
            <p className="text-xs text-slate-400 mt-1">Les notes apparaîtront ici une fois saisies par vos professeurs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-3 px-5 text-left text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Matière</th>
                  <th className="py-3 px-5 text-center text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em] w-16">Coef.</th>
                  <th className="py-3 px-5 text-center text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em]">Notes</th>
                  <th className="py-3 px-5 text-center text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em] w-24">Moyenne</th>
                </tr>
              </thead>
              <tbody>
                {data.matieres.map((m, i) => (
                  <tr key={m.nom} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="py-3 px-5 font-semibold text-slate-800">{m.nom}</td>
                    <td className="py-3 px-5 text-center text-slate-400 text-xs font-mono">{m.coefficient}</td>
                    <td className="py-3 px-5 text-center text-slate-500 font-mono text-xs">
                      {m.notes.length > 0 ? m.notes.map((n) => n.valeur.toFixed(1)).join(" / ") : "—"}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {m.moyenne !== null ? (
                        <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-0.5 rounded-lg font-bold text-[0.8rem] border ${
                          m.moyenne >= 10
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {m.moyenne.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.moyenneGenerale !== null && (
              <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-50/50 border-t border-indigo-100/60">
                <span className="text-sm font-bold text-indigo-800">Moyenne générale pondérée</span>
                <span className="text-xl font-black text-indigo-700 tracking-tight tabular-nums">
                  {data.moyenneGenerale.toFixed(2)} / 20
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Situation financière */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Ma situation financière</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[0.72rem] font-semibold text-slate-400">
              {paiementsPayes}/{data.paiements.length} payés
            </span>
            <Wallet size={14} className="text-slate-300" />
          </div>
        </div>

        {/* Progress bar */}
        {data.paiements.length > 0 && (
          <div className="px-6 pt-4 pb-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                style={{ width: `${Math.round((paiementsPayes / data.paiements.length) * 100)}%` }}
              />
            </div>
            <p className="text-[0.68rem] text-slate-400 mt-1 text-right font-medium">
              {Math.round((paiementsPayes / data.paiements.length) * 100)}% réglé
            </p>
          </div>
        )}

        <div className="p-5 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {data.paiements.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-xl border p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                  p.statut === "PAYE"
                    ? "border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-emerald-50/30 shadow-[0_2px_8px_rgba(16,185,129,0.08)]"
                    : "border-red-200/60 bg-gradient-to-b from-red-50/70 to-red-50/20"
                }`}
              >
                {/* Status dot */}
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${
                  p.statut === "PAYE" ? "bg-emerald-400" : "bg-red-400"
                }`} />

                <p className="text-xs font-bold text-slate-700">{MOIS_COMPLETS[p.mois]}</p>
                <p className="text-[10px] text-slate-400">{p.annee}</p>
                <div className="mt-2">
                  {p.statut === "PAYE" ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={9} /> Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-red-100 text-red-700">
                      <XCircle size={9} /> Impayé
                    </span>
                  )}
                </div>
                {p.statut === "PAYE" && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] font-black text-emerald-700 tabular-nums">
                      {p.montant.toLocaleString("fr-FR")} F
                    </p>
                    {p.recu_numero && (
                      <a
                        href={`/api/paiements/recu?paiement_id=${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] text-indigo-500 hover:text-indigo-700 font-bold transition-colors"
                      >
                        <FileDown size={9} /> Reçu PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emploi du temps */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
          <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
          <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Mon emploi du temps</h3>
        </div>
        <div>
          <EmploiDuTempsViewer classeId={data.eleve.classe.id} />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
          <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-rose-500 to-pink-500" />
          <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Notifications</h3>
          {nonLues > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm">
              {nonLues}
            </span>
          )}
        </div>

        <div className="p-4">
          {data.notifications.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <Bell size={18} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-3.5 transition-all duration-200 ${
                    n.lu
                      ? "bg-white border-slate-100"
                      : "bg-gradient-to-r from-indigo-50/60 to-violet-50/30 border-indigo-200/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-800 truncate">{n.titre}</span>
                        {n.type && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500">
                            {n.type}
                          </span>
                        )}
                        {!n.lu && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-sm shadow-indigo-500/50" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[0.72rem] text-slate-400">
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
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold shrink-0 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
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
