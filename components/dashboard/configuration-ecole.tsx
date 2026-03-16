"use client";

import { useEffect, useState, useCallback } from "react";

// ─── TYPES ───

interface EcoleData {
  id: string;
  nom: string;
  logo: string | null;
  slogan: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  annee_scolaire: string;
  frais_inscription: number;
  impaye_seuil_jours: number;
  impaye_liste_active: boolean;
}

interface ClasseData {
  id: string;
  nom: string;
  niveau: string;
  filiere: string | null;
  annee_scolaire: string;
  montant_scolarite: number;
  matieres: { id: string; nom: string; coefficient: number; professeur_id: string | null }[];
  _count: { eleves: number };
}

type Section = "infos" | "annee" | "classes" | "tarifs" | "impayes";

// ─── COMPOSANT PRINCIPAL ───

export function ConfigurationEcole() {
  const [ecole, setEcole] = useState<EcoleData | null>(null);
  const [classes, setClasses] = useState<ClasseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("infos");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    const [ecoleRes, classesRes] = await Promise.all([
      fetch("/api/ecole").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
    ]);
    if (ecoleRes.id) setEcole(ecoleRes);
    if (Array.isArray(classesRes)) setClasses(classesRes);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const updateEcole = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/ecole", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      setEcole(result);
      showMsg("success", "Modifications enregistrees");
    } else {
      showMsg("error", result.error || "Erreur");
    }
    return res.ok;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-neutral-200 rounded-full animate-spin border-t-indigo-500" />
      </div>
    );
  }

  if (!ecole) {
    return <p className="text-sm text-red-600">Erreur : ecole introuvable.</p>;
  }

  const sections: { key: Section; label: string }[] = [
    { key: "infos", label: "Informations" },
    { key: "annee", label: "Annee scolaire" },
    { key: "classes", label: "Classes" },
    { key: "tarifs", label: "Tarifs" },
    { key: "impayes", label: "Impayes" },
  ];

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-100 pb-px">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${
              activeSection === s.key
                ? "text-indigo-600 bg-white border border-neutral-200 border-b-white -mb-px"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === "infos" && (
        <SectionInfos ecole={ecole} onSave={updateEcole} showMsg={showMsg} />
      )}
      {activeSection === "annee" && (
        <SectionAnneeScolaire ecole={ecole} onSave={updateEcole} />
      )}
      {activeSection === "classes" && (
        <SectionClasses
          classes={classes}
          ecole={ecole}
          onRefresh={fetchData}
          showMsg={showMsg}
        />
      )}
      {activeSection === "tarifs" && (
        <SectionTarifs
          ecole={ecole}
          classes={classes}
          onSaveEcole={updateEcole}
          onRefresh={fetchData}
          showMsg={showMsg}
        />
      )}
      {activeSection === "impayes" && (
        <SectionImpayes ecole={ecole} onSave={updateEcole} />
      )}
    </div>
  );
}

// ─── Input helper ───
const inputCls = "w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
const labelCls = "block text-sm font-medium text-neutral-700 mb-1.5";
const btnPrimary = "h-9 px-5 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors";

// ─── SECTION 1 : INFORMATIONS ───

