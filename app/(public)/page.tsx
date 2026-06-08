"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";
import { TiltCard } from "@/components/ui/tilt-card";
import { NotreEquipe } from "@/components/public/notre-equipe";

/* ─────────────────── DATA ─────────────────── */

const strengths = [
  { title: "Enseignement d'excellence",  desc: "Un programme conforme au curriculum national, enrichi par des approches pédagogiques modernes et innovantes.", image: "/images/salle-classe-1.jpeg",     span: "md:col-span-2" },
  { title: "Encadrement personnalisé",   desc: "Des effectifs maîtrisés et un suivi individuel de chaque élève pour garantir sa réussite scolaire.",           image: "/images/salle-classe-2.jpeg",     span: "" },
  { title: "Infrastructures modernes",   desc: "Salles de classe équipées, bibliothèque, salle informatique et espaces sportifs de qualité.",                   image: "/images/ecole-facade.jpeg",       span: "" },
  { title: "Suivi en temps réel",        desc: "Espace parent en ligne pour consulter notes, absences et paiements de votre enfant à tout instant.",            image: "/images/salle-classe-3.jpeg",     span: "md:col-span-2" },
  { title: "Activités parascolaires",    desc: "Football, basketball, théâtre et chorale pour l'épanouissement complet de chaque élève.",                       image: "/images/salle-maternelle-1.jpeg", span: "" },
  { title: "Discipline et valeurs",      desc: "Un cadre structuré fondé sur le respect, la rigueur et l'intégrité pour former les citoyens de demain.",        image: "/images/salle-maternelle-2.jpeg", span: "" },
];

const testimonials = [
  { quote: "Mon fils a énormément progressé depuis qu'il est dans cette école. Les enseignants sont dévoués et le suivi est exemplaire.", name: "Aminata Diop", role: "Parent d'élève — 3e", init: "AD", from: "from-cyan-500/25",   to: "to-teal-500/25",   border: "border-cyan-500/20",   ic: "text-cyan-300"   },
  { quote: "L'ambiance de travail est excellente. Nos professeurs prennent vraiment le temps d'expliquer et de nous accompagner.",       name: "Moussa Sarr",  role: "Élève — Terminale S", init: "MS", from: "from-violet-500/25", to: "to-indigo-500/25", border: "border-violet-500/20", ic: "text-violet-300" },
  { quote: "J'apprécie les outils mis à disposition et l'esprit d'équipe au sein de l'établissement. Une école qui fait grandir.",      name: "M. Samba Ba",  role: "Prof. Mathématiques",  init: "SB", from: "from-teal-500/25",   to: "to-cyan-500/25",   border: "border-teal-500/20",   ic: "text-teal-300"   },
];

