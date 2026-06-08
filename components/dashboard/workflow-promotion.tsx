"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: { id: string; nom: string; niveau: string } | null;
}
interface ClasseLite {
  id: string;
  nom: string;
  niveau: string;
  filiere: string | null;
}
interface AnneeLite {
  id: string;
  libelle: string;
  est_active: boolean;
  est_cloturee: boolean;
}

const QUITTE = "QUITTE";

export function WorkflowPromotion({
  anneeCible,
  onClose,
  onDone,
}: {
  anneeCible: AnneeLite;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classesCible, setClassesCible] = useState<ClasseLite[]>([]);
  const [classesActive, setClassesActive] = useState<ClasseLite[]>([]);
  const [choix, setChoix] = useState<Record<string, string>>({});

  const showMsg = (type: "success" | "error", text: string) => {
    toast({ type, title: type === "success" ? "Succès" : "Erreur", description: text });
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/promotion?annee_cible_id=${anneeCible.id}`)
      .then((r) => r.json())
      .then((data) => {
        setEleves(data.eleves || []);
        setClassesCible(data.classesCible || []);
        setClassesActive(data.classesActive || []);
      })
      .catch(() => showMsg("error", "Chargement impossible"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anneeCible.id]);

  useEffect(() => { load(); }, [load]);

  const setChoixEleve = (eleveId: string, val: string) =>
    setChoix((c) => ({ ...c, [eleveId]: val }));

  // Action groupée : applique une destination à tous les élèves d'une classe source.
  const appliquerClasse = (classeSourceId: string, destination: string) => {
    setChoix((c) => {
      const next = { ...c };
      for (const e of eleves) {
        if (e.classe?.id === classeSourceId) next[e.id] = destination;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const affectations = eleves.map((e) => ({
      eleve_id: e.id,
      destination: choix[e.id] || QUITTE,
    }));
    const sansChoix = eleves.filter((e) => !choix[e.id]).length;
    const msg = sansChoix > 0
      ? `${sansChoix} élève(s) sans choix seront marqués comme "quitte l'école". Continuer ?`
      : `Confirmer la promotion vers ${anneeCible.libelle} ? L'année ${anneeCible.libelle} deviendra l'année active.`;
    if (!confirm(msg)) return;

    setSaving(true);
    const res = await fetch("/api/admin/promotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        annee_cible_id: anneeCible.id,
        affectations,
        dupliquer_classes: classesCible.length === 0,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      showMsg("success", `Promotion terminée : ${data.promus} promu(s), ${data.partants} sortie(s)`);
      onDone();
    } else {
      const data = await res.json().catch(() => ({}));
      showMsg("error", data.error || "Erreur");
    }
  };

  // Si la cible n'a pas de classes, on duplique celles de l'année active : ce
  // sont elles qui serviront de destinations.
  const destinations = classesCible.length > 0 ? classesCible : classesActive;

  // Regrouper les élèves par classe source.
  const parClasse = eleves.reduce<Record<string, { classe: Eleve["classe"]; eleves: Eleve[] }>>((acc, e) => {
    const key = e.classe?.id || "sans";
    if (!acc[key]) acc[key] = { classe: e.classe, eleves: [] };
    acc[key].eleves.push(e);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="dash-section-header !rounded-none shrink-0">
          <div>
            <span className="dash-section-title">Passage d&apos;année → {anneeCible.libelle}</span>
            <p className="text-xs text-neutral-500 mt-0.5">
              Choisissez la classe de destination de chaque élève. Sans choix, l&apos;élève est marqué comme sorti.
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-indigo-100/60 flex items-center justify-center text-neutral-400 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="dash-spinner" /></div>
          ) : eleves.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">
              Aucun élève actif à promouvoir dans l&apos;année active.
            </p>
          ) : (
            <>
              {classesCible.length === 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-3 text-xs text-amber-700">
                  L&apos;année {anneeCible.libelle} n&apos;a pas encore de classes : elles seront
                  <strong> créées automatiquement</strong> à partir de vos classes actuelles.
                </div>
              )}

              {Object.entries(parClasse).map(([key, group]) => (
                <div key={key} className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-50 px-4 py-2.5 border-b border-neutral-200">
                    <span className="text-sm font-semibold text-slate-700">
                      {group.classe?.nom || "Sans classe"}
                      <span className="text-xs font-normal text-neutral-400"> · {group.eleves.length} élève(s)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-neutral-400">Tout le groupe →</span>
                      <select
                        onChange={(e) => { if (e.target.value) appliquerClasse(group.classe?.id || "sans", e.target.value); }}
                        defaultValue=""
                        className="dash-input !py-1 !text-xs !w-auto"
                      >
                        <option value="">— Choisir —</option>
                        {destinations.map((c) => (
                          <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                        <option value={QUITTE}>Quittent l&apos;école</option>
                      </select>
                    </div>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {group.eleves.map((e) => (
                      <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                        <span className="text-sm text-slate-700">
                          {e.prenom} {e.nom}
                          <span className="text-xs text-neutral-400"> · {e.matricule}</span>
                        </span>
                        <select
                          value={choix[e.id] || ""}
                          onChange={(ev) => setChoixEleve(e.id, ev.target.value)}
                          className={`dash-input !py-1 !text-xs !w-auto min-w-[150px] ${
                            choix[e.id] === QUITTE ? "!text-red-600" : ""
                          }`}
                        >
                          <option value="">— Non défini —</option>
                          {destinations.map((c) => (
                            <option key={c.id} value={c.id}>{c.nom}</option>
                          ))}
                          <option value={QUITTE}>Quitte l&apos;école</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-neutral-100 shrink-0">
          <button type="button" onClick={onClose} className="dash-btn-secondary">Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading || eleves.length === 0}
            className="dash-btn-primary inline-flex items-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />}
            {saving ? "Traitement..." : `Lancer la promotion`}
          </button>
        </div>
      </div>
    </div>
  );
}
