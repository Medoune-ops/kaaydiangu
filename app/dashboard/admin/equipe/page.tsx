import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GestionEquipe } from "@/components/dashboard/gestion-equipe";

export default async function EquipePage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion de l&apos;équipe</h2>
        <p className="text-neutral-600">
          Créez et gérez les comptes du personnel (censeurs, comptables, professeurs).
        </p>
      </div>

      <GestionEquipe />
    </div>
  );
}
