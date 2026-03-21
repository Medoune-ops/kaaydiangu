import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

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
    extrait: "IREF ouvre ses portes le samedi 28 septembre. Venez decouvrir nos locaux et rencontrer l'equipe pedagogique.",
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

const CAT_STYLE: Record<string, string> = {
  Rentree: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Resultats: "bg-amber-50 text-amber-700 border-amber-200",
  Evenement: "bg-teal-50 text-teal-700 border-teal-200",
  Numerique: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Sport: "bg-orange-50 text-orange-700 border-orange-200",
  Pedagogie: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export default function ActualitesPage() {
  return (
    <ScrollAnimateProvider>
      <section className="relative bg-white py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg animate-grid-fade" />
        <div className="absolute top-[30%] left-[30%] w-[400px] h-[400px] bg-teal-400/[0.06] blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
            <span className="text-sm font-semibold text-cyan-700 tracking-wide">Fil d&apos;info</span>
          </div>
          <h1 className="animate-slide-up-delay-1 text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight glow-text" style={{ fontFamily: "var(--font-heading)" }}>
            Actualites
          </h1>
          <p className="animate-slide-up-delay-2 mt-6 text-neutral-500 max-w-2xl mx-auto text-lg">
            Restez informe de toute l&apos;actualite de notre ecole.
          </p>
        </div>
      </section>

      <section className="py-28 bg-neutral-50/50 relative section-lazy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <div key={article.id} className={`gradient-border p-8 group hover:-translate-y-1 scroll-animate scroll-animate-delay-${(i % 3) + 1}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className={`text-xs font-semibold border rounded-lg px-2.5 py-1 transition-all duration-250 ${CAT_STYLE[article.categorie] || "bg-neutral-50 text-neutral-500 border-neutral-200"}`}>
                    {article.categorie}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {new Date(article.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 leading-snug mb-3" style={{ fontFamily: "var(--font-heading)" }}>{article.titre}</h3>
                <p className="text-neutral-500 leading-relaxed text-[15px]">{article.extrait}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollAnimateProvider>
  );
}