/* ─────────────────── PAGE ─────────────────── */

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /* Auth redirect */
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router, session]);

  /* Parallax scroll — met à jour --scroll-y pour les classes parallax-* */
  useEffect(() => {
    const el = document.documentElement;
    const onScroll = () => el.style.setProperty("--scroll-y", String(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#020c1b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Cinématographique full viewport               */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#020c1b]">

        {/* BG — façade avec Ken Burns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-[-8%] kenburns-1">
            <Image
              src="/images/ecole-facade.jpeg"
              alt=""
              fill
              className="object-cover"
              style={{ opacity: 0.42 }}
              priority
            />
          </div>
        </div>

        {/* Film grain cinématique */}
        <div className="film-grain z-[1]" />

        {/* Overlay directionnel gauche-lourd */}
        <div className="cine-overlay absolute inset-0 z-[2]" />

        {/* Vignette haut */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#020c1b] to-transparent z-[3] pointer-events-none" />

        {/* Vignette bas */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#020c1b] to-transparent z-[3] pointer-events-none" />

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-20 z-[3] pointer-events-none" />

        {/* Aurora */}
        <div className="absolute top-[5%] -left-[10%] w-[700px] h-[700px] rounded-full bg-cyan-500/[0.09] blur-[200px] animate-aurora z-[2] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.07] blur-[180px] animate-aurora-mid z-[2] pointer-events-none" />

        {/* Contenu */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full min-h-screen flex items-center">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20 w-full py-32 lg:py-0">

            {/* ── GAUCHE : texte ── */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">

              {/* Badge animé */}
              <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full conic-border mb-5">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 ping-ring" />
                </div>
                <span className="text-sm font-medium text-cyan-300 tracking-wide">Inscriptions ouvertes 2025-2026</span>
                <div className="w-px h-3 bg-white/20 mx-0.5" />
                <span className="text-xs text-white/35 font-medium">Places limitées</span>
              </div>

              {/* Titre */}
              <h1
                className="animate-slide-up-delay-1 text-[clamp(2.6rem,5.5vw,4.4rem)] font-extrabold tracking-[-0.045em] leading-[1.05] text-white mb-0"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Bienvenue à
                <br />
                <span className="text-shimmer">IREF</span>
              </h1>

              {/* Sous-titre */}
              <p className="animate-slide-up-delay-2 mt-4 text-[15px] text-white/50 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Depuis plus de{" "}
                <span className="text-white/80 font-semibold">15 ans</span>,
                nous formons les esprits brillants de demain grâce à un enseignement d&apos;excellence et un encadrement rigoureux.
              </p>

              {/* CTAs */}
              <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-6">
                <Link
                  href="/nos-classes"
                  className="group btn-primary h-[52px] px-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-[#020c1b] font-bold text-[16px] hover:from-cyan-300 hover:to-teal-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow duration-300"
                >
                  Découvrir nos classes
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="btn-secondary h-[52px] px-8 inline-flex items-center justify-center rounded-2xl glass-dark text-white font-semibold text-[16px] border border-white/10 hover:border-white/20"
                >
                  Nous contacter
                </Link>
                {status !== "authenticated" && (
                  <Link
                    href="/login"
                    className="btn-primary h-[52px] px-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-[#020c1b] font-bold text-[16px] hover:from-cyan-300 hover:to-teal-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50"
                  >
                    Accéder à mon espace
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Trust badges */}
              <div className="mt-5 flex flex-wrap items-center gap-2 justify-center lg:justify-start animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07] animate-float-gentle">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-white/55 text-[12px] font-medium">4.9 / 5 satisfaction</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07] animate-float-gentle-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span className="text-white/55 text-[12px] font-medium">1 200+ élèves</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-dark border border-white/[0.07] animate-float-gentle-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-white/55 text-[12px] font-medium">94% de réussite</span>
                </div>
              </div>
            </div>

            {/* ── DROITE : composite profondeur 3 couches ── */}
            <div className="hidden lg:block relative flex-shrink-0" style={{ width: "400px", height: "460px" }}>

              {/* Halo ambiant */}
              <div className="absolute inset-[-20%] bg-gradient-to-br from-cyan-500/8 to-indigo-500/6 blur-[120px] rounded-full pointer-events-none" />

              {/* Couche 1 — Arrière-plan (flou, pale) */}
              <div className="absolute top-0 right-0 parallax-bg" style={{ zIndex: 1 }}>
                <div className="relative w-[200px] h-[145px] rounded-2xl overflow-hidden" style={{ filter: "blur(1.5px)" }}>
                  <div className="absolute inset-[-12%] kenburns-2">
                    <Image src="/images/salle-maternelle-3.jpeg" alt="" fill className="object-cover" style={{ opacity: 0.45 }} />
                  </div>
                  <div className="absolute inset-0 bg-[#020c1b]/55" />
                  <div className="absolute inset-0 border border-white/[0.07] rounded-2xl" />
                </div>
              </div>

              {/* Couche 2 — Plan médian (image principale) */}
              <div className="absolute left-0 top-[50px] parallax-mid" style={{ zIndex: 2 }}>
                <div className="relative w-[265px] h-[370px] rounded-3xl overflow-hidden depth-card">
                  <div className="absolute inset-[-10%] kenburns-3">
                    <Image src="/images/salle-classe-1.jpeg" alt="Salle de classe IREF" fill className="object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020c1b]/92 via-[#020c1b]/30 to-[#020c1b]/08" />
                  {/* Badge bas */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="glass-dark px-4 py-3 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#020c1b" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">I.R.E.F — IREF</div>
                          <div className="text-white/50 text-xs">Un peuple, un but, une foi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Couche 3 — Premier plan (accent) */}
              <div className="absolute right-[8px] bottom-[45px] parallax-fg" style={{ zIndex: 3 }}>
                <div className="relative w-[168px] h-[126px] rounded-2xl overflow-hidden depth-card border border-cyan-500/22">
                  <div className="absolute inset-[-12%] kenburns-1">
                    <Image src="/images/salle-classe-2.jpeg" alt="" fill className="object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-[#020c1b]/35" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] text-cyan-300 bg-cyan-500/14 border border-cyan-500/22 px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">Primaire</span>
                  </div>
                </div>
              </div>

              {/* Bulle flottante haut — taux réussite */}
              <div className="absolute -top-4 -right-6 glass-dark px-3.5 py-2.5 border border-white/10 animate-float-gentle-2 rounded-xl" style={{ zIndex: 4 }}>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-teal-400" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-teal-400/50 ping-ring" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50">Taux de réussite</div>
                    <div className="text-[11px] font-bold text-white">94%</div>
                  </div>
                </div>
              </div>

              {/* Bulle flottante bas — élèves */}
              <div className="absolute -bottom-4 -left-6 glass-dark px-3.5 py-2.5 border border-cyan-500/20 animate-float-gentle-3 rounded-xl" style={{ zIndex: 4 }}>
                <div className="text-[9px] text-white/40 mb-0.5">Élèves inscrits</div>
                <div className="text-[15px] font-extrabold text-transparent bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text">1 200+</div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  NOS ATOUTS — Transition diagonale + marquee          */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-white relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-400/[0.04] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-400/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-sm font-semibold text-cyan-700 tracking-wide">Nos atouts</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Pourquoi choisir notre école ?
            </h2>
            <p className="text-neutral-500 mt-5 max-w-xl mx-auto text-lg leading-relaxed">
              Un cadre d&apos;apprentissage exceptionnel pour accompagner votre enfant vers la réussite.
            </p>
          </div>

          <div className="relative w-full overflow-hidden flex scroll-animate py-4">
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

            <div className="flex w-max animate-marquee gap-6">
              {[...strengths, ...strengths].map((item, i) => (
                <div key={`${item.title}-${i}`} className={`shrink-0 ${item.span ? 'w-[500px] md:w-[650px]' : 'w-[300px] md:w-[380px]'}`}>
                  <TiltCard intensity={5} glare={true}>
                    <div className="group h-full cursor-default rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative" style={{ minHeight: "350px" }}>
                      <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/85 group-hover:via-black/50 transition-all duration-500" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                        <h3 className="text-[20px] font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                          {item.title}
                        </h3>
                        <p className="text-white/80 leading-relaxed text-[14px]">{item.desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Padding bas compensé */}
        <div className="pb-28" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  TÉMOIGNAGES — Transition diagonale + glassmorphism   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#020c1b] relative overflow-hidden clip-angle-both section-lazy">
        <div className="absolute top-[5%] right-[8%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.12] blur-[170px] animate-aurora-slow pointer-events-none" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.10] blur-[150px] animate-aurora-mid pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-45" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%]" />

        {/* Film grain léger */}
        <div className="film-grain z-[1] opacity-60" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border border-cyan-500/20 mb-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-sm font-semibold text-cyan-300 tracking-wide">Témoignages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Ce qu&apos;ils disent de nous
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TiltCard key={t.name} intensity={6} className={`scroll-animate scroll-animate-delay-${i + 1}`}>
                <div className="glass-dark p-8 h-full flex flex-col cursor-default">
                  <div className="text-6xl leading-none text-cyan-500/20 font-serif mb-3 select-none">&ldquo;</div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/60 leading-relaxed text-[15px] flex-1">{t.quote}</p>
                  <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.08]">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.from} ${t.to} border ${t.border} flex items-center justify-center ${t.ic} font-bold text-sm shrink-0`}>
                      {t.init}
                    </div>
                    <div>
                      <p className="text-white/90 font-semibold text-[15px]">{t.name}</p>
                      <p className="text-white/35 text-[12px]">{t.role}</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="gradient-line absolute bottom-0 left-[8%] right-[8%]" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  NOTRE ÉQUIPE — Professeurs (depuis le registre admin) */}
      {/* ══════════════════════════════════════════════════════ */}
      <NotreEquipe />


      {/* ══════════════════════════════════════════════════════ */}
      {/*  CTA — Transition diagonale + fond gradient           */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/[0.08] blur-[160px] rounded-full animate-glow-pulse" />
        <div className="absolute top-8 left-8 w-28 h-28 rounded-full border border-white/15" />
        <div className="absolute top-12 left-12 w-16 h-16 rounded-full border border-white/10" />
        <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full border border-white/12" />
        <div className="absolute top-1/3 right-20 w-6 h-6 rounded-full bg-white/15" />
        <div className="absolute bottom-1/3 left-20 w-4 h-4 rounded-full bg-white/10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 mb-8">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-white ping-ring" />
              </div>
              <span className="text-sm font-semibold text-white/90 tracking-wide">Rentrée 2025-2026</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Offrez le meilleur<br />à votre enfant
            </h2>
            <p className="text-cyan-100/75 max-w-lg mx-auto text-lg mt-6 leading-relaxed">
              Les inscriptions sont ouvertes. Places limitées — contactez-nous dès maintenant.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 scroll-animate scroll-animate-delay-1">
            <Link
              href="/contact"
              className="btn-primary h-[52px] px-10 inline-flex items-center justify-center rounded-2xl bg-white text-cyan-700 font-bold text-[16px] hover:bg-cyan-50 shadow-2xl shadow-black/15 hover:shadow-black/25 transition-all duration-300"
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
