"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Wallet,
  BarChart3,
  AlertTriangle,
  Clock,
  ChevronRight,
  X,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Activity,
  Zap,
} from "lucide-react";

/* ─── Types ─── */

interface ClasseInfo {
  id: string;
  nom: string;
  niveau: string;
  effectif: number;
}

interface EleveAbsence {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  absences_non_justifiees: number;
}

interface EleveImpaye {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  mois_impayes: number;
}

interface AdminStats {
  effectifTotal: number;
  classes: ClasseInfo[];
  tauxRecouvrement: number;
  moyenneEcole: number | null;
  sequenceRef: number;
  elevesAbsences: EleveAbsence[];
  nbAbsences: number;
  elevesImpayes: EleveImpaye[];
  nbImpayes: number;
}

interface AuditEntry {
  id: string;
  action: string;
  date: string;
  auteur: { nom: string; prenom: string };
  details: string | null;
}

type DetailView = "effectif" | "absences" | "impayes" | null;

/* ─── Action label map ─── */

const ACTION_META: Record<string, { label: string; dot: string; bg: string }> = {
  PAIEMENT_CREE:       { label: "Paiement enregistré",  dot: "bg-emerald-400", bg: "bg-emerald-50" },
  DEPENSE_CREEE:       { label: "Dépense ajoutée",       dot: "bg-rose-400",    bg: "bg-rose-50" },
  NOTE_SAISIE:         { label: "Notes saisies",         dot: "bg-violet-400",  bg: "bg-violet-50" },
  ABSENCE_CREEE:       { label: "Absence signalée",      dot: "bg-amber-400",   bg: "bg-amber-50" },
  ELEVE_CREE:          { label: "Élève inscrit",         dot: "bg-sky-400",     bg: "bg-sky-50" },
  USER_CREE:           { label: "Compte créé",           dot: "bg-indigo-400",  bg: "bg-indigo-50" },
  MOT_DE_PASSE_MODIFIE:{ label: "MDP modifié",           dot: "bg-slate-400",   bg: "bg-slate-50" },
  CONNEXION:           { label: "Connexion",             dot: "bg-teal-400",    bg: "bg-teal-50" },
};

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

/* ─── Main component ─── */

