"use client";

import { useEffect, useState } from "react";
import { FileText, UserCheck, Search, Download, Loader2 } from "lucide-react";

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: { nom: string };
  date_naissance: string | null;
  nom_parent: string | null;
}

// ── Section Certificat de scolarité ──────────────────────────────────────────

function CertificatSection() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/eleves?limit=200")
      .then((r) => r.json())
      .then((d) => setEleves(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = eleves.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      e.matricule.toLowerCase().includes(q) ||
      e.classe.nom.toLowerCase().includes(q)
    );
  });

  function generate() {
    if (!selected) return;
    setGenerating(true);
    window.open(`/api/admin/certificat-scolarite?eleve_id=${selected.id}`, "_blank");
    setTimeout(() => setGenerating(false), 1500);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <FileText size={18} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-[0.9rem] font-bold text-slate-800">Certificat de scolarité</h3>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Sélectionner un élève pour générer le certificat PDF</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, matricule ou classe..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
            className="w-full pl-9 pr-4 h-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Liste déroulante */}
        {search.length >= 1 && !selected && (
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto shadow-lg">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-slate-400" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucun élève trouvé</p>
            ) : (
              filtered.slice(0, 20).map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setSelected(e); setSearch(`${e.prenom} ${e.nom}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-indigo-600">{e.prenom[0]}{e.nom[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{e.prenom} {e.nom}</p>
                    <p className="text-xs text-slate-400">{e.matricule} · {e.classe.nom}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Aperçu élève sélectionné */}
        {selected && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-indigo-600">{selected.prenom[0]}{selected.nom[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{selected.prenom} {selected.nom}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selected.matricule} · {selected.classe.nom}
                {selected.nom_parent && ` · Parent : ${selected.nom_parent}`}
              </p>
            </div>
            <button
              onClick={() => { setSelected(null); setSearch(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-white transition-colors"
            >
              Changer
            </button>
          </div>
        )}

        {/* Bouton générer */}
        <button
          onClick={generate}
          disabled={!selected || generating}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20"
        >
          {generating ? (
            <><Loader2 size={16} className="animate-spin" /> Génération...</>
          ) : (
            <><Download size={16} /> Générer le certificat PDF</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Section Autorisation d'absence ───────────────────────────────────────────

function AutorisationSection() {
  const [form, setForm] = useState({
    nom: "",
    matricule: "",
    grade: "",
    fonction: "",
    date_debut: "",
    date_fin: "",
    date_restitution: "",
    motif: "",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function nbJours() {
    if (!form.date_debut || !form.date_fin) return null;
    const diff = Math.round(
      (new Date(form.date_fin).getTime() - new Date(form.date_debut).getTime()) / 86400000
    ) + 1;
    return diff > 0 ? diff : null;
  }

  function generate() {
    if (!form.nom || !form.date_debut || !form.date_fin) {
      setError("Veuillez remplir le nom, la date de début et la date de fin.");
      return;
    }
    if (form.date_fin < form.date_debut) {
      setError("La date de fin doit être après la date de début.");
      return;
    }
    setError("");
    setGenerating(true);
    const params = new URLSearchParams({
      nom: form.nom,
      matricule: form.matricule,
      grade: form.grade,
      fonction: form.fonction,
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      date_restitution: form.date_restitution || form.date_fin,
      motif: form.motif,
    });
    window.open(`/api/admin/autorisation-absence?${params}`, "_blank");
    setTimeout(() => setGenerating(false), 1500);
  }

  const jours = nbJours();

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <UserCheck size={18} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-[0.9rem] font-bold text-slate-800">Demande d&apos;autorisation d&apos;absence</h3>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Formulaire officiel — Personnel de l&apos;établissement</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Prénom et Nom */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Prénom et Nom <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Prénom Nom"
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Matricule */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Matricule
            </label>
            <input
              type="text"
              placeholder="Matricule agent"
              value={form.matricule}
              onChange={(e) => set("matricule", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Grade */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Grade
            </label>
            <input
              type="text"
              placeholder="ex: IEPEM, CEAP..."
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Fonction */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Fonction
            </label>
            <input
              type="text"
              placeholder="ex: Professeur de Mathématiques, Directeur d'école..."
              value={form.fonction}
              onChange={(e) => set("fonction", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Date début */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Du <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.date_debut}
              onChange={(e) => set("date_debut", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Au <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.date_fin}
              onChange={(e) => set("date_fin", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Nb jours calculé automatiquement */}
          {jours !== null && (
            <div className="sm:col-span-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-amber-700 font-medium">
                Nombre de jours sollicités : <span className="font-black text-amber-800">{jours} jour{jours > 1 ? "s" : ""}</span>
              </span>
            </div>
          )}

          {/* Motif */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Motif
            </label>
            <input
              type="text"
              placeholder="Raison de l'absence"
              value={form.motif}
              onChange={(e) => set("motif", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Date de restitution */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Date(s) précise(s) de restitution
            </label>
            <input
              type="date"
              value={form.date_restitution}
              onChange={(e) => set("date_restitution", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
            />
            <p className="text-[0.68rem] text-slate-400 mt-1">Si vide, la date de fin est utilisée.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={generate}
          disabled={generating}
          className="w-full h-11 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20"
        >
          {generating ? (
            <><Loader2 size={16} className="animate-spin" /> Génération...</>
          ) : (
            <><Download size={16} /> Générer la demande PDF</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function DocumentsAdmin() {
  return (
    <div className="space-y-5">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Administration</p>
          <h2 className="text-2xl font-black tracking-tight">Documents officiels</h2>
          <p className="text-slate-400 text-sm mt-1">
            Génération de certificats de scolarité et autorisations d&apos;absence
          </p>
        </div>
      </div>

      {/* Deux sections côte à côte sur grand écran */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CertificatSection />
        <AutorisationSection />
      </div>
    </div>
  );
}
