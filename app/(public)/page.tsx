import Link from "next/link";
import { ListeImpayes } from "@/components/public/liste-impayes";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

const stats = [
  {
    label: "Élèves inscrits",
    value: "1 200+",
    iconPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
  },
  {
    label: "Enseignants qualifiés",
    value: "85",
    iconPath: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/15",
  },
  {
    label: "Taux de réussite",
    value: "94%",
    iconPath: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
  },
  {
    label: "Années d'expérience",
    value: "15+",
    iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15",
  },
];

const strengths = [
  {
    title: "Enseignement d'excellence",
    description: "Un programme conforme au curriculum national, enrichi par des approches pédagogiques modernes et innovantes.",
    iconPath: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    glowColor: "group-hover:shadow-cyan-500/20",
    span: "md:col-span-2",
  },
  {
    title: "Encadrement personnalisé",
    description: "Des effectifs maîtrisés et un suivi individuel de chaque élève pour garantir sa réussite scolaire.",
    iconPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    glowColor: "group-hover:shadow-violet-500/20",
    span: "",
  },
  {
    title: "Infrastructures modernes",
    description: "Salles de classe équipées, bibliothèque, salle informatique et espaces de détente.",
    iconPath: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    glowColor: "group-hover:shadow-teal-500/20",
    span: "",
  },
  {
    title: "Suivi en temps réel",
    description: "Espace en ligne pour consulter les notes, absences et paiements de votre enfant à tout moment.",
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    glowColor: "group-hover:shadow-indigo-500/20",
    span: "md:col-span-2",
  },
  {
    title: "Activités parascolaires",
    description: "Football, basketball, théâtre, chorale — pour l'épanouissement de chaque élève.",
    iconPath: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    glowColor: "group-hover:shadow-orange-500/20",
    span: "",
  },
  {
    title: "Discipline et valeurs",
    description: "Un cadre structuré fondé sur le respect, la rigueur et l'intégrité — des citoyens pour demain.",
    iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    glowColor: "group-hover:shadow-rose-500/20",
    span: "",
  },
];

const testimonials = [
  {
    quote: "Mon fils a énormément progressé depuis qu'il est dans cette école. Les enseignants sont dévoués et le suivi est exemplaire.",
    name: "Aminata Diop",
    role: "Parent d'élève, classe de 3e",
    initials: "AD",
    from: "from-cyan-500/30",
    to: "to-teal-500/30",
    border: "border-cyan-500/20",
    text: "text-cyan-300",
  },
  {
    quote: "L'ambiance de travail est excellente. On a des professeurs qui prennent vraiment le temps d'expliquer et de nous aider.",
    name: "Moussa Sarr",
    role: "Élève en Terminale S",
    initials: "MS",
    from: "from-violet-500/30",
    to: "to-indigo-500/30",
    border: "border-violet-500/20",
    text: "text-violet-300",
  },
  {
    quote: "En tant que professeur, j'apprécie les outils mis à notre disposition et l'esprit d'équipe au sein de l'établissement.",
    name: "M. Samba Ba",
    role: "Professeur de Mathématiques",
    initials: "SB",
    from: "from-teal-500/30",
    to: "to-cyan-500/30",
    border: "border-teal-500/20",
    text: "text-teal-300",
  },
];

