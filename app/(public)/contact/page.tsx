"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

const contactInfo = [
  {
    title: "Adresse",
    value: "Dakar, Sénégal",
    icon: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0 M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    from: "from-cyan-500/25", to: "to-teal-500/25", border: "border-cyan-500/20", ic: "text-cyan-300",
  },
  {
    title: "Téléphone",
    value: "+221 77 000 00 00",
    icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
    from: "from-teal-500/25", to: "to-cyan-500/25", border: "border-teal-500/20", ic: "text-teal-300",
  },
  {
    title: "Email",
    value: "contact@monecole.sn",
    icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    from: "from-violet-500/25", to: "to-indigo-500/25", border: "border-violet-500/20", ic: "text-violet-300",
  },
  {
    title: "Horaires",
    value: "Lun – Ven : 7h30 – 17h00",
    icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
    from: "from-indigo-500/25", to: "to-cyan-500/25", border: "border-indigo-500/20", ic: "text-indigo-300",
  },
];

const inputCls = "w-full h-12 bg-white border border-neutral-200 rounded-xl px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-250 text-[15px] shadow-sm";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <ScrollAnimateProvider>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO — Cinématographique sombre                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#020c1b]">
        <div className="film-grain z-[1]" />
        <div className="absolute inset-0 dot-grid opacity-30 z-[3] pointer-events-none" />

        <div className="absolute top-[5%] right-[5%] w-[600px] h-[600px] rounded-full bg-teal-500/[0.09] blur-[200px] animate-aurora z-[2] pointer-events-none" />
        <div className="absolute bottom-[5%] -left-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.07] blur-[160px] animate-aurora-mid z-[2] pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020c1b] to-transparent z-[3] pointer-events-none" />
        <div className="gradient-line absolute top-0 left-[8%] right-[8%] z-[5]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full text-center py-32">
          <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-dark border border-cyan-500/20 mb-5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 ping-ring" />
            <span className="text-sm font-medium text-cyan-300 tracking-wide">Parlons ensemble</span>
          </div>
          <h1
            className="animate-slide-up-delay-1 text-[clamp(2.6rem,5.5vw,4.2rem)] font-extrabold tracking-[-0.045em] leading-[1.05] text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Contactez-<span className="text-shimmer">nous</span>
          </h1>
          <p className="animate-slide-up-delay-2 mt-5 text-[15px] text-white/50 leading-relaxed max-w-lg mx-auto">
            Une question ? Nous sommes à votre écoute et répondons sous <span className="text-white/70 font-semibold">24h</span>.
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════ */}
      {/*  INFOS + FORMULAIRE — Section claire                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="bg-[#f1f3f9] relative overflow-hidden clip-angle-top section-lazy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-400/[0.04] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-400/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-24">
          <div className="grid lg:grid-cols-2 gap-14">

            {/* ── Infos contact ── */}
            <div className="space-y-10 scroll-animate">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cyan-200/80 shadow-sm mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span className="text-sm font-semibold text-cyan-700 tracking-wide">Coordonnées</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Nos coordonnées
                </h2>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 mt-4" />
                <p className="text-neutral-500 mt-4 text-[16px] leading-relaxed">
                  Nous sommes à votre disposition pour toute information complémentaire sur nos formations, inscriptions et activités.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {contactInfo.map((info, i) => (
                  <div key={info.title} className={`gradient-border p-6 group hover:-translate-y-1 scroll-animate scroll-animate-delay-${i + 1}`}>
                    <div className="flex gap-4">
                      <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${info.from} ${info.to} border ${info.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={info.ic}>
                          <path d={info.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{info.title}</p>
                        <p className="text-neutral-500 mt-0.5 text-[15px]">{info.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accès rapide */}
              <div className="pt-2">
                <p className="text-sm font-semibold text-neutral-500 mb-3">Accès rapide</p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/nos-classes" className="inline-flex h-9 px-4 items-center gap-1.5 text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-xl hover:bg-cyan-100 transition-colors duration-200">
                    Nos classes
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                  <Link href="/a-propos" className="inline-flex h-9 px-4 items-center gap-1.5 text-sm font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors duration-200">
                    À propos
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Formulaire ── */}
            <div className="gradient-border overflow-hidden scroll-animate scroll-animate-delay-2">
              <div className="px-8 py-5 border-b border-neutral-100 bg-gradient-to-r from-cyan-50/50 to-teal-50/50">
                <h3 className="text-lg font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Envoyez-nous un message</h3>
                <p className="text-sm text-neutral-500 mt-0.5">Réponse garantie sous 24h ouvrées</p>
              </div>
              <div className="p-8">
                {submitted ? (
                  <div className="text-center py-12 space-y-4 animate-scale-in">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-200 flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3 className="font-bold text-neutral-900 text-xl" style={{ fontFamily: "var(--font-heading)" }}>Message envoyé !</h3>
                    <p className="text-neutral-500">Nous vous répondrons dans les plus brefs délais.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 h-10 px-5 font-medium border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-600 mb-2">Nom</label>
                        <input placeholder="Votre nom" required className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-600 mb-2">Prénom</label>
                        <input placeholder="Votre prénom" required className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-600 mb-2">Email</label>
                      <input type="email" placeholder="votre@email.com" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-600 mb-2">Téléphone</label>
                      <input type="tel" placeholder="+221 7X XXX XX XX" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-600 mb-2">Message</label>
                      <textarea
                        placeholder="Votre message..."
                        rows={4}
                        required
                        className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-250 resize-none text-[15px] shadow-sm"
                      />
                    </div>
                    <button type="submit" className="group relative w-full h-12 rounded-xl text-white font-semibold overflow-hidden btn-primary">
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500" />
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="absolute inset-0 shadow-xl shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow duration-300" />
                      <span className="relative flex items-center justify-center gap-2">
                        Envoyer le message
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </ScrollAnimateProvider>
  );
}