function SectionInfos({
  ecole,
  onSave,
  showMsg,
}: {
  ecole: EcoleData;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
  showMsg: (type: "success" | "error", text: string) => void;
}) {
  const [form, setForm] = useState({
    nom: ecole.nom,
    slogan: ecole.slogan || "",
    adresse: ecole.adresse || "",
    telephone: ecole.telephone || "",
    email: ecole.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        await onSave({ logo: data.url });
        showMsg("success", "Logo mis a jour");
      } else {
        showMsg("error", data.error || "Erreur upload");
      }
    } catch {
      showMsg("error", "Erreur lors de l'upload");
    }
    setUploading(false);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Informations de l&apos;ecole</h3>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center overflow-hidden bg-neutral-50">
          {ecole.logo ? (
            <img src={ecole.logo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          )}
        </div>
        <div>
          <label className="cursor-pointer inline-flex h-8 px-3 items-center rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors">
            {uploading ? "Upload..." : "Changer le logo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG — max 5 Mo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Nom de l&apos;ecole</label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slogan</label>
          <input
            type="text"
            value={form.slogan}
            onChange={(e) => setForm({ ...form, slogan: e.target.value })}
            className={inputCls}
            placeholder="Ex: L'excellence au service de la jeunesse"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Adresse</label>
            <input
              type="text"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Telephone</label>
            <input
              type="text"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </div>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

// ─── SECTION 2 : ANNEE SCOLAIRE ───

function SectionAnneeScolaire({
  ecole,
  onSave,
}: {
  ecole: EcoleData;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [annee, setAnnee] = useState(ecole.annee_scolaire);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ annee_scolaire: annee });
    setSaving(false);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Annee scolaire</h3>

      <div>
        <label className={labelCls}>Annee scolaire en cours</label>
        <input
          type="text"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
          className={`${inputCls} w-48`}
          placeholder="2025-2026"
        />
        <p className="text-xs text-neutral-400 mt-1">Format : 2025-2026</p>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
        <h4 className="text-sm font-medium text-neutral-900 mb-3">Sequences pedagogiques</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((seq) => (
            <div key={seq} className="bg-white rounded-lg p-3 border border-neutral-200">
              <span className="text-sm font-semibold text-neutral-900">Sequence {seq}</span>
              <p className="text-xs text-neutral-400 mt-0.5">
                {seq <= 2 ? "1er trimestre" : seq <= 4 ? "2e trimestre" : "3e trimestre"}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-3">
          6 sequences reparties sur 3 trimestres.
        </p>
      </div>

      <button onClick={handleSave} disabled={saving} className={btnPrimary}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}

// ─── SECTION 3 : CLASSES ───

function SectionClasses({
  classes,
  ecole,
  onRefresh,
  showMsg,
}: {
  classes: ClasseData[];
  ecole: EcoleData;
  onRefresh: () => void;
  showMsg: (type: "success" | "error", text: string) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editClass, setEditClass] = useState<ClasseData | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (classe: ClasseData) => {
    if (!confirm(`Supprimer la classe "${classe.nom}" ? Cette action est irreversible.`)) return;
    setDeleting(classe.id);
    const res = await fetch(`/api/classes?id=${classe.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeleting(null);
    if (res.ok) {
      showMsg("success", `Classe "${classe.nom}" supprimee`);
      onRefresh();
    } else {
      showMsg("error", data.error || "Erreur");
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Niveaux et classes</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="h-9 px-4 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          + Nouvelle classe
        </button>
      </div>

      {classes.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-8">Aucune classe creee.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="py-2.5 px-3 text-sm font-medium text-neutral-400 uppercase tracking-wider">Classe</th>
                <th className="py-2.5 px-3 text-sm font-medium text-neutral-400 uppercase tracking-wider">Niveau</th>
                <th className="py-2.5 px-3 text-sm font-medium text-neutral-400 uppercase tracking-wider">Filiere</th>
                <th className="py-2.5 px-3 text-right text-sm font-medium text-neutral-400 uppercase tracking-wider">Effectif</th>
                <th className="py-2.5 px-3 text-right text-sm font-medium text-neutral-400 uppercase tracking-wider">Scolarite</th>
                <th className="py-2.5 px-3 text-sm font-medium text-neutral-400 uppercase tracking-wider">Matieres</th>
                <th className="py-2.5 px-3 text-right text-sm font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 text-sm font-medium text-neutral-900">{c.nom}</td>
                  <td className="py-2.5 px-3 text-sm text-neutral-500">{c.niveau}</td>
                  <td className="py-2.5 px-3 text-sm text-neutral-400">{c.filiere || "—"}</td>
                  <td className="py-2.5 px-3 text-right text-sm text-neutral-900">{c._count.eleves}</td>
                  <td className="py-2.5 px-3 text-right text-sm font-medium text-neutral-900">
                    {c.montant_scolarite > 0
                      ? `${c.montant_scolarite.toLocaleString()} F`
                      : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-sm text-neutral-500">{c.matieres.length} matiere(s)</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditClass(c)}
                        className="px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deleting === c.id}
                        className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 transition-colors"
                      >
                        {deleting === c.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <ClasseModal
          ecole={ecole}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            showMsg("success", "Classe creee");
            onRefresh();
          }}
          showMsg={showMsg}
        />
      )}

      {editClass && (
        <ClasseModal
          ecole={ecole}
          classe={editClass}
          onClose={() => setEditClass(null)}
          onSaved={() => {
            setEditClass(null);
            showMsg("success", "Classe modifiee");
            onRefresh();
          }}
          showMsg={showMsg}
        />
      )}
    </div>
  );
}

function ClasseModal({
  ecole,
  classe,
  onClose,
  onSaved,
  showMsg,
}: {
  ecole: EcoleData;
  classe?: ClasseData;
  onClose: () => void;
  onSaved: () => void;
  showMsg: (type: "success" | "error", text: string) => void;
}) {
  const isEdit = !!classe;
  const [form, setForm] = useState({
    nom: classe?.nom || "",
    niveau: classe?.niveau || "",
    filiere: classe?.filiere || "",
    montant_scolarite: classe?.montant_scolarite || 0,
  });
  const [saving, setSaving] = useState(false);

  const niveaux = ["6eme", "5eme", "4eme", "3eme", "2nde", "1ere", "Tle"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = "/api/classes";
    const method = isEdit ? "PATCH" : "POST";
    const body = isEdit ? { id: classe.id, ...form } : form;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      onSaved();
    } else {
      showMsg("error", data.error || "Erreur");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">
            {isEdit ? "Modifier la classe" : "Nouvelle classe"}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nom</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={inputCls}
                placeholder="Ex: 6eme A"
              />
            </div>
            <div>
              <label className={labelCls}>Niveau</label>
              <select
                required
                value={form.niveau}
                onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                className={inputCls}
              >
                <option value="">Selectionner</option>
                {niveaux.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Filiere (optionnel)</label>
            <input
              type="text"
              value={form.filiere}
              onChange={(e) => setForm({ ...form, filiere: e.target.value })}
              className={inputCls}
              placeholder="Ex: Scientifique, Litteraire..."
            />
          </div>
          <div>
            <label className={labelCls}>Scolarite mensuelle (FCFA)</label>
            <input
              type="number"
              min={0}
              value={form.montant_scolarite}
              onChange={(e) =>
                setForm({ ...form, montant_scolarite: parseInt(e.target.value) || 0 })
              }
              className={inputCls}
            />
          </div>
          <p className="text-xs text-neutral-400">
            Annee scolaire : {ecole.annee_scolaire}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Annuler
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "..." : isEdit ? "Modifier" : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── SECTION 4 : TARIFS ───

function SectionTarifs({
  ecole,
  classes,
  onSaveEcole,
  onRefresh,
  showMsg,
}: {
  ecole: EcoleData;
  classes: ClasseData[];
  onSaveEcole: (data: Record<string, unknown>) => Promise<boolean>;
  onRefresh: () => void;
  showMsg: (type: "success" | "error", text: string) => void;
}) {
  const [frais, setFrais] = useState(ecole.frais_inscription);
  const [tarifs, setTarifs] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t: Record<string, number> = {};
    for (const c of classes) t[c.id] = c.montant_scolarite;
    setTarifs(t);
  }, [classes]);

  const handleSaveFrais = async () => {
    setSaving(true);
    await onSaveEcole({ frais_inscription: frais });
    setSaving(false);
  };

  const handleSaveTarifs = async () => {
    setSaving(true);
    const promises = Object.entries(tarifs).map(([id, montant]) =>
      fetch("/api/classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, montant_scolarite: montant }),
      })
    );
    await Promise.all(promises);
    showMsg("success", "Tarifs mis a jour");
    onRefresh();
    setSaving(false);
  };

  const niveaux = new Map<string, ClasseData[]>();
  for (const c of classes) {
    if (!niveaux.has(c.niveau)) niveaux.set(c.niveau, []);
    niveaux.get(c.niveau)!.push(c);
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Tarifs de scolarite</h3>

      {/* Frais d'inscription */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          Frais d&apos;inscription (FCFA)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            value={frais}
            onChange={(e) => setFrais(parseInt(e.target.value) || 0)}
            className={`${inputCls} w-40`}
          />
          <button onClick={handleSaveFrais} disabled={saving} className={btnPrimary}>
            Enregistrer
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Montant unique applique a l&apos;inscription de chaque eleve.
        </p>
      </div>

      {/* Tarifs par classe */}
      {classes.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">Creez des classes pour configurer les tarifs.</p>
      ) : (
        <>
          <div className="space-y-4">
            {Array.from(niveaux.entries()).map(([niveau, classesList]) => (
              <div key={niveau}>
                <h4 className="text-sm font-semibold text-neutral-500 mb-2">{niveau}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classesList.map((c) => (
                    <div key={c.id} className="border border-neutral-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-neutral-900">{c.nom}</span>
                        <span className="text-xs text-neutral-400">{c._count.eleves} eleves</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          value={tarifs[c.id] || 0}
                          onChange={(e) =>
                            setTarifs({ ...tarifs, [c.id]: parseInt(e.target.value) || 0 })
                          }
                          className={`${inputCls} h-8`}
                        />
                        <span className="text-xs text-neutral-400 whitespace-nowrap">F/mois</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSaveTarifs} disabled={saving} className={btnPrimary}>
            {saving ? "Enregistrement..." : "Enregistrer les tarifs"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── SECTION 5 : ZONE IMPAYES ───

function SectionImpayes({
  ecole,
  onSave,
}: {
  ecole: EcoleData;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [active, setActive] = useState(ecole.impaye_liste_active);
  const [seuil, setSeuil] = useState(ecole.impaye_seuil_jours);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    const newVal = !active;
    setActive(newVal);
    setSaving(true);
    await onSave({ impaye_liste_active: newVal });
    setSaving(false);
  };

  const handleSaveSeuil = async () => {
    setSaving(true);
    await onSave({ impaye_seuil_jours: seuil });
    setSaving(false);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Parametres zone impayes</h3>

      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
        <div>
          <p className="text-sm font-medium text-neutral-900">Liste publique des impayes</p>
          <p className="text-sm text-neutral-500 mt-0.5">
            {active
              ? "La liste est visible sur le site vitrine."
              : "La liste est masquee du site vitrine."}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            active ? "bg-indigo-500" : "bg-neutral-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              active ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label className={labelCls}>Seuil de retard (jours)</label>
        <p className="text-xs text-neutral-400">
          Nombre de jours apres inscription avant qu&apos;un eleve apparaisse dans la liste des impayes.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={seuil}
            onChange={(e) => setSeuil(parseInt(e.target.value) || 1)}
            className={`${inputCls} w-24`}
          />
          <span className="text-sm text-neutral-500">jours</span>
          <button onClick={handleSaveSeuil} disabled={saving} className={btnPrimary}>
            {saving ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
