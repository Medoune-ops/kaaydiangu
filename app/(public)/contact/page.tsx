"use client";

import { useState } from "react";

const contactInfo = [
  {
    title: "Adresse",
    value: "Dakar, Senegal",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
    ),
  },
  {
    title: "Telephone",
    value: "+221 77 000 00 00",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ),
  },
  {
    title: "Email",
    value: "contact@kaaydiangu.sn",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    ),
  },
  {
    title: "Horaires",
    value: "Lun - Ven : 7h30 - 17h00",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
  },
];

const inputCls = "w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="relative bg-[#050505] py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Contactez-nous</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-3" style={{ fontFamily: "var(--font-heading)" }}>
            Contact
          </h1>
          <p className="mt-5 text-neutral-400 max-w-xl mx-auto text-lg">
            Une question ? N&apos;hesitez pas a nous contacter.
          </p>
        </div>
      </section>

      <section className="py-24 bg-[#050505]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Infos */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Nos coordonnees</h2>
                <p className="text-neutral-400 mt-3">
                  Nous sommes a votre disposition pour toute information complementaire.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex gap-4 group">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                      {info.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{info.title}</p>
                      <p className="text-neutral-400 mt-0.5">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06]">
              <div className="px-7 py-5 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Envoyez-nous un message</h3>
              </div>
              <div className="p-7">
                {submitted ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3 className="font-bold text-white text-lg">Message envoye !</h3>
                    <p className="text-neutral-400">Nous vous repondrons dans les plus brefs delais.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-4 h-10 px-5 font-medium border border-white/[0.1] rounded-xl text-neutral-300 hover:bg-white/[0.04] transition-colors">
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Nom</label>
                        <input placeholder="Votre nom" required className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Prenom</label>
                        <input placeholder="Votre prenom" required className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                      <input type="email" placeholder="votre@email.com" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Telephone</label>
                      <input type="tel" placeholder="+221 7X XXX XX XX" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Message</label>
                      <textarea placeholder="Votre message..." rows={4} required className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all resize-none" />
                    </div>
                    <button type="submit" className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25">
                      Envoyer
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
