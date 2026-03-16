import { PointageAbsences } from "@/components/dashboard/pointage-absences";

export default function ProfesseurAbsencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pointage des absences</h2>
        <p className="text-neutral-500">
          Sélectionnez votre cours et cochez les élèves absents.
        </p>
      </div>
      <PointageAbsences />
    </div>
  );
}
