import Link from "next/link";
import { ListeImpayes } from "@/components/public/liste-impayes";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

const stats = [
  { label: "Eleves inscrits", value: "1 200+" },
  { label: "Enseignants qualifies", value: "85" },
  { label: "Taux de reussite", value: "94%" },
  { label: "Annees d'experience", value: "15+" },
];

const strengths = [
  {
    title: "Enseignement d'excellence",
    description: "Un programme conforme au curriculum national, enrichi par des approches pedagogiques modernes et innovantes.",
    icon: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
    span: "md:col-span-2",
  },
  {
    title: "Encadrement personnalise",
    description: "Des effectifs maitrise et un suivi individuel de chaque eleve pour garantir sa reussite.",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    span: "",
  },
  {
    title: "Infrastructures modernes",
    description: "Des salles de classe equipees, une bibliotheque, une salle informatique et des espaces de detente.",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    span: "",
  },
  {
    title: "Communication avec les parents",
    description: "Un espace en ligne pour suivre les notes, les absences et les paiements de votre enfant en temps reel.",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    span: "md:col-span-2",
  },
  {
    title: "Activites parascolaires",
    description: "Football, basketball, theatre, chorale — pour l'epanouissement et le developpement de chaque eleve.",
    icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    span: "",
  },
  {
    title: "Discipline et valeurs",
    description: "Un cadre structure fonde sur le respect, la rigueur et l'integrite pour forger les citoyens de demain.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    span: "",
  },
];

const testimonials = [
  {
    quote: "Mon fils a enormement progresse depuis qu'il est dans cette ecole. Les enseignants sont devoues et le suivi est exemplaire.",
    name: "Aminata Diop",
    role: "Parent d'eleve, classe de 3e",
  },
  {
    quote: "L'ambiance de travail est excellente. On a des professeurs qui prennent vraiment le temps d'expliquer et de nous aider.",
    name: "Moussa Sarr",
    role: "Eleve en Terminale S",
  },
  {
    quote: "En tant que professeur, j'apprecie les outils mis a notre disposition et l'esprit d'equipe au sein de l'etablissement.",
    name: "M. Samba Ba",
    role: "Professeur de Mathematiques",
  },
];

export default function HomePage() {
  return (
    <ScrollAnimateProvider>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-white to-teal-50/50" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-400/[0.08] blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.06] blur-[100px] animate-float" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-cyan-50 border border-cyan-200 mb-10">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-sm font-medium text-cyan-700">Inscriptions ouvertes 2025-2026</span>
            </div>

            <h1 className="animate-slide-up-delay-1 text-[clamp(2.5rem,7vw,5rem)] font-extrabold text-neutral-900 tracking-tight leading-[1.05]" style={{ fontFamily: "var(--font-heading)" }}>
              Bienvenue a{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent animate-gradient-shift" style={{ backgroundSize: "200% 200%" }}>
                Mon Ecole
              </span>
            </h1>

            <p className="animate-slide-up-delay-2 mt-8 text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Depuis plus de 15 ans, nous formons les esprits brillants de demain
              grace a un enseignement d&apos;excellence, un encadrement rigoureux
              et un environnement propice a la reussite.
            </p>

            <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link
                href="/nos-classes"
                className="group btn-primary h-13 px-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold text-[16px] hover:from-cyan-600 hover:to-teal-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
              >
                Decouvrir nos classes
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link
                href="/contact"
                className="btn-secondary h-13 px-8 inline-flex items-center justify-center rounded-2xl border border-neutral-200 text-neutral-700 font-semibold text-[16px] hover:bg-neutral-50 hover:border-neutral-300"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-24 bg-white relative border-y border-neutral-100 section-lazy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`glass-card p-8 text-center group scroll-animate scroll-animate-delay-${i + 1}`}>
                <p className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  {stat.value}
                </p>
                <p className="text-neutral-500 mt-2 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NOS ATOUTS ─── */}
      <section className="py-28 bg-neutral-50/50 relative overflow-hidden section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-400/[0.04] blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Nos atouts</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Pourquoi choisir notre ecole ?
            </h2>
            <p className="text-neutral-500 mt-5 max-w-xl mx-auto text-lg">
              Un cadre d&apos;apprentissage exceptionnel pour accompagner votre enfant vers la reussite.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {strengths.map((item, i) => (
              <div
                key={item.title}
                className={`gradient-border p-8 group cursor-default hover:-translate-y-1 scroll-animate scroll-animate-delay-${(i % 3) + 1} ${item.span}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6 group-hover:bg-cyan-100 group-hover:scale-110 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2.5" style={{ fontFamily: "var(--font-heading)" }}>{item.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-[15px]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEMOIGNAGES ─── */}
      <section className="py-28 bg-gradient-to-b from-cyan-50/30 to-white relative overflow-hidden section-lazy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Temoignages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Ce qu&apos;ils disent de nous
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className={`gradient-border p-8 hover:-translate-y-1 scroll-animate scroll-animate-delay-${i + 1}`}>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-600 leading-relaxed text-[15px] mb-8">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-6 border-t border-neutral-100">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-cyan-700 font-bold text-sm group-hover:scale-105 transition-transform duration-300">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-neutral-900 font-semibold text-[15px]">{t.name}</p>
                    <p className="text-neutral-400 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ListeImpayes />

      {/* ─── CTA INSCRIPTION ─── */}
      <section className="py-32 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden section-lazy">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.08] blur-[140px] rounded-full animate-glow-pulse" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="scroll-animate">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Offrez le meilleur a votre enfant
            </h2>
            <p className="text-cyan-100 max-w-lg mx-auto text-lg mt-6">
              Les inscriptions sont ouvertes pour l&apos;annee scolaire 2025-2026.
              Places limitees — contactez-nous des maintenant.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 scroll-animate scroll-animate-delay-1">
            <Link
              href="/contact"
              className="btn-primary h-13 px-10 inline-flex items-center justify-center rounded-2xl bg-white text-cyan-700 font-semibold text-[16px] hover:bg-cyan-50 shadow-xl shadow-black/10"
            >
              Inscrire mon enfant
            </Link>
            <Link
              href="/login"
              className="btn-secondary h-13 px-10 inline-flex items-center justify-center rounded-2xl border-2 border-white/30 text-white font-semibold text-[16px] hover:bg-white/10"
            >
              Espace parent / eleve
            </Link>
          </div>
        </div>
      </section>
    </ScrollAnimateProvider>
  );
}