export function DashboardAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailView>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/audit?limit=7").then((r) => r.json()).catch(() => ({ logs: [] })),
    ])
      .then(([s, a]) => {
        setStats(s);
        setActivity(a.logs ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-indigo-100 border-t-indigo-500 border-r-indigo-300 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-3 shadow-sm">
        <AlertTriangle size={18} className="text-red-500 shrink-0" />
        <p className="text-sm text-red-600">Erreur lors du chargement des statistiques.</p>
      </div>
    );
  }

  /* ─── KPI definitions ─── */
  const recouvrementOk = stats.tauxRecouvrement >= 70;
  const kpis = [
    {
      label: "Élèves inscrits",
      value: stats.effectifTotal,
      sublabel: `${stats.classes.length} classe${stats.classes.length > 1 ? "s" : ""}`,
      icon: <Users size={18} />,
      detailKey: "effectif" as DetailView,
      border: "border-l-indigo-500",
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: { type: "up", label: "actifs cette année" },
      ring: "ring-indigo-200",
      badge: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Recouvrement",
      value: `${stats.tauxRecouvrement}%`,
      sublabel: "mois courant",
      icon: <Wallet size={18} />,
      detailKey: null as DetailView,
      border: recouvrementOk ? "border-l-emerald-500" : "border-l-amber-500",
      iconBg: recouvrementOk ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
      trend: { type: recouvrementOk ? "up" : "down", label: recouvrementOk ? "objectif atteint" : "en dessous de l'objectif" },
      ring: recouvrementOk ? "ring-emerald-200" : "ring-amber-200",
      badge: recouvrementOk ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50",
    },
    {
      label: "Moyenne école",
      value: stats.moyenneEcole !== null ? `${stats.moyenneEcole}/20` : "—",
      sublabel: `Séquence ${stats.sequenceRef}`,
      icon: <BarChart3 size={18} />,
      detailKey: null as DetailView,
      border: "border-l-violet-500",
      iconBg: "bg-violet-50 text-violet-600",
      trend: { type: "neutral", label: "séquence en cours" },
      ring: "ring-violet-200",
      badge: "text-violet-600 bg-violet-50",
    },
    {
      label: "Absences",
      value: stats.nbAbsences,
      sublabel: "non justifiées",
      icon: <AlertTriangle size={18} />,
      detailKey: "absences" as DetailView,
      border: stats.nbAbsences > 0 ? "border-l-red-500" : "border-l-emerald-500",
      iconBg: stats.nbAbsences > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600",
      trend: { type: stats.nbAbsences > 0 ? "down" : "up", label: stats.nbAbsences > 0 ? "à surveiller" : "aucun problème" },
      ring: stats.nbAbsences > 0 ? "ring-red-200" : "ring-emerald-200",
      badge: stats.nbAbsences > 0 ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Impayés",
      value: stats.nbImpayes,
      sublabel: "élèves en retard",
      icon: <Clock size={18} />,
      detailKey: "impayes" as DetailView,
      border: stats.nbImpayes > 0 ? "border-l-amber-500" : "border-l-emerald-500",
      iconBg: stats.nbImpayes > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
      trend: { type: stats.nbImpayes > 0 ? "down" : "up", label: stats.nbImpayes > 0 ? "à régulariser" : "tous à jour" },
      ring: stats.nbImpayes > 0 ? "ring-amber-200" : "ring-emerald-200",
      badge: stats.nbImpayes > 0 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-lg shadow-indigo-500/20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute right-24 bottom-0 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-16 w-32 rounded-full bg-indigo-300/10 blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-indigo-200" />
              <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">Vue d&apos;ensemble</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              Bonjour, bonne journée !
            </h2>
            <p className="text-indigo-200 text-sm mt-1">
              {stats.effectifTotal} élèves · {stats.classes.length} classes · Recouvrement{" "}
              <span className={recouvrementOk ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                {stats.tauxRecouvrement}%
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
              <p className="text-2xl font-black tabular-nums">
                {stats.moyenneEcole !== null ? stats.moyenneEcole : "—"}
              </p>
              <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider mt-0.5">
                /20 · Seq {stats.sequenceRef}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => {
          const isActive = detail === kpi.detailKey;
          const TrendIcon =
            kpi.trend.type === "up" ? TrendingUp :
            kpi.trend.type === "down" ? TrendingDown :
            Minus;
          const trendColor =
            kpi.trend.type === "up" ? "text-emerald-500" :
            kpi.trend.type === "down" ? "text-red-500" :
            "text-slate-400";

          return (
            <button
              key={kpi.label}
              onClick={() => kpi.detailKey && setDetail(isActive ? null : kpi.detailKey)}
              disabled={!kpi.detailKey}
              style={{ animationDelay: `${i * 0.06}s` }}
              className={[
                "group relative text-left w-full",
                "bg-white rounded-2xl p-5",
                "border-l-4 border border-slate-100/80",
                kpi.border,
                "shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]",
                "transition-all duration-200",
                isActive
                  ? `ring-2 ${kpi.ring} shadow-[0_4px_24px_rgba(15,23,42,0.08)]`
                  : "hover:shadow-[0_4px_20px_rgba(15,23,42,0.1)] hover:-translate-y-0.5",
                kpi.detailKey ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              {/* Header: label + icon */}
              <div className="flex items-start justify-between mb-3 gap-2">
                <p className="text-[0.8125rem] font-semibold text-slate-500 leading-tight">
                  {kpi.label}
                </p>
                <span className={`p-2 rounded-lg shrink-0 ${kpi.iconBg}`}>
                  {kpi.icon}
                </span>
              </div>

              {/* Value */}
              <div className="text-[2rem] font-black tracking-[-0.04em] text-slate-900 leading-none tabular-nums mb-2">
                {kpi.value}
              </div>

              {/* Trend + sublabel */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-[0.72rem] font-medium ${trendColor}`}>
                  <TrendIcon size={11} />
                  <span>{kpi.trend.label}</span>
                </div>
                {kpi.detailKey && (
                  <ChevronRight
                    size={12}
                    className={`transition-all duration-200 ${
                      isActive ? "rotate-90 text-indigo-400" : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-400"
                    }`}
                  />
                )}
              </div>

              {kpi.sublabel && (
                <p className="text-[0.7rem] text-slate-400 mt-0.5">{kpi.sublabel}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Charts + Activity Feed ── */}
      {!detail && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">

          {/* Bar chart — effectif par classe (4/7) */}
          {stats.classes.length > 0 && (
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
                  <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Effectif par classe</h3>
                </div>
                <span className="text-[0.72rem] font-semibold text-slate-400 uppercase tracking-wider">
                  Total · {stats.effectifTotal}
                </span>
              </div>
              <div className="p-6 space-y-3.5">
                {stats.classes.map((c) => {
                  const maxEffectif = Math.max(...stats.classes.map((cl) => cl.effectif), 1);
                  const pct = (c.effectif / maxEffectif) * 100;
                  const isMax = c.effectif === maxEffectif;
                  return (
                    <div key={c.id} className="flex items-center gap-3 group/bar">
                      <div className="w-24 shrink-0 flex items-baseline gap-1.5">
                        <span className="text-[0.8125rem] font-bold text-slate-700 truncate">{c.nom}</span>
                      </div>
                      <div className="flex-1 relative h-8 bg-slate-50 rounded-lg overflow-hidden border border-slate-100/80">
                        <div
                          className={`h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700 ${
                            isMax
                              ? "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
                              : "bg-gradient-to-r from-indigo-400/70 to-violet-400/70"
                          }`}
                          style={{ width: `${Math.max(pct, 12)}%` }}
                        >
                          <span className="text-xs font-black text-white drop-shadow-sm">{c.effectif}</span>
                        </div>
                      </div>
                      <span className={`w-8 text-right text-[0.75rem] font-bold shrink-0 ${isMax ? "text-indigo-500" : "text-slate-400"}`}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity feed (3/7) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">Activité récente</h3>
              </div>
              <Activity size={14} className="text-slate-300" />
            </div>

            {activity.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
                    <Activity size={16} className="text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400">Aucune activité récente</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {activity.map((entry) => {
                  const meta = ACTION_META[entry.action] ?? {
                    label: entry.action,
                    dot: "bg-slate-400",
                    bg: "bg-slate-50",
                  };
                  return (
                    <div key={entry.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8125rem] font-semibold text-slate-700 leading-snug truncate">
                          {entry.auteur.prenom} {entry.auteur.nom}
                        </p>
                        <p className="text-[0.72rem] text-slate-400 mt-0.5">{meta.label}</p>
                      </div>
                      <span className="text-[0.68rem] text-slate-300 font-medium shrink-0 mt-0.5">
                        {timeAgo(entry.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {activity.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-50 shrink-0">
                <a
                  href="/dashboard/admin/audit"
                  className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Voir tout le journal
                  <ArrowRight size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recouvrement donut (standalone, when no classes) ── */}
      {!detail && stats.classes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] p-8 flex flex-col items-center">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="url(#rec-grad-solo)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${stats.tauxRecouvrement * 3.14} 314`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="rec-grad-solo" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 tracking-[-0.04em]">
                {stats.tauxRecouvrement}%
              </span>
              <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider mt-0.5">collecté</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Alert strip ── */}
      {(stats.nbAbsences > 0 || stats.nbImpayes > 0) && !detail && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.nbAbsences > 0 && (
            <button
              onClick={() => setDetail("absences")}
              className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 hover:bg-red-100/60 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.8125rem] font-bold text-red-700">
                  {stats.nbAbsences} absence{stats.nbAbsences > 1 ? "s" : ""} non justifiée{stats.nbAbsences > 1 ? "s" : ""}
                </p>
                <p className="text-[0.72rem] text-red-400 mt-0.5">Cliquer pour voir les détails</p>
              </div>
              <ChevronRight size={14} className="text-red-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          )}
          {stats.nbImpayes > 0 && (
            <button
              onClick={() => setDetail("impayes")}
              className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 hover:bg-amber-100/60 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.8125rem] font-bold text-amber-700">
                  {stats.nbImpayes} élève{stats.nbImpayes > 1 ? "s" : ""} en retard de paiement
                </p>
                <p className="text-[0.72rem] text-amber-400 mt-0.5">Cliquer pour voir les détails</p>
              </div>
              <ChevronRight size={14} className="text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          )}
        </div>
      )}

      {/* ── Detail panels ── */}
      {detail === "effectif" && (
        <DetailPanel title="Effectif par classe" onClose={() => setDetail(null)} accent="from-indigo-500 to-violet-500">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <Th>Classe</Th>
                <Th>Niveau</Th>
                <Th right>Effectif</Th>
              </tr>
            </thead>
            <tbody>
              {stats.classes.map((c, i) => (
                <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="py-3 px-5 font-semibold text-slate-800">{c.nom}</td>
                  <td className="py-3 px-5 text-slate-500">{c.niveau}</td>
                  <td className="py-3 px-5 text-right">
                    <Badge color="indigo">{c.effectif}</Badge>
                  </td>
                </tr>
              ))}
              <tr className="bg-indigo-50/40 border-t border-indigo-100/60">
                <td className="py-3 px-5 font-black text-slate-900" colSpan={2}>Total</td>
                <td className="py-3 px-5 text-right font-black text-slate-900">{stats.effectifTotal}</td>
              </tr>
            </tbody>
          </table>
        </DetailPanel>
      )}

      {detail === "absences" && (
        <DetailPanel title="Élèves avec +3 absences non justifiées" onClose={() => setDetail(null)} accent="from-red-500 to-rose-500">
          {stats.elevesAbsences.length === 0 ? (
            <EmptyState text="Aucun élève concerné" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <Th>Élève</Th>
                  <Th>Matricule</Th>
                  <Th>Classe</Th>
                  <Th right>Absences</Th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesAbsences.map((e, i) => (
                  <tr key={e.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="py-3 px-5 font-semibold text-slate-800">{e.prenom} {e.nom}</td>
                    <td className="py-3 px-5 text-slate-400 font-mono text-xs">{e.matricule}</td>
                    <td className="py-3 px-5 text-slate-500">{e.classe}</td>
                    <td className="py-3 px-5 text-right"><Badge color="red">{e.absences_non_justifiees}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DetailPanel>
      )}

      {detail === "impayes" && (
        <DetailPanel title="Élèves en retard de paiement" onClose={() => setDetail(null)} accent="from-amber-500 to-orange-500">
          {stats.elevesImpayes.length === 0 ? (
            <EmptyState text="Tous les paiements sont à jour" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <Th>Élève</Th>
                  <Th>Matricule</Th>
                  <Th>Classe</Th>
                  <Th right>Mois impayés</Th>
                </tr>
              </thead>
              <tbody>
                {stats.elevesImpayes.map((e, i) => (
                  <tr key={e.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="py-3 px-5 font-semibold text-slate-800">{e.prenom} {e.nom}</td>
                    <td className="py-3 px-5 text-slate-400 font-mono text-xs">{e.matricule}</td>
                    <td className="py-3 px-5 text-slate-500">{e.classe}</td>
                    <td className="py-3 px-5 text-right"><Badge color="amber">{e.mois_impayes}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DetailPanel>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`py-3 px-5 text-[0.68rem] font-[700] text-slate-400 uppercase tracking-[0.09em] ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: "indigo" | "red" | "amber" }) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/70",
    red: "bg-red-50 text-red-600 border-red-100/70",
    amber: "bg-amber-50 text-amber-600 border-amber-100/70",
  };
  return (
    <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg font-bold text-[0.8rem] border ${styles[color]}`}>
      {children}
    </span>
  );
}

function DetailPanel({
  title,
  onClose,
  accent = "from-indigo-500 to-violet-500",
  children,
}: {
  title: string;
  onClose: () => void;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_8px_32px_rgba(15,23,42,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 bg-gradient-to-r from-slate-50/80 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-5 rounded-full bg-gradient-to-b ${accent}`} />
          <h3 className="text-[0.875rem] font-bold text-slate-800 tracking-tight">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto overflow-x-auto">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
      <p className="text-[0.875rem] text-slate-500 font-semibold">{text}</p>
    </div>
  );
}
