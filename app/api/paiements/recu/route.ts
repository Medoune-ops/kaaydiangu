import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { genererRecuPDF } from "@/lib/recu-pdf";
import { NextRequest, NextResponse } from "next/server";

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

// GET — télécharger ou afficher le reçu PDF d'un paiement
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const paiementId = req.nextUrl.searchParams.get("paiement_id");
  if (!paiementId) {
    return NextResponse.json({ error: "paiement_id requis" }, { status: 400 });
  }

  const paiement = await prisma.paiement.findUnique({
    where: { id: paiementId },
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

  if (!paiement || paiement.statut !== "PAYE" || !paiement.recu_numero) {
    return NextResponse.json({ error: "Reçu introuvable" }, { status: 404 });
  }

  // Contrôle d'accès : comptable/admin de la même école, ou l'élève lui-même
  const ecole = paiement.eleve.classe.ecole;
  if (session.user.role === "ELEVE") {
    if (paiement.eleve.user_id !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  } else if (!["SUPER_ADMIN", "COMPTABLE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  } else if (session.user.ecoleId !== ecole.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const enregistrePar = paiement.enregistre_par
    ? `${paiement.enregistre_par.prenom} ${paiement.enregistre_par.nom}`
    : "—";

  // Récupérer le logo en base64
  const logoBase64 = await fetchLogoBase64(ecole.logo);

  const pdfBuffer = genererRecuPDF({
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
}
