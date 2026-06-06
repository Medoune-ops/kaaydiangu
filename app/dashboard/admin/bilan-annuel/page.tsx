import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BilanAnnuelClient } from "./bilan-client";

export default async function BilanAnnuelPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const ecoleId = session.user.ecoleId;

  const [classes, ecole] = await Promise.all([
    prisma.classe.findMany({
      where: { ecole_id: ecoleId },
      select: {
        id: true,
        nom: true,
        niveau: true,
        filiere: true,
        annee_scolaire: true,
        montant_scolarite: true,
        _count: { select: { eleves: { where: { actif: true } } } },
      },
      orderBy: [{ niveau: "asc" }, { nom: "asc" }],
    }),
    prisma.ecole.findUnique({
      where: { id: ecoleId },
      select: { nom: true, annee_scolaire: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bilan annuel par classe</h2>
        <p className="text-neutral-600">
          Exportez les résultats de fin d&apos;année (PDF imprimable + Excel pour archivage et transition vers l&apos;année suivante).
        </p>
      </div>

      <BilanAnnuelClient
        classes={classes}
        ecoleNom={ecole?.nom ?? ""}
        anneeScolaire={ecole?.annee_scolaire ?? ""}
      />
    </div>
  );
}
