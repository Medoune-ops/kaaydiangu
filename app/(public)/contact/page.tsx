"use client";

import { useState } from "react";
import { ScrollAnimateProvider } from "@/components/public/scroll-animate";

const contactInfo = [
  {
    title: "Adresse",
    value: "Dakar, Senegal",
    icon: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0 M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },
  {
    title: "Telephone",
    value: "+221 77 000 00 00",
    icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  },
  {
    title: "Email",
    value: "contact@monecole.sn",
    icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  },
  {
    title: "Horaires",
    value: "Lun - Ven : 7h30 - 17h00",
    icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  },
];

const inputCls = "w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-250 text-[15px]";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <ScrollAnimateProvider>
      {/* Header */}
      <section className="relative bg-white py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg animate-grid-fade" />
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-400/[0.06] blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
            <span className="text-sm font-semibold text-cyan-700 tracking-wide">Parlons ensemble</span>
          </div>
          <h1 className="animate-slide-up-delay-1 text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight glow-text" style={{ fontFamily: "var(--font-heading)" }}>
            Contact
          </h1>
          <p className="animate-slide-up-delay-2 mt-6 text-neutral-500 max-w-xl mx-auto text-lg">
            Une question ? N&apos;hesitez pas a nous contacter, nous repondons sous 24h.
          </p>
        </div>
      </section>

      <section className="py-28 bg-neutral-50/50 relative section-lazy">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Infos */}
            <div className="space-y-10 scroll-animate">
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Nos coordonnees</h2>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 mt-3" />
                <p className="text-neutral-500 mt-4 text-[16px]">
                  Nous sommes a votre disposition pour toute information complementaire.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="glass-card p-6 group">
                    <div className="flex gap-4">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-100 group-hover:scale-105 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600">
                          <path d={info.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{info.title}</p>
                        <p className="text-neutral-500 mt-0.5 text-[15px]">{info.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire */}
            <div className="gradient-border overflow-hidden scroll-animate scroll-animate-delay-2">
              <div className="px-8 py-5 border-b border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Envoyez-nous un message</h3>
              </div>
              <div className="p-8">
                {submitted ? (
                  <div className="text-center py-12 space-y-4 animate-scale-in">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3 className="font-bold text-neutral-900 text-xl" style={{ fontFamily: "var(--font-heading)" }}>Message envoye !</h3>
                    <p className="text-neutral-500">Nous vous repondrons dans les plus brefs delais.</p>
                    <button onClick={() => setSubmitted(false)} className="btn-secondary mt-4 h-10 px-5 font-medium border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50">
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
                        <label className="block text-sm font-semibold text-neutral-600 mb-2">Prenom</label>
                        <input placeholder="Votre prenom" required className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-600 mb-2">Email</label>
                      <input type="email" placeholder="votre@email.com" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-600 mb-2">Telephone</label>
                      <input type="tel" placeholder="+221 7X XXX XX XX" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-600 mb-2">Message</label>
                      <textarea placeholder="Votre message..." rows={4} required className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-250 resize-none text-[15px]" />
                    </div>
                    <button type="submit" className="group relative w-full h-12 rounded-xl text-white font-semibold overflow-hidden btn-primary">
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500" />
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="absolute inset-0 shadow-xl shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow duration-300" />
                      <span className="relative">Envoyer</span>
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
