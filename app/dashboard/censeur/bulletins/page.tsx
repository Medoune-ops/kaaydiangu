import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GenerationBulletins } from "@/components/dashboard/generation-bulletins";

export const dynamic = "force-dynamic";

export default async function CenseurBulletinsPage() {
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
        <h2 className="text-2xl font-bold">Génération des bulletins</h2>
        <p className="text-neutral-500">
          Sélectionnez une classe et une séquence pour télécharger les bulletins PDF.
        </p>
      </div>
      <GenerationBulletins classes={classes} />
    </div>
  );
}