export default function HomePage() {
  return (
    <ScrollAnimateProvider>

      {/* ════════════════════════════════════════════ */}
      {/*  HERO — Immersif dark + dot-grid + spotlight */}
      {/* ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#020c1b] hero-spotlight">

        {/* Aurora blobs */}
        <div className="absolute -top-[25%] -left-[10%] w-[750px] h-[750px] rounded-full bg-cyan-500/[0.20] blur-[200px] animate-aurora pointer-events-none" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[650px] h-[650px] rounded-full bg-teal-400/[0.16] blur-[180px] animate-aurora-slow pointer-events-none" />
        <div className="absolute top-[45%] left-[55%] w-[400px] h-[400px] rounded-full bg-indigo-500/[0.12] blur-[140px] animate-aurora-mid pointer-events-none" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-70" />

        {/* Horizontal gradient lines */}
        <div className="absolute top-[15%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent pointer-events-none" />
        <div className="absolute top-[85%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge pill */}
            <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-dark mb-10 border border-cyan-500/20">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
              <span className="text-sm font-medium text-cyan-300 tracking-wide">Inscriptions ouvertes 2025-2026</span>
              <div className="w-px h-3 bg-white/20" />
              <span className="text-xs text-white/40">Places limitées</span>
            </div>

            {/* Main heading */}
            <h1
              className="animate-slide-up-delay-1 text-[clamp(2.8rem,8vw,5.5rem)] font-extrabold text-white tracking-[-0.04em] leading-[1.02]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Bienvenue à{" "}
              <span
                className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent animate-gradient-shift"
                style={{ backgroundSize: "200% 200%" }}
              >
                Mon Ecole
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-slide-up-delay-2 mt-7 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              Depuis plus de{" "}
              <span className="text-white/80 font-semibold">15 ans</span>
              , nous formons les esprits brillants de demain grâce à un enseignement d&apos;excellence et un encadrement rigoureux.
            </p>

            {/* CTA buttons */}
            <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center mt-11">
              <Link
                href="/nos-classes"
                className="group btn-primary h-[52px] px-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-[#020c1b] font-bold text-[16px] hover:from-cyan-300 hover:to-teal-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow duration-300"
              >
                Découvrir nos classes
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
              <Link
                href="/contact"
                className="btn-secondary h-[52px] px-8 inline-flex items-center justify-center rounded-2xl glass-dark text-white font-semibold text-[16px] border border-white/10 hover:border-white/20"
              >
                Nous contacter
              </Link>
            </div>

            {/* Trust badges — flottants style Canva/Linear */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-dark border border-white/[0.07] animate-float-gentle">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <span className="text-white/65 text-[13px] font-medium">4.9 / 5 satisfaction</span>
              </div>

              <div className="w-px h-4 bg-white/15 hidden sm:block" />

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-dark border border-white/[0.07] animate-float-gentle-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-white/65 text-[13px] font-medium">1 200+ élèves</span>
              </div>

              <div className="w-px h-4 bg-white/15 hidden sm:block" />

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-dark border border-white/[0.07] animate-float-gentle-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-white/65 text-[13px] font-medium">94% de réussite</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020c1b] to-transparent pointer-events-none" />
      </section>


      {/* ════════════════════════════════════════════ */}
      {/*  STATS — Dark avec icônes et lueur          */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-24 bg-[#020c1b] relative section-lazy">
        <div className="gradient-line absolute top-0 left-[10%] right-[10%]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`glass-dark p-7 text-center group cursor-default scroll-animate scroll-animate-delay-${i + 1}`}
              >
                {/* Icon */}
                <div className={`mx-auto mb-5 w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center animate-icon-pulse`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={stat.iconColor}>
                    <path d={stat.iconPath} />
                  </svg>
                </div>
                {/* Value */}
                <p
                  className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                </p>
                {/* Thin gradient line */}
                <div className="mx-auto mt-3 mb-3 w-10 h-0.5 bg-gradient-to-r from-cyan-500/60 to-teal-500/40 rounded-full" />
                <p className="text-white/45 font-medium text-[14px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="gradient-line absolute bottom-0 left-[10%] right-[10%]" />
      </section>


      {/* ════════════════════════════════════════════ */}
      {/*  NOS ATOUTS — Light, cartes colorées        */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden section-lazy">
        {/* Subtle glow center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-cyan-400/[0.035] blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Nos atouts</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pourquoi choisir notre école ?
            </h2>
            <p className="text-neutral-500 mt-5 max-w-xl mx-auto text-lg leading-relaxed">
              Un cadre d&apos;apprentissage exceptionnel pour accompagner votre enfant vers la réussite.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {strengths.map((item, i) => (
              <div
                key={item.title}
                className={`gradient-border p-8 group cursor-default scroll-animate scroll-animate-delay-${(i % 3) + 1} ${item.span}`}
              >
                {/* Icon with glow */}
                <div className={`relative w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg ${item.glowColor} group-hover:shadow-xl`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={item.iconColor}>
                    <path d={item.iconPath} />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-neutral-900 mb-2.5" style={{ fontFamily: "var(--font-heading)" }}>
                  {item.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed text-[15px]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════ */}
      {/*  TÉMOIGNAGES — Dark glassmorphism           */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-28 bg-[#020c1b] relative overflow-hidden section-lazy">
        {/* Aurora */}
        <div className="absolute top-[5%] right-[8%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.13] blur-[160px] animate-aurora-slow pointer-events-none" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.10] blur-[140px] animate-aurora-mid pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-50" />

        <div className="gradient-line absolute top-0 left-[10%] right-[10%]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border border-cyan-500/20 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-sm font-semibold text-cyan-300 tracking-wide">Témoignages</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ce qu&apos;ils disent de nous
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className={`glass-dark p-8 flex flex-col scroll-animate scroll-animate-delay-${i + 1}`}>
                {/* Quote mark decoration */}
                <div className="text-5xl leading-none text-cyan-500/25 font-serif mb-4 select-none">&ldquo;</div>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className="text-white/65 leading-relaxed text-[15px] flex-1">{t.quote}</p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.08]">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.from} ${t.to} border ${t.border} flex items-center justify-center ${t.text} font-bold text-sm shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white/90 font-semibold text-[15px]">{t.name}</p>
                    <p className="text-white/40 text-[13px]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gradient-line absolute bottom-0 left-[10%] right-[10%]" />
      </section>


      <ListeImpayes />


      {/* ════════════════════════════════════════════ */}
      {/*  CTA INSCRIPTION                            */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-32 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden section-lazy">
        <div className="absolute inset-0 dot-grid opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.08] blur-[150px] rounded-full animate-glow-pulse" />
        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-24 h-24 rounded-full border border-white/15" />
        <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full border border-white/10" />
        <div className="absolute top-1/3 right-16 w-8 h-8 rounded-full bg-white/10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-semibold text-white/90 tracking-wide">Rentrée 2025-2026</span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Offrez le meilleur<br />à votre enfant
            </h2>
            <p className="text-cyan-100/80 max-w-lg mx-auto text-lg mt-6 leading-relaxed">
              Les inscriptions sont ouvertes. Places limitées — contactez-nous dès maintenant pour réserver une place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 scroll-animate scroll-animate-delay-1">
            <Link
              href="/contact"
              className="btn-primary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl bg-white text-cyan-700 font-bold text-[16px] hover:bg-cyan-50 shadow-2xl shadow-black/15 hover:shadow-black/25 transition-shadow duration-300"
            >
              Inscrire mon enfant
            </Link>
            <Link
              href="/login"
              className="btn-secondary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl border-2 border-white/30 text-white font-semibold text-[16px] hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Espace parent / élève
            </Link>
          </div>
        </div>
      </section>

    </ScrollAnimateProvider>
  );
}
