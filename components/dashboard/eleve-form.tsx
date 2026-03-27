"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { PhotoUpload } from "@/components/dashboard/photo-upload";
import { genererRecuInscriptionPDF } from "@/lib/recu-inscription-pdf";

interface Classe {
  id: string;
  nom: string;
  niveau: string;
}

interface EleveFormProps {
  classes: Classe[];
  fraisInscriptionDefaut?: number;
}

interface ResultData {
  matricule: string;
  email: string;
  mot_de_passe_provisoire: string;
  nom: string;
  prenom: string;
  classe_nom: string;
  date_inscription: string;
  montant_inscription: number;
  ecole: {
    nom: string;
    adresse?: string | null;
    telephone?: string | null;
    email?: string | null;
    annee_scolaire: string;
    logo?: string | null;
  } | null;
}

export function EleveForm({ classes, fraisInscriptionDefaut = 0 }: EleveFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    date_naissance: "",
    sexe: "",
    adresse: "",
    nom_parent: "",
    telephone_parent: "",
    email_parent: "",
    classe_id: "",
    montant_inscription: fraisInscriptionDefaut,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleMontantChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, montant_inscription: Number(e.target.value) || 0 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/eleves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photo: photoUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      setResult(data);
      toast({ type: "success", title: "Eleve inscrit", description: `Matricule: ${data.matricule}` });
    } catch {
      setError("Erreur reseau. Reessayez.");
    } finally {
      setLoading(false);
    }
  }

  const generateRecuPDF = useCallback(() => {
    if (!result || !result.ecole) return null;
    return genererRecuInscriptionPDF({
      ecole: {
        nom: result.ecole.nom,
        adresse: result.ecole.adresse,
        telephone: result.ecole.telephone,
        email: result.ecole.email,
        annee_scolaire: result.ecole.annee_scolaire,
        logo: result.ecole.logo,
      },
      eleve: {
        nom: result.nom,
        prenom: result.prenom,
        matricule: result.matricule,
        classe: result.classe_nom,
        date_inscription: result.date_inscription,
      },
      credentials: {
        email: result.email,
        mot_de_passe: result.mot_de_passe_provisoire,
      },
      montant_inscription: result.montant_inscription,
    });
  }, [result]);

  const handleDownloadRecu = useCallback(() => {
    const pdfBuffer = generateRecuPDF();
    if (!pdfBuffer) return;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recu-inscription-${result?.matricule}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generateRecuPDF, result?.matricule]);

  const handlePrintRecu = useCallback(() => {
    const pdfBuffer = generateRecuPDF();
    if (!pdfBuffer) return;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url);
    if (w) {
      w.onload = () => {
        w.print();
        URL.revokeObjectURL(url);
      };
    }
  }, [generateRecuPDF]);

  if (result) {
    return (
      <div className="bg-white rounded-xl border border-green-200">
        <div className="px-6 py-4 border-b border-green-100">
          <h2 className="text-lg font-semibold text-green-800">Eleve inscrit avec succes</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-lg p-4 border border-neutral-200 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Matricule</span>
              <span className="font-mono font-bold text-sm text-neutral-900">{result.matricule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Email de connexion</span>
              <span className="font-mono text-sm text-neutral-900">{result.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Mot de passe provisoire</span>
              <span className="font-mono text-sm text-red-600">{result.mot_de_passe_provisoire}</span>
            </div>
          </div>

          {/* Boutons recu d'inscription */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 space-y-3">
            <p className="text-sm font-medium text-indigo-900">
              Recu d&apos;inscription
            </p>
            <p className="text-xs text-indigo-700">
              Le recu contient le matricule et le mot de passe de l&apos;eleve. Imprimez-le et remettez-le au parent.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadRecu}
                className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition-colors inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Telecharger le recu
              </button>
              <button
                onClick={handlePrintRecu}
                className="h-9 px-4 bg-white text-indigo-700 text-sm rounded-lg font-medium border border-indigo-200 hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                Imprimer
              </button>
            </div>
          </div>

          <p className="text-sm text-green-700">
            10 mensualites ont ete initialisees pour cette annee scolaire.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/censeur/eleves")}
              className="h-9 px-4 bg-white text-neutral-900 text-sm rounded-lg font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              Retour a la liste
            </button>
            <button
              onClick={() => {
                setResult(null);
                setForm({
                  nom: "",
                  prenom: "",
                  date_naissance: "",
                  sexe: "",
                  adresse: "",
                  nom_parent: "",
                  telephone_parent: "",
                  email_parent: "",
                  classe_id: "",
                  montant_inscription: fraisInscriptionDefaut,
                });
                setPhotoUrl("");
              }}
              className="h-9 px-4 bg-white text-neutral-900 text-sm rounded-lg font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              Inscrire un autre eleve
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identite */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base text-neutral-900">Identite de l&apos;eleve</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-neutral-900 mb-1">Nom <span className="text-red-500">*</span></label>
                <input
                  id="nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-neutral-900 mb-1">Prenom <span className="text-red-500">*</span></label>
                <input
                  id="prenom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_naissance" className="block text-sm font-medium text-neutral-900 mb-1">Date de naissance</label>
                <input
                  id="date_naissance"
                  name="date_naissance"
                  type="date"
                  value={form.date_naissance}
                  onChange={handleChange}
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="sexe" className="block text-sm font-medium text-neutral-900 mb-1">Sexe</label>
                <select
                  id="sexe"
                  name="sexe"
                  value={form.sexe}
                  onChange={handleChange}
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Selectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Feminin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Photo</label>
              <PhotoUpload onUpload={setPhotoUrl} currentUrl={photoUrl} />
            </div>

            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-neutral-900 mb-1">Adresse</label>
              <input
                id="adresse"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Parent */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base text-neutral-900">Informations du parent</h3>
            <div>
              <label htmlFor="nom_parent" className="block text-sm font-medium text-neutral-900 mb-1">Nom du parent</label>
              <input
                id="nom_parent"
                name="nom_parent"
                value={form.nom_parent}
                onChange={handleChange}
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="telephone_parent" className="block text-sm font-medium text-neutral-900 mb-1">Telephone parent</label>
                <input
                  id="telephone_parent"
                  name="telephone_parent"
                  type="tel"
                  value={form.telephone_parent}
                  onChange={handleChange}
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="email_parent" className="block text-sm font-medium text-neutral-900 mb-1">Email parent</label>
                <input
                  id="email_parent"
                  name="email_parent"
                  type="email"
                  value={form.email_parent}
                  onChange={handleChange}
                  className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Classe */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base text-neutral-900">Affectation</h3>
            <div>
              <label htmlFor="classe_id" className="block text-sm font-medium text-neutral-900 mb-1">Classe <span className="text-red-500">*</span></label>
              <select
                id="classe_id"
                name="classe_id"
                value={form.classe_id}
                onChange={handleChange}
                required
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Selectionner une classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.niveau})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="montant_inscription" className="block text-sm font-medium text-neutral-900 mb-1">Frais d&apos;inscription (FCFA) <span className="text-red-500">*</span></label>
              <input
                id="montant_inscription"
                name="montant_inscription"
                type="number"
                min="0"
                step="500"
                value={form.montant_inscription}
                onChange={handleMontantChange}
                required
                className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
              )}
              {loading ? "Inscription en cours..." : "Inscrire l'eleve"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/censeur/eleves")}
              className="h-9 px-4 bg-white text-neutral-900 text-sm rounded-lg font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
