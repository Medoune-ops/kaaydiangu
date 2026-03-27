import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EleveForm } from "@/components/dashboard/eleve-form";

export const dynamic = "force-dynamic";

export default async function NouvelElevePage() {
  const session = await auth();
  if (!session) return null;

  const [classes, ecole] = await Promise.all([
    prisma.classe.findMany({
      where: { ecole_id: session.user.ecoleId },
      orderBy: [{ niveau: "asc" }, { nom: "asc" }],
      select: { id: true, nom: true, niveau: true },
    }),
    prisma.ecole.findUnique({
      where: { id: session.user.ecoleId },
      select: { frais_inscription: true },
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inscrire un nouvel élève</h2>
        <p className="text-neutral-500">
          Remplissez le formulaire pour inscrire un élève. Un compte et un matricule seront générés automatiquement.
        </p>
      </div>

      <EleveForm classes={classes} fraisInscriptionDefaut={ecole?.frais_inscription ?? 0} />
    </div>
  );
}
