import Link from "next/link";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";
import { TiltCard } from "@/components/ui/tilt-card";

const values = [
  {
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque aspect de l'enseignement et de la vie scolaire.",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    from: "from-cyan-500/25", to: "to-teal-500/25", border: "border-cyan-500/20", ic: "text-cyan-300",
    grad: "from-cyan-500 to-teal-500",
  },
  {
    title: "Innovation",
    description: "Des outils numériques modernes pour un suivi en temps réel des performances scolaires.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    from: "from-teal-500/25", to: "to-cyan-500/25", border: "border-teal-500/20", ic: "text-teal-300",
    grad: "from-teal-500 to-cyan-500",
  },
  {
    title: "Inclusion",
    description: "Chaque élève est accompagné selon ses besoins et son rythme d'apprentissage.",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    from: "from-violet-500/25", to: "to-indigo-500/25", border: "border-violet-500/20", ic: "text-violet-300",
    grad: "from-violet-500 to-indigo-500",
  },
  {
    title: "Discipline",
    description: "Un cadre structuré qui forge le caractère et prépare à la vie professionnelle.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    from: "from-indigo-500/25", to: "to-cyan-500/25", border: "border-indigo-500/20", ic: "text-indigo-300",
    grad: "from-indigo-500 to-cyan-500",
  },
];

const team = [
  { name: "M. Diallo",   role: "Directeur Général",       initials: "MD", from: "from-cyan-500/25",   to: "to-teal-500/25",   border: "border-cyan-500/20",   ic: "text-cyan-300"   },
  { name: "Mme Ndiaye",  role: "Censeur",                 initials: "MN", from: "from-teal-500/25",   to: "to-cyan-500/25",   border: "border-teal-500/20",   ic: "text-teal-300"   },
  { name: "M. Sow",      role: "Responsable Pédagogique", initials: "MS", from: "from-violet-500/25", to: "to-indigo-500/25", border: "border-violet-500/20", ic: "text-violet-300" },
  { name: "Mme Fall",    role: "Comptable",               initials: "MF", from: "from-indigo-500/25", to: "to-cyan-500/25",   border: "border-indigo-500/20", ic: "text-indigo-300" },
];

const milestones = [
  { year: "2009", label: "Fondation de l'école avec 3 classes et 80 élèves." },
  { year: "2014", label: "Ouverture du cycle secondaire et construction des nouveaux bâtiments." },
  { year: "2019", label: "Lancement de la salle informatique et des activités parascolaires." },
  { year: "2024", label: "Déploiement de la plateforme numérique pour parents et élèves." },
];

