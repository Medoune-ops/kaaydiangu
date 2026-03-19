import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

const values = [
  {
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque aspect de l'enseignement et de la vie scolaire.",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    title: "Innovation",
    description: "Des outils numeriques modernes pour un suivi en temps reel des performances scolaires.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    title: "Inclusion",
    description: "Chaque eleve est accompagne selon ses besoins et son rythme d'apprentissage.",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    gradient: "from-cyan-500 to-pink-500",
  },
  {
    title: "Discipline",
    description: "Un cadre structure qui forge le caractere et prepare a la vie professionnelle.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    gradient: "from-cyan-500 to-blue-500",
  },
];

const team = [
  { name: "M. Diallo", role: "Directeur General", initials: "MD" },
  { name: "Mme Ndiaye", role: "Censeur", initials: "MN" },
  { name: "M. Sow", role: "Responsable Pedagogique", initials: "MS" },
  { name: "Mme Fall", role: "Comptable", initials: "MF" },
];

export default function AProposPage() {
  return (
    <ScrollAnimateProvider>
      {/* Header */}
      <section className="relative bg-white py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg animate-grid-fade" />
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-cyan-400/[0.06] blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] bg-teal-400/[0.04] blur-[80px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
            <span className="text-sm font-semibold text-cyan-700 tracking-wide">Notre mission</span>
          </div>
          <h1 className="animate-slide-up-delay-1 text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight glow-text" style={{ fontFamily: "var(--font-heading)" }}>
            A propos de notre ecole
          </h1>
          <p className="animate-slide-up-delay-2 mt-6 text-neutral-500 max-w-2xl mx-auto text-lg">
            Depuis plus de 15 ans, nous formons les leaders de demain avec passion et engagement.
          </p>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-28 bg-neutral-50/50 relative section-lazy">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10 space-y-6 scroll-animate">
          <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Notre histoire</h2>
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" />
          <p className="text-neutral-500 leading-relaxed text-[16px]">
            Fondee avec la vision de creer un etablissement scolaire alliant tradition et modernite,
            notre ecole est aujourd&apos;hui une reference en matiere d&apos;enseignement de qualite.
            Notre approche pedagogique combine rigueur academique et accompagnement personnalise.
          </p>
          <p className="text-neutral-500 leading-relaxed text-[16px]">
            Grace a notre plateforme numerique, parents et eleves ont acces en temps reel aux notes,
            a l&apos;emploi du temps, aux paiements et aux cours en ligne. Cette transparence est au
            coeur de notre engagement envers les familles.
          </p>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-28 bg-white relative overflow-hidden section-lazy">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-teal-400/[0.04] blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Ce qui nous guide</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Nos valeurs</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className={`gradient-border p-8 group hover:-translate-y-1 scroll-animate scroll-animate-delay-${i + 1}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={v.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>{v.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-[15px]">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-28 bg-neutral-50/50 relative section-lazy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Leadership</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Notre equipe</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <div key={member.name} className={`text-center group scroll-animate scroll-animate-delay-${i + 1}`}>
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-200 flex items-center justify-center mx-auto text-2xl font-bold text-cyan-600 group-hover:border-cyan-400 group-hover:from-cyan-500/30 group-hover:to-teal-500/20 group-hover:scale-105 transition-all duration-400 group-hover:-translate-y-1">
                  {member.initials}
                </div>
                <div className="mt-5">
                  <p className="font-bold text-neutral-900 text-[15px]">{member.name}</p>
                  <p className="text-sm text-neutral-500 mt-1">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollAnimateProvider>
  );
}
