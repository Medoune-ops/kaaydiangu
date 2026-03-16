import { prisma } from "@/lib/prisma";

/**
 * Génère un matricule au format ANNEE-CLASSECODE-NUMERO
 * Ex: 2025-3A-0042
 */
export async function genererMatricule(classeNom: string): Promise<string> {
  const annee = new Date().getFullYear();

  // Extraire un code court de la classe (ex: "3ème A" -> "3A")
  const classeCode = classeNom
    .replace(/[èéê]/g, "e")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4);

  const prefix = `${annee}-${classeCode}-`;

  // Trouver le dernier matricule avec ce préfixe
  const dernier = await prisma.eleve.findFirst({
    where: { matricule: { startsWith: prefix } },
    orderBy: { matricule: "desc" },
    select: { matricule: true },
  });

  let numero = 1;
  if (dernier) {
    const parts = dernier.matricule.split("-");
    const last = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(last)) numero = last + 1;
  }

  return `${prefix}${numero.toString().padStart(4, "0")}`;
}
