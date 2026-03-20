import { SaisieNotes } from "@/components/dashboard/saisie-notes";

export default function CenseurNotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Saisie des notes</h2>
        <p className="text-neutral-500">
          Selectionnez une classe, une matiere, le type d&apos;evaluation et la sequence pour saisir les notes.
        </p>
      </div>

      <SaisieNotes matieresApiUrl="/api/censeur/matieres" />
    </div>
  );
}
