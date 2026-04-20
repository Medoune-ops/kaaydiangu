import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EleveForm } from "@/components/dashboard/eleve-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ComptableNouvelElevePage() {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    redirect("/login");
  }

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
          En tant que comptable, vous enregistrez l'élève et son paiement d'inscription simultanément.
        </p>
      </div>

      <EleveForm classes={classes} fraisInscriptionDefaut={ecole?.frais_inscription ?? 0} />
    </div>
  );
}
