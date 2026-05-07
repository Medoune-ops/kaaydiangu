import { prisma } from "@/lib/prisma";
import { genererRecuPDF } from "@/lib/recu-pdf";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchLogoBase64(logoUrl: string | null | undefined): Promise<string | null> {
  if (!logoUrl) return null;
  try {
    const res = await fetch(logoUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

// GET public — télécharger le reçu PDF via le paiement_id (UUID = token d'accès)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paiement_id: string }> }
) {
  try {
    const { paiement_id } = await params;

    const paiement = await prisma.paiement.findUnique({
      where: { id: paiement_id, statut: "PAYE" },
      include: {
        eleve: {
          include: {
            classe: {
              include: { ecole: true },
            },
          },
        },
        enregistre_par: { select: { nom: true, prenom: true } },
      },
    });

    if (!paiement || !paiement.recu_numero) {
      return NextResponse.json({ error: "Reçu introuvable" }, { status: 404 });
    }

    const ecole = paiement.eleve.classe.ecole;
    const enregistrePar = paiement.enregistre_par
      ? `${paiement.enregistre_par.prenom} ${paiement.enregistre_par.nom}`
      : "—";

    const logoBase64 = await fetchLogoBase64(ecole.logo);

    const pdfBuffer = await genererRecuPDF({
      ecole: {
        nom: ecole.nom,
        logo: ecole.logo,
        adresse: ecole.adresse,
        telephone: ecole.telephone,
        email: ecole.email,
        annee_scolaire: ecole.annee_scolaire,
      },
      eleve: {
        nom: paiement.eleve.nom,
        prenom: paiement.eleve.prenom,
        matricule: paiement.eleve.matricule,
        classe: paiement.eleve.classe.nom,
      },
      paiement: {
        id: paiement.id,
        recu_numero: paiement.recu_numero,
        mois: paiement.mois,
        annee: paiement.annee,
        montant: paiement.montant,
        mode: paiement.mode || "ESPECES",
        date_paiement: paiement.date_paiement?.toISOString() || new Date().toISOString(),
        enregistre_par: enregistrePar,
      },
      logoBase64,
    });

    const filename = `recu_${paiement.recu_numero}.pdf`;
    const print = req.nextUrl.searchParams.get("print") === "1";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${print ? "inline" : "attachment"}; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[ELEVE_PUBLIC_RECU_GET] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
