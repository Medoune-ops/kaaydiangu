import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TableauBordFinancier } from "@/components/dashboard/tableau-bord-financier";

export const dynamic = "force-dynamic";

export default async function ComptablePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tableau de bord — Comptabilité</h2>
        <p className="text-neutral-500">
          Vue d'ensemble des finances de l'établissement.
        </p>
      </div>
      <TableauBordFinancier />
    </div>
  );
}
