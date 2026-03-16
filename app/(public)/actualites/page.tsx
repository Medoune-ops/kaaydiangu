const articles = [
  {
    id: 1,
    titre: "Rentree scolaire 2024-2025",
    extrait: "La rentree des classes est fixee au 7 octobre. Tous les eleves sont attendus a 8h00 avec leurs fournitures.",
    date: "2024-09-15",
    categorie: "Rentree",
  },
  {
    id: 2,
    titre: "Resultats du BFEM : 96% de reussite",
    extrait: "Nous sommes fiers d'annoncer un taux de reussite exceptionnel au BFEM cette annee. Felicitations a tous nos eleves !",
    date: "2024-08-20",
    categorie: "Resultats",
  },
  {
    id: 3,
    titre: "Journee portes ouvertes",
    extrait: "Mon Ecole ouvre ses portes le samedi 28 septembre. Venez decouvrir nos locaux et rencontrer l'equipe pedagogique.",
    date: "2024-09-10",
    categorie: "Evenement",
  },
  {
    id: 4,
    titre: "Lancement de la plateforme en ligne",
    extrait: "Parents et eleves peuvent desormais suivre les notes, paiements et emplois du temps depuis notre nouvelle plateforme.",
    date: "2024-09-25",
    categorie: "Numerique",
  },
  {
    id: 5,
    titre: "Tournoi inter-classes de football",
    extrait: "Le tournoi annuel de football aura lieu du 15 au 20 decembre. Les inscriptions sont ouvertes pour toutes les classes.",
    date: "2024-11-01",
    categorie: "Sport",
  },
  {
    id: 6,
    titre: "Distribution des bulletins du 1er semestre",
    extrait: "Les bulletins seront remis aux parents lors de la reunion du samedi 25 janvier a partir de 9h.",
    date: "2024-12-15",
    categorie: "Pedagogie",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Rentree: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Resultats: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Evenement: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  Numerique: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Sport: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Pedagogie: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

export default function ActualitesPage() {
  return (
    <>
      <section className="relative bg-[#050505] py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Fil d&apos;info</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>
            Actualites
          </h1>
          <p className="mt-5 text-neutral-400 max-w-2xl mx-auto text-lg">
            Restez informe de toute l&apos;actualite de Kaaydiangu.
          </p>
        </div>
      </section>

      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="group bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 overflow-hidden">
                <div className="p-7 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-white leading-snug" style={{ fontFamily: "var(--font-heading)" }}>{article.titre}</h3>
                    <span className={`shrink-0 text-xs font-semibold border rounded-lg px-2.5 py-1 ${CATEGORY_COLORS[article.categorie] || "bg-white/5 text-neutral-400 border-white/10"}`}>
                      {article.categorie}
                    </span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">{article.extrait}</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(article.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
