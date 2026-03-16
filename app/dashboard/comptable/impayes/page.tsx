import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TableauImpayes } from "@/components/dashboard/tableau-impayes";

export const dynamic = "force-dynamic";

export default async function ComptableImpayesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Suivi des impayés</h2>
        <p className="text-neutral-500">
          Liste des élèves en retard de paiement. Envoyez des rappels
          individuels ou groupés par email et notification.
        </p>
      </div>
      <TableauImpayes />
    </div>
  );
}
