"use client";

import { useState } from "react";

interface ClasseInfo {
  id: string;
  nom: string;
  niveau: string;
  filiere: string | null;
  annee_scolaire: string;
  montant_scolarite: number;
  _count: { eleves: number };
}

interface Props {
  classes: ClasseInfo[];
  ecoleNom: string;
  anneeScolaire: string;
}

function niveauBadgeColor(niveau: string): string {
  const n = niveau.toLowerCase();
  if (n.includes("term")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (n.includes("1ère") || n.includes("premiere") || n.includes("1ere")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (n.includes("2nde") || n.includes("seconde")) return "bg-sky-100 text-sky-700 border-sky-200";
  if (n.includes("3ème") || n.includes("3eme")) return "bg-green-100 text-green-700 border-green-200";
  if (n.includes("4ème") || n.includes("4eme")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (n.includes("5ème") || n.includes("5eme")) return "bg-orange-100 text-orange-700 border-orange-200";
  if (n.includes("6ème") || n.includes("6eme")) return "bg-red-100 text-red-700 border-red-200";
  return "bg-neutral-100 text-neutral-700 border-neutral-200";
}

export function BilanAnnuelClient({ classes, ecoleNom, anneeScolaire }: Props) {
  const [selected, setSelected] = useState<ClasseInfo | null>(null);
  const [loadingPdf, setLoadingPdf]   = useState(false);
  const [loadingXlsx, setLoadingXlsx] = useState(false);
  const [printingPdf, setPrintingPdf] = useState(false);

  async function printPdf() {
    if (!selected) return;
    setPrintingPdf(true);
    try {
      const res = await fetch(`/api/admin/bilan-annuel/pdf?classeId=${selected.id}`);
      if (!res.ok) { alert("Erreur lors de la génération"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) setTimeout(() => win.print(), 1200);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setPrintingPdf(false);
    }
  }

  async function download(format: "pdf" | "excel") {
    if (!selected) return;
    const setter = format === "pdf" ? setLoadingPdf : setLoadingXlsx;
    setter(true);
    try {
      const url = `/api/admin/bilan-annuel/${format}?classeId=${selected.id}`;
      const res = await fetch(url);
      if (!res.ok) { alert("Erreur lors de la génération du fichier."); return; }
      const blob = await res.blob();
      const ext  = format === "pdf" ? "pdf" : "xlsx";
      const safeName = `bilan_annuel_${selected.nom.replace(/\s+/g, "_").toLowerCase()}.${ext}`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = safeName;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setter(false);
    }
  }

  const grouped = classes.reduce<Record<string, ClasseInfo[]>>((acc, c) => {
    (acc[c.niveau] = acc[c.niveau] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* ── Liste des classes ── */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-[#1E40AF] px-4 py-3">
            <p className="font-semibold text-white text-sm">Sélectionner une classe</p>
            <p className="text-blue-200 text-xs mt-0.5">{classes.length} classe(s) — {anneeScolaire}</p>
          </div>
          <div className="divide-y divide-neutral-100 max-h-[520px] overflow-y-auto">
            {classes.length === 0 && (
              <p className="text-sm text-neutral-500 p-4 text-center">Aucune classe enregistrée</p>
            )}
            {Object.entries(grouped).map(([niveau, nClasses]) => (
              <div key={niveau}>
                <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-100">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${niveauBadgeColor(niveau)}`}>
                    {niveau}
                  </span>
                </div>
                {nClasses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-blue-50 flex items-center justify-between gap-2
                      ${selected?.id === c.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"}`}
                  >
                    <div>
                      <p className={`font-medium text-sm ${selected?.id === c.id ? "text-blue-700" : "text-neutral-800"}`}>
                        {c.nom}
                      </p>
                      {c.filiere && <p className="text-xs text-neutral-500">{c.filiere}</p>}
                    </div>
                    <span className="text-xs text-neutral-500 shrink-0 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {c._count.eleves} élève{c._count.eleves !== 1 ? "s" : ""}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau détail / export ── */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-72 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-center px-8">
            <svg className="w-12 h-12 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold text-neutral-500">Sélectionnez une classe</p>
            <p className="text-sm text-neutral-400 mt-1">Le bilan annuel sera généré pour la classe sélectionnée</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* En-tête classe sélectionnée */}
            <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-blue-900">{selected.nom}</h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${niveauBadgeColor(selected.niveau)}`}>
                      {selected.niveau}
                    </span>
                    {selected.filiere && (
                      <span className="text-xs text-neutral-600 bg-white border border-neutral-200 px-2.5 py-1 rounded-full">
                        {selected.filiere}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selected._count.eleves} élève{selected._count.eleves !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selected.annee_scolaire}
                    </span>
                    {selected.montant_scolarite > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selected.montant_scolarite.toLocaleString("fr-FR")} FCFA / mois
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-neutral-400 hover:text-neutral-600 mt-1"
                  title="Désélectionner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu du bilan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export PDF */}
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">Bilan PDF</p>
                    <p className="text-xs text-neutral-500">Document imprimable & signable</p>
                  </div>
                </div>
                <ul className="text-xs text-neutral-600 space-y-1 pl-1">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />Tableau de classement avec rangs</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />Moyennes, mentions et décisions</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />KPIs de classe (taux de réussite...)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />Zone de signature (censeur, directeur)</li>
                </ul>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => download("pdf")}
                    disabled={loadingPdf || printingPdf}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium transition-colors"
                  >
                    {loadingPdf ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Génération…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger
                      </>
                    )}
                  </button>
                  <button
                    onClick={printPdf}
                    disabled={printingPdf || loadingPdf}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 text-red-700 text-sm font-medium transition-colors"
                  >
                    {printingPdf ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Impression…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimer
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Export Excel */}
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">Bilan Excel</p>
                    <p className="text-xs text-neutral-500">Archivage & transition annuelle</p>
                  </div>
                </div>
                <ul className="text-xs text-neutral-600 space-y-1 pl-1">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />Onglet Classement (rangs, décisions)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />Onglet Notes par matière (matrice)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />Onglet Absences & Paiements</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />Onglet &quot;Export nouvelle année&quot; (admis / redoublants)</li>
                </ul>
                <button
                  onClick={() => download("excel")}
                  disabled={loadingXlsx}
                  className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white text-sm font-medium transition-colors"
                >
                  {loadingXlsx ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Génération en cours…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Télécharger le fichier Excel
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Note d'usage */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium">Comment utiliser ces exports pour la rentrée suivante ?</p>
                <p className="mt-1 text-amber-700">
                  L&apos;onglet &ldquo;Export nouvelle année&rdquo; du fichier Excel liste tous les élèves avec leur décision (Admis/Redoublant).
                  Filtrez sur la colonne <strong>Décision</strong> pour savoir qui passe en classe supérieure et qui redouble.
                  Le matricule est conservé pour retrouver chaque élève facilement lors de la réinscription.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
