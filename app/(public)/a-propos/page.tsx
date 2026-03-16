const values = [
  {
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque aspect de l'enseignement et de la vie scolaire.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    ),
  },
  {
    title: "Innovation",
    description: "Une plateforme numerique moderne pour un suivi en temps reel des performances.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    ),
  },
  {
    title: "Inclusion",
    description: "Chaque eleve est accompagne selon ses besoins et son rythme d'apprentissage.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    title: "Discipline",
    description: "Un cadre structure qui forge le caractere et prepare a la vie professionnelle.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
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
    <>
      {/* Header */}
      <section className="relative bg-[#050505] py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Notre histoire</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>
            A propos de Kaaydiangu
          </h1>
          <p className="mt-5 text-neutral-400 max-w-2xl mx-auto text-lg">
            Depuis plus de 15 ans, nous formons les leaders de demain avec passion et engagement.
          </p>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Notre histoire</h2>
          <p className="text-neutral-400 leading-relaxed text-[16px]">
            Fondee avec la vision de creer un etablissement scolaire alliant tradition et modernite,
            Kaaydiangu est aujourd&apos;hui une reference en matiere d&apos;enseignement de qualite.
            Notre approche pedagogique combine rigueur academique et accompagnement personnalise.
          </p>
          <p className="text-neutral-400 leading-relaxed text-[16px]">
            Grace a notre plateforme numerique, parents et eleves ont acces en temps reel aux notes,
            a l&apos;emploi du temps, aux paiements et aux cours en ligne. Cette transparence est au
            coeur de notre engagement envers les familles.
          </p>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Ce qui nous guide</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>Nos valeurs</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-7 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-all">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-emerald-400" style={{ fontFamily: "var(--font-heading)" }}>{v.title}</h3>
                <p className="text-neutral-400 mt-2 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Leadership</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>Notre equipe</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                  {member.initials}
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
