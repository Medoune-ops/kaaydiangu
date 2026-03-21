import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardEleve } from "@/components/dashboard/dashboard-eleve";

export const dynamic = "force-dynamic";

export default async function ElevePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const eleve = await prisma.eleve.findFirst({
    where: { user_id: session.user.id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      matricule: true,
      classe: { select: { nom: true } },
    },
  });

  if (!eleve) {
    return (
      <div className="dash-section p-8 text-center">
        <p className="text-neutral-500">Aucun profil élève associé à ce compte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">
        <span className="font-medium text-neutral-700">{eleve.prenom} {eleve.nom}</span>
        {" — "}{eleve.matricule} — {eleve.classe.nom}
      </p>
      <DashboardEleve />
    </div>
  );
}
