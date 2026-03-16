import { SaisieNotes } from "@/components/dashboard/saisie-notes";

export default function ProfesseurNotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Saisie des notes</h2>
        <p className="text-neutral-500">
          Sélectionnez une matière, le type d&apos;évaluation et la séquence pour saisir les notes.
        </p>
      </div>

      <SaisieNotes />
    </div>
  );
}
