import Link from "next/link";
import Image from "next/image";
import { ListeImpayes } from "@/components/public/liste-impayes";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";
import { TiltCard } from "@/components/ui/tilt-card";
import { CountUp } from "@/components/ui/count-up";

/* ─────────────────── DATA ─────────────────── */

const stats = [
  { label: "Élèves inscrits",     value: "1200+",  raw: "1200+",  icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", ic: "text-cyan-400",   ib: "bg-cyan-500/15",   bar: "#22d3ee" },
  { label: "Enseignants qualifiés", value: "85",   raw: "85",     icon: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",                                                                               ic: "text-teal-400",   ib: "bg-teal-500/15",   bar: "#2dd4bf" },
  { label: "Taux de réussite",    value: "94%",    raw: "94%",    icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",                                                                            ic: "text-violet-400", ib: "bg-violet-500/15", bar: "#a78bfa" },
  { label: "Années d'expérience", value: "15+",    raw: "15+",    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",                                                                                      ic: "text-indigo-400", ib: "bg-indigo-500/15", bar: "#818cf8" },
];

const strengths = [
  { title: "Enseignement d'excellence",  desc: "Un programme conforme au curriculum national, enrichi par des approches pédagogiques modernes et innovantes.", icon: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5", ib: "bg-cyan-50",    ic: "text-cyan-600",    glow: "shadow-cyan-500/25",   span: "md:col-span-2" },
  { title: "Encadrement personnalisé",   desc: "Des effectifs maîtrisés et un suivi individuel de chaque élève pour garantir sa réussite scolaire.",           icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", ib: "bg-violet-50", ic: "text-violet-600", glow: "shadow-violet-500/25", span: "" },
  { title: "Infrastructures modernes",   desc: "Salles de classe équipées, bibliothèque, salle informatique et espaces sportifs de qualité.",                   icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",                                                                    ib: "bg-teal-50",   ic: "text-teal-600",   glow: "shadow-teal-500/25",   span: "" },
  { title: "Suivi en temps réel",        desc: "Espace parent en ligne pour consulter notes, absences et paiements de votre enfant à tout instant.",            icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",                                                                    ib: "bg-indigo-50", ic: "text-indigo-600", glow: "shadow-indigo-500/25", span: "md:col-span-2" },
  { title: "Activités parascolaires",    desc: "Football, basketball, théâtre et chorale pour l'épanouissement complet de chaque élève.",                       icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",                                                            ib: "bg-orange-50", ic: "text-orange-600", glow: "shadow-orange-500/25", span: "" },
  { title: "Discipline et valeurs",      desc: "Un cadre structuré fondé sur le respect, la rigueur et l'intégrité pour former les citoyens de demain.",        icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",                                                                                       ib: "bg-rose-50",   ic: "text-rose-600",   glow: "shadow-rose-500/25",   span: "" },
];

const testimonials = [
  { quote: "Mon fils a énormément progressé depuis qu'il est dans cette école. Les enseignants sont dévoués et le suivi est exemplaire.", name: "Aminata Diop", role: "Parent d'élève — 3e", init: "AD", from: "from-cyan-500/25",   to: "to-teal-500/25",   border: "border-cyan-500/20",   ic: "text-cyan-300"   },
  { quote: "L'ambiance de travail est excellente. Nos professeurs prennent vraiment le temps d'expliquer et de nous accompagner.",       name: "Moussa Sarr",  role: "Élève — Terminale S", init: "MS", from: "from-violet-500/25", to: "to-indigo-500/25", border: "border-violet-500/20", ic: "text-violet-300" },
  { quote: "J'apprécie les outils mis à disposition et l'esprit d'équipe au sein de l'établissement. Une école qui fait grandir.",      name: "M. Samba Ba",  role: "Prof. Mathématiques",  init: "SB", from: "from-teal-500/25",   to: "to-cyan-500/25",   border: "border-teal-500/20",   ic: "text-teal-300"   },
];

const chartBars = [30, 55, 40, 78, 52, 88, 62, 72, 47, 92, 68, 95];

/* ─────────────────── DASHBOARD MOCKUP ─────────────────── */
function DashboardMockup() {
  return (
    <div className="rounded-2xl overflow-hidden glass-dark border border-white/[0.12] scan-line" style={{ width: "470px" }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-black/30 border-b border-white/[0.06] shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.05] flex items-center gap-1.5 px-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-400/40 ping-ring" />
          </div>
          <span className="text-[9px] text-white/25 font-mono tracking-tight">app.monecole.sn/dashboard</span>
        </div>
      </div>

      <div className="flex" style={{ height: "310px" }}>
        {/* Mini sidebar */}
        <div className="w-12 bg-black/25 border-r border-white/[0.06] flex flex-col items-center py-3 gap-1.5 flex-shrink-0">
          {/* Logo */}
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-indigo-500 rounded-lg blur-md opacity-50" />
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
          </div>
          {/* Nav items */}
          {[
            { active: true,  color: "bg-indigo-400" },
            { active: false, color: "bg-white/15" },
            { active: false, color: "bg-white/15" },
            { active: false, color: "bg-white/15" },
            { active: false, color: "bg-white/10" },
          ].map((item, i) => (
            <div key={i} className={`w-8 h-7 rounded-lg flex items-center justify-center ${item.active ? "bg-indigo-500/20" : ""}`}>
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
          {/* Greeting + avatar */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] text-white/30">Tableau de bord</div>
              <div className="text-[13px] font-bold text-white leading-tight">Bonjour, Admin 👋</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 z-10" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-500/40 border border-indigo-400/30 flex items-center justify-center text-[8px] text-indigo-300 font-bold">AD</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-2">
              <div className="text-[8px] text-white/35 mb-0.5">Élèves</div>
              <div className="text-[14px] font-bold text-cyan-300 leading-none">1 247</div>
              <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: "82%" }} />
              </div>
            </div>
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-2">
              <div className="text-[8px] text-white/35 mb-0.5">Réussite</div>
              <div className="text-[14px] font-bold text-teal-300 leading-none">94%</div>
              <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400" style={{ width: "94%" }} />
              </div>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-2">
              <div className="text-[8px] text-white/35 mb-0.5">Classes</div>
              <div className="text-[14px] font-bold text-violet-300 leading-none">12</div>
              <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400" style={{ width: "60%" }} />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] text-white/30 font-medium">Paiements — Fév 2026</span>
              <span className="text-[8px] font-bold text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-md">↑ 12%</span>
            </div>
            <div className="flex items-end gap-0.5" style={{ height: "46px" }}>
              {chartBars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(to top, rgba(6,182,212,${0.5 + h/200}), rgba(6,182,212,0.15))`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <div className="text-[8px] text-white/20 uppercase tracking-widest mb-1.5 font-semibold">Activité récente</div>
            <div className="space-y-1.5">
              {[
                { text: "Paiement · Awa Diallo · 12 000 FCFA",  dot: "#22d3ee", bg: "rgba(6,182,212,0.1)" },
                { text: "Note saisie · Mathématiques 6e A",      dot: "#2dd4bf", bg: "rgba(20,184,166,0.1)" },
                { text: "Nouvel élève inscrit · Moussa Fall",    dot: "#a78bfa", bg: "rgba(139,92,246,0.1)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: item.bg }}>
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                  <span className="text-[9px] text-white/45 truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── PAGE ─────────────────── */
export default function HomePage() {
  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Split 2 colonnes + Dashboard 3D flottant      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#020c1b] hero-spotlight">

        {/* Aurora blobs */}
        <div className="absolute -top-[30%] -left-[15%] w-[800px] h-[800px] rounded-full bg-cyan-500/[0.18] blur-[200px] animate-aurora pointer-events-none" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[700px] h-[700px] rounded-full bg-teal-400/[0.15] blur-[190px] animate-aurora-slow pointer-events-none" />
        <div className="absolute top-[30%] right-[25%] w-[400px] h-[400px] rounded-full bg-indigo-500/[0.12] blur-[150px] animate-aurora-mid pointer-events-none" />

        {/* Textures */}
        <div className="absolute inset-0 dot-grid opacity-65" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 xl:gap-16">

            {/* ── LEFT — Text content ── */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">

              {/* Badge with conic animated border */}
              <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full conic-border mb-10">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 ping-ring" />
                </div>
                <span className="text-sm font-medium text-cyan-300 tracking-wide">Inscriptions ouvertes 2025-2026</span>
                <div className="w-px h-3 bg-white/20 mx-0.5" />
                <span className="text-xs text-white/35 font-medium">Places limitées</span>
              </div>

              {/* Headline */}
              <h1
                className="animate-slide-up-delay-1 text-[clamp(2.8rem,6.5vw,5rem)] font-extrabold tracking-[-0.045em] leading-[1.02] text-white mb-0"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Bienvenue à
                <br />
                <span className="text-shimmer">Mon Ecole</span>
              </h1>

              {/* Subtitle */}
              <p className="animate-slide-up-delay-2 mt-7 text-[17px] text-white/50 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Depuis plus de{" "}
                <span className="text-white/80 font-semibold">15 ans</span>,
                nous formons les esprits brillants de demain grâce à un enseignement d&apos;excellence et un encadrement rigoureux.
              </p>

              {/* CTAs */}
              <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mt-10">
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
              </div>

              {/* Trust badges */}
              <div className="mt-9 flex flex-wrap items-center gap-2.5 justify-center lg:justify-start animate-fade-in">
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

            {/* ── RIGHT — Photo de l'école ── */}
            <div className="hidden lg:flex flex-shrink-0 items-center justify-center relative">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 blur-[80px] rounded-3xl" />

              <TiltCard intensity={8} scale={1.02} className="float-shadow">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.12]" style={{ width: "470px" }}>
                  <Image
                    src="/images/ecole-facade.jpeg"
                    alt="Façade de l'école Mon Ecole"
                    width={470}
                    height={620}
                    className="object-cover"
                    priority
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020c1b]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="glass-dark px-4 py-3 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#020c1b" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">I.R.E.F — Mon Ecole</div>
                          <div className="text-white/50 text-xs">Un peuple, un but, une foi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Floating stat bubble */}
              <div className="absolute -top-4 -right-6 glass-dark px-3.5 py-2.5 border border-white/10 animate-float-gentle-2 z-20 rounded-xl">
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

              {/* Floating students bubble */}
              <div className="absolute -bottom-4 -left-6 glass-dark px-3.5 py-2.5 border border-cyan-500/20 animate-float-gentle-3 z-20 rounded-xl">
                <div className="text-[9px] text-white/40 mb-0.5">Élèves inscrits</div>
                <div className="text-[15px] font-extrabold text-transparent bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text">1 200+</div>
              </div>
            </div>

          </div>
        </div>

        {/* Fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020c1b] to-transparent pointer-events-none" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  STATS — Tilt 3D + CountUp                           */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#020c1b] relative section-lazy">
        <div className="gradient-line absolute top-0 left-[8%] right-[8%]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
              <TiltCard
                key={stat.label}
                intensity={6}
                className={`scroll-animate scroll-animate-delay-${i + 1}`}
              >
                <div className="glass-dark p-7 text-center h-full cursor-default">
                  {/* Icon with pulse */}
                  <div className={`mx-auto mb-5 w-12 h-12 rounded-2xl ${stat.ib} flex items-center justify-center animate-icon-pulse`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={stat.ic}>
                      <path d={stat.icon} />
                    </svg>
                  </div>
                  {/* Counter */}
                  <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                    <CountUp value={stat.raw} />
                  </p>
                  {/* Accent line */}
                  <div className="mx-auto mt-3 mb-3 w-10 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${stat.bar}99, ${stat.bar}44)` }} />
                  <p className="text-white/40 font-medium text-[13px]">{stat.label}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        <div className="gradient-line absolute bottom-0 left-[8%] right-[8%]" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  NOS ATOUTS — TiltCard + icônes colorées             */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden section-lazy">
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

          <div className="grid md:grid-cols-3 gap-5">
            {strengths.map((item, i) => (
              <TiltCard
                key={item.title}
                intensity={5}
                glare={true}
                className={`scroll-animate scroll-animate-delay-${(i % 3) + 1} ${item.span}`}
              >
                <div className="gradient-border p-8 h-full cursor-default bg-white rounded-2xl">
                  <div className={`relative w-12 h-12 rounded-2xl ${item.ib} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg ${item.glow}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={item.ic}>
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold text-neutral-900 mb-2.5" style={{ fontFamily: "var(--font-heading)" }}>
                    {item.title}
                  </h3>
                  <p className="text-neutral-500 leading-relaxed text-[15px]">{item.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  GALERIE PHOTOS — Nos installations                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#020c1b] relative overflow-hidden section-lazy">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.08] blur-[170px] animate-aurora-slow pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.06] blur-[150px] animate-aurora-mid pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-45" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border border-cyan-500/20 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span className="text-sm font-semibold text-cyan-300 tracking-wide">Notre école en images</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Découvrez nos installations
            </h2>
            <p className="text-white/40 mt-5 max-w-xl mx-auto text-lg leading-relaxed">
              Des salles de classe colorées et accueillantes pour le bonheur de nos élèves.
            </p>
          </div>

          {/* Photo grid — masonry style */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { src: "/images/ecole-facade.jpeg", alt: "Façade de l'école", span: "md:col-span-1 md:row-span-2" },
              { src: "/images/salle-classe-1.jpeg", alt: "Salle de classe avec tableau", span: "md:col-span-1" },
              { src: "/images/salle-classe-2.jpeg", alt: "Salle de classe", span: "md:col-span-1" },
              { src: "/images/salle-classe-3.jpeg", alt: "Grande salle de classe", span: "md:col-span-1" },
              { src: "/images/salle-maternelle-1.jpeg", alt: "Salle maternelle décorée", span: "md:col-span-1" },
              { src: "/images/salle-maternelle-2.jpeg", alt: "Classe maternelle avec dessins", span: "md:col-span-1" },
              { src: "/images/salle-maternelle-3.jpeg", alt: "Classe maternelle colorée", span: "md:col-span-1" },
              { src: "/images/salle-maternelle-4.jpeg", alt: "Salle décorée avec guirlandes", span: "md:col-span-1" },
            ].map((photo, i) => (
              <div
                key={photo.src}
                className={`scroll-animate scroll-animate-delay-${(i % 4) + 1} ${photo.span} group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-500`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020c1b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white text-sm font-medium">{photo.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gradient-line absolute bottom-0 left-[8%] right-[8%]" />
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  TÉMOIGNAGES — Dark glassmorphism + TiltCard          */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#020c1b] relative overflow-hidden section-lazy">
        <div className="absolute top-[5%] right-[8%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.12] blur-[170px] animate-aurora-slow pointer-events-none" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.10] blur-[150px] animate-aurora-mid pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-45" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%]" />

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
              <TiltCard
                key={t.name}
                intensity={6}
                className={`scroll-animate scroll-animate-delay-${i + 1}`}
              >
                <div className="glass-dark p-8 h-full flex flex-col cursor-default">
                  {/* Giant quote */}
                  <div className="text-6xl leading-none text-cyan-500/20 font-serif mb-3 select-none">&ldquo;</div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/60 leading-relaxed text-[15px] flex-1">{t.quote}</p>
                  {/* Author */}
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


      <ListeImpayes />


      {/* ══════════════════════════════════════════════════════ */}
      {/*  CTA                                                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 relative overflow-hidden section-lazy">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/[0.08] blur-[160px] rounded-full animate-glow-pulse" />
        {/* Decorative circles */}
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
