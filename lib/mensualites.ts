/**
 * Génère la liste des mensualités d'une année scolaire.
 *
 * Convention du projet : mois 0 = frais d'inscription, puis Octobre (10) de
 * l'année de début jusqu'à Juillet (7) de l'année suivante.
 *
 * @param anneeDebut Année civile de la rentrée (ex: 2025 pour 2025-2026).
 */
export function genererMensualites(anneeDebut: number): { mois: number; annee: number }[] {
  const moisDebut = 10; // Octobre
  const moisFin = 7; // Juillet

  const liste: { mois: number; annee: number }[] = [{ mois: 0, annee: anneeDebut }]; // 0 = Inscription
  for (let m = moisDebut; m <= 12; m++) {
    liste.push({ mois: m, annee: anneeDebut });
  }
  for (let m = 1; m <= moisFin; m++) {
    liste.push({ mois: m, annee: anneeDebut + 1 });
  }
  return liste;
}

/**
 * Déduit l'année civile de début à partir d'un libellé d'année scolaire.
 * "2025-2026" → 2025. Fallback : année courante selon la date du jour.
 */
export function anneeDebutDepuisLibelle(libelle: string): number {
  const match = libelle.match(/(\d{4})/);
  if (match) return parseInt(match[1], 10);
  const now = new Date();
  return now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
}
