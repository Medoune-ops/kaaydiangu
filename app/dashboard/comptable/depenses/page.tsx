import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GestionDepenses } from "@/components/dashboard/gestion-depenses";

export const dynamic = "force-dynamic";

export default async function ComptableDepensesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des dépenses</h2>
        <p className="text-neutral-500">
          Enregistrez et suivez toutes les sorties d'argent de l'établissement.
        </p>
      </div>
      <GestionDepenses />
    </div>
  );
}