export default function AProposPage() {
  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Cinématographique sombre                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#020c1b]">
        <div className="film-grain z-[1]" />
        <div className="absolute inset-0 dot-grid opacity-30 z-[3] pointer-events-none" />

        <div className="absolute top-[5%] -left-[10%] w-[700px] h-[700px] rounded-full bg-cyan-500/[0.09] blur-[200px] animate-aurora z-[2] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.07] blur-[180px] animate-aurora-mid z-[2] pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020c1b] to-transparent z-[3] pointer-events-none" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%] z-[5]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full text-center py-32">
          <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-dark border border-cyan-500/20 mb-5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 ping-ring" />
            <span className="text-sm font-medium text-cyan-300 tracking-wide">Notre mission</span>
          </div>
          <h1
            className="animate-slide-up-delay-1 text-[clamp(2.6rem,5.5vw,4.2rem)] font-extrabold tracking-[-0.045em] leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            À propos de <span className="text-shimmer">notre école</span>
          </h1>
          <p className="animate-slide-up-delay-2 mt-5 text-[15px] text-white/50 leading-relaxed max-w-xl mx-auto">
            Depuis plus de <span className="text-white/80 font-semibold">15 ans</span>, nous formons les leaders de demain avec passion, rigueur et engagement.
          </p>
          {/* Stats row */}
          <div className="animate-fade-in mt-8 flex flex-wrap items-center gap-3 justify-center">
            {[
              { val: "15+", label: "Années d'expérience" },
              { val: "1 200+", label: "Élèves formés" },
              { val: "94%", label: "Taux de réussite" },
              { val: "50+", label: "Enseignants qualifiés" },
            ].map((s) => (
              <div key={s.val} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-dark border border-white/[0.07] animate-float-gentle">
                <span className="text-[13px] font-extrabold text-transparent bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text">{s.val}</span>
                <span className="text-white/40 text-[12px]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  HISTOIRE — Section claire avec timeline              */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#f1f3f9] relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-400/[0.04] blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-20">
          <div className="text-center mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cyan-200/80 shadow-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Depuis 2009</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Notre histoire
            </h2>
            <p className="text-neutral-500 mt-5 max-w-xl mx-auto text-lg leading-relaxed">
              Fondée avec la vision de créer un établissement alliant tradition et modernité.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-14 items-start scroll-animate">
            {/* Texte */}
            <div className="space-y-5">
              <p className="text-neutral-500 leading-relaxed text-[16px]">
                Fondée avec la vision de créer un établissement scolaire alliant tradition et modernité,
                notre école est aujourd&apos;hui une référence en matière d&apos;enseignement de qualité.
                Notre approche pédagogique combine rigueur académique et accompagnement personnalisé.
              </p>
              <p className="text-neutral-500 leading-relaxed text-[16px]">
                Grâce à notre plateforme numérique, parents et élèves ont accès en temps réel aux notes,
                à l&apos;emploi du temps, aux paiements et aux cours en ligne. Cette transparence est au
                cœur de notre engagement envers les familles.
              </p>
              <Link
                href="/contact"
                className="inline-flex h-11 px-6 items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl text-[15px] hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/25 transition-all duration-300 mt-2"
              >
                Nous contacter
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>

            {/* Timeline */}
            <div className="relative pl-8 border-l-2 border-neutral-200 space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative scroll-animate scroll-animate-delay-${i + 1}`}>
                  <div className="absolute -left-[2.35rem] top-1 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 shadow-lg shadow-cyan-500/30 border-2 border-[#f1f3f9]" />
                  <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.05),0_4px_16px_rgba(15,23,42,0.03)] p-5">
                    <div className="text-xs font-bold text-cyan-600 mb-1">{m.year}</div>
                    <p className="text-neutral-600 text-[15px] leading-relaxed">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  VALEURS — Section sombre glassmorphism               */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#020c1b] relative overflow-hidden clip-angle-both section-lazy">
        <div className="absolute top-[5%] right-[8%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.12] blur-[170px] animate-aurora-slow pointer-events-none" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.10] blur-[150px] animate-aurora-mid pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-45" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%]" />
        <div className="film-grain z-[1] opacity-50" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-24">
          <div className="text-center mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border border-cyan-500/20 mb-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-sm font-semibold text-cyan-300 tracking-wide">Ce qui nous guide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Nos valeurs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <TiltCard key={v.title} intensity={6} className={`scroll-animate scroll-animate-delay-${i + 1}`}>
                <div className={`glass-dark p-8 h-full flex flex-col cursor-default border ${v.border}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.from} ${v.to} border ${v.border} flex items-center justify-center mb-6`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={v.ic}>
                      <path d={v.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>{v.title}</h3>
                  <p className="text-white/50 leading-relaxed text-[15px] flex-1">{v.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="gradient-line absolute bottom-0 left-[8%] right-[8%]" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  ÉQUIPE — Section claire                              */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#f1f3f9] relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/[0.04] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-20">
          <div className="text-center mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cyan-200/80 shadow-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Leadership</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Notre équipe
            </h2>
            <p className="text-neutral-500 mt-5 max-w-lg mx-auto text-lg leading-relaxed">
              Des professionnels dévoués à la réussite de chaque élève.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <TiltCard key={member.name} intensity={8} className={`scroll-animate scroll-animate-delay-${i + 1}`}>
                <div className={`text-center p-6 glass-card group cursor-default border ${member.border}`}>
                  <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${member.from} ${member.to} border ${member.border} flex items-center justify-center mx-auto text-2xl font-bold ${member.ic}`}>
                    {member.initials}
                  </div>
                  <div className="mt-5">
                    <p className="font-bold text-neutral-900 text-[15px]">{member.name}</p>
                    <p className="text-sm text-neutral-500 mt-1">{member.role}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  CTA — Gradient (identique à la page d'accueil)       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/[0.08] blur-[160px] rounded-full animate-glow-pulse" />
        <div className="absolute top-8 left-8 w-28 h-28 rounded-full border border-white/15" />
        <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full border border-white/12" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-white ping-ring" />
              <span className="text-sm font-semibold text-white/90 tracking-wide">Rentrée 2025-2026</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Rejoignez notre famille<br />scolaire
            </h2>
            <p className="text-cyan-100/75 max-w-lg mx-auto text-lg mt-6 leading-relaxed">
              Les inscriptions sont ouvertes. Places limitées — contactez-nous dès maintenant.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 scroll-animate scroll-animate-delay-1">
            <Link href="/contact" className="btn-primary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl bg-white text-cyan-700 font-bold text-[16px] hover:bg-cyan-50 shadow-2xl shadow-black/15 transition-all duration-300">
              Inscrire mon enfant
            </Link>
            <Link href="/nos-classes" className="btn-secondary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl border-2 border-white/30 text-white font-semibold text-[16px] hover:bg-white/10 hover:border-white/50 transition-all duration-300">
              Découvrir les classes
            </Link>
          </div>
        </div>
      </section>

    </ScrollAnimateProvider>
  );
}
