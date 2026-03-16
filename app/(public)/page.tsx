import Link from "next/link";
import { ListeImpayes } from "@/components/public/liste-impayes";

const stats = [
  { label: "Eleves", value: "1 200+" },
  { label: "Enseignants", value: "85" },
  { label: "Taux de reussite", value: "94%" },
  { label: "Annees d'experience", value: "15" },
];

const features = [
  {
    title: "Excellence academique",
    description: "Un programme rigoureux et adapte aux exigences actuelles pour preparer les leaders de demain.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
    ),
  },
  {
    title: "Suivi personnalise",
    description: "Chaque eleve beneficie d'un accompagnement individualise avec un acces en ligne a ses notes et progres.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    title: "Plateforme numerique",
    description: "Notes, paiements, emploi du temps et cours accessibles 24h/24 depuis notre plateforme en ligne.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
  },
  {
    title: "Securite et transparence",
    description: "Suivi des paiements, notifications en temps reel et journal d'audit pour une gestion transparente.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
  },
  {
    title: "Communication fluide",
    description: "Notifications SMS et email pour informer les parents des notes, absences et echeances de paiement.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
  },
  {
    title: "Gestion complete",
    description: "De l'inscription a la generation des bulletins, tout est gere depuis une seule plateforme intuitive.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
    ),
  },
];

const testimonials = [
  {
    quote: "Grace a Kaaydiangu, je suis les notes de mon fils en temps reel. C'est une revolution pour les parents !",
    name: "Aminata Diop",
    role: "Parent d'eleve",
  },
  {
    quote: "La saisie des notes et le suivi des absences n'ont jamais ete aussi simples. Un outil indispensable.",
    name: "M. Samba Ba",
    role: "Professeur de Maths",
  },
  {
    quote: "Le systeme de paiement et la generation automatique des recus nous font gagner un temps precieux.",
    name: "Fatou Ndiaye",
    role: "Comptable",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-emerald-400/[0.04] rounded-full blur-[80px]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-28 md:pt-32 md:pb-36 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">Inscriptions ouvertes 2025-2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]" style={{ fontFamily: "var(--font-heading)" }}>
              L&apos;ecole du{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">futur</span>
              {" "}commence ici
            </h1>

            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Kaaydiangu forme les esprits brillants de demain grace a une education
              d&apos;excellence, moderne et accessible a tous.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/nos-classes"
                className="h-12 px-8 inline-flex items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold text-[16px] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                Decouvrir nos classes
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link
                href="/contact"
                className="h-12 px-8 inline-flex items-center justify-center rounded-xl border border-white/[0.12] text-neutral-300 font-semibold text-[16px] hover:bg-white/[0.04] hover:border-white/[0.2] transition-all hover:-translate-y-0.5"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#050505] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  {stat.value}
                </p>
                <p className="text-neutral-500 mt-2 font-medium text-[15px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#050505] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Fonctionnalites</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>
              Pourquoi choisir Kaaydiangu ?
            </h2>
            <p className="text-neutral-400 mt-4 max-w-xl mx-auto text-lg">
              Une plateforme complete qui met la technologie au service de la reussite scolaire.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white/[0.03] rounded-2xl border border-white/[0.06] p-7 hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>{feature.title}</h3>
                <p className="text-neutral-400 mt-2.5 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#050505] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Temoignages</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>
              Ce qu&apos;ils disent de nous
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-7 hover:border-emerald-500/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-emerald-500/30 mb-4">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" fill="currentColor"/>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1" fill="currentColor"/>
                </svg>
                <p className="text-neutral-300 leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-neutral-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impayes */}
      <ListeImpayes />

      {/* CTA */}
      <section className="py-24 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/[0.05] to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.08] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-8 relative">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Pret a rejoindre{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Kaaydiangu</span> ?
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto text-lg">
            Inscriptions ouvertes pour l&apos;annee scolaire en cours.
            Contactez-nous pour plus d&apos;informations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold text-[16px] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              Nous contacter
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 px-8 items-center justify-center rounded-xl border border-white/[0.12] text-neutral-300 font-semibold text-[16px] hover:bg-white/[0.04] transition-all hover:-translate-y-0.5"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
