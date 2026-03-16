import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EnregistrementPaiement } from "@/components/dashboard/enregistrement-paiement";

export const dynamic = "force-dynamic";

export default async function ComptablePaiementsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enregistrement des paiements</h2>
        <p className="text-neutral-500">
          Recherchez un élève, sélectionnez le mois à payer et enregistrez le
          paiement. Un reçu PDF sera généré automatiquement.
        </p>
      </div>
      <EnregistrementPaiement />
    </div>
  );
}
