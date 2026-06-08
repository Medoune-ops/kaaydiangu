import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GestionAnneesScolaires } from "@/components/dashboard/gestion-annees-scolaires";

export default async function AnneesScolairesPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Années scolaires</h2>
        <p className="text-neutral-600">
          Démarrez chaque rentrée sur une nouvelle année et archivez les précédentes sans rien perdre.
        </p>
      </div>

      <GestionAnneesScolaires />
    </div>
  );
}
