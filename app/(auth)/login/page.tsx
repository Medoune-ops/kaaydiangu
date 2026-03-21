"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020c1b] px-4 relative overflow-hidden">

      {/* Aurora blobs */}
      <div className="absolute -top-[25%] -left-[10%] w-[650px] h-[650px] rounded-full bg-cyan-500/[0.22] blur-[200px] animate-aurora pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[550px] h-[550px] rounded-full bg-teal-400/[0.18] blur-[180px] animate-aurora-slow pointer-events-none" />
      <div className="absolute top-[45%] left-[60%] w-[350px] h-[350px] rounded-full bg-indigo-500/[0.12] blur-[130px] animate-aurora-mid pointer-events-none" />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-60" />

      {/* Horizontal accent lines */}
      <div className="absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/12 to-transparent" />
      <div className="absolute bottom-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent" />

      <div className="w-full max-w-[440px] relative z-10">

        {/* Logo */}
        <div className="text-center mb-10 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-cyan-500/40 group-hover:shadow-cyan-500/60 transition-shadow duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white tracking-tight block" style={{ fontFamily: "var(--font-heading)" }}>
                Mon <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Ecole</span>
              </span>
              <span className="text-white/35 text-xs tracking-widest uppercase">Espace Sécurisé</span>
            </div>
          </Link>
          <p className="text-white/40 mt-5 text-[15px]">
            Connectez-vous à votre espace personnel
          </p>
        </div>

        {/* Glow under card */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[340px] h-24 bg-cyan-500/20 blur-[60px] rounded-full -mt-8 pointer-events-none animate-glow-pulse" />

        {/* Glass card */}
        <div className="relative glass-dark p-8 animate-slide-up-delay-1 border border-white/10">

          {/* Top gradient line inside card */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent rounded-full" />

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/50 text-[13px] font-semibold uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nom@ecole.sn"
                className="glass-input w-full h-12 rounded-xl px-4 text-[15px]"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/50 text-[13px] font-semibold uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="glass-input w-full h-12 rounded-xl px-4 pr-12 text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors duration-200"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-scale-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="text-[14px]">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-12 mt-2 rounded-xl font-bold text-[#020c1b] text-[15px] overflow-hidden btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400" />
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-teal-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute inset-0 shadow-xl shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow duration-300" />
              <span className="relative flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    Se connecter
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-200"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Trust indicator */}
        <div className="mt-6 flex items-center justify-center gap-3 animate-slide-up-delay-2">
          <div className="flex items-center gap-1.5 text-white/25 text-[12px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Connexion sécurisée SSL
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5 text-white/25 text-[12px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Données protégées
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-5 animate-slide-up-delay-2">
          <Link
            href="/"
            className="text-white/30 hover:text-cyan-400 font-medium transition-colors duration-250 inline-flex items-center gap-1.5 group text-[14px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform duration-300"><path d="m15 18-6-6 6-6"/></svg>
            Retour au site
          </Link>
        </p>

      </div>
    </div>
  );
}
