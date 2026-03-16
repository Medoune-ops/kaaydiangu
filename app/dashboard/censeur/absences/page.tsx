import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VueAbsences } from "@/components/dashboard/vue-absences";

export const dynamic = "force-dynamic";

export default async function CenseurAbsencesPage() {
  const session = await auth();
  if (!session) return null;

  const classes = await prisma.classe.findMany({
    where: { ecole_id: session.user.ecoleId },
    orderBy: [{ niveau: "asc" }, { nom: "asc" }],
    select: { id: true, nom: true, niveau: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Suivi des absences</h2>
        <p className="text-neutral-500">
          Vue globale des absences avec filtres et alertes de dépassement.
        </p>
      </div>
      <VueAbsences classes={classes} />
    </div>
  );
}
