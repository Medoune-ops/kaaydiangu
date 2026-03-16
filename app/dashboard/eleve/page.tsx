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
      <div>
        <h2 className="text-2xl font-bold mb-4">Mon espace élève</h2>
        <p className="text-neutral-500">Aucun profil élève associé à ce compte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mon espace élève</h2>
        <p className="text-neutral-500">
          {eleve.prenom} {eleve.nom} — {eleve.matricule} — {eleve.classe.nom}
        </p>
      </div>
      <DashboardEleve />
    </div>
  );
}
