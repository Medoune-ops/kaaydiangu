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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg animate-grid-fade" />
      <div className="absolute top-[30%] left-[30%] w-[400px] h-[400px] bg-cyan-400/[0.06] rounded-full blur-[120px] animate-float-slow" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-teal-400/[0.04] rounded-full blur-[80px] animate-float" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-12 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/40 transition-shadow duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
            </div>
            <span className="text-2xl font-bold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Mon <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Ecole</span>
            </span>
          </Link>
          <p className="text-neutral-500 mt-5 text-lg">
            Connectez-vous a votre espace
          </p>
        </div>

        {/* Card */}
        <div className="gradient-border p-8 animate-slide-up-delay-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold text-neutral-600 mb-2.5 text-[15px]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nom@ecole.sn"
                className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-250 text-[15px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-600 mb-2.5 text-[15px]">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-250 text-[15px]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-scale-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-12 rounded-xl text-white font-semibold overflow-hidden btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500" />
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute inset-0 shadow-xl shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Connexion...
                  </>
                ) : "Se connecter"}
              </span>
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-500 mt-8 animate-slide-up-delay-2">
          <Link href="/" className="text-cyan-600 hover:text-cyan-500 font-medium transition-colors duration-250 inline-flex items-center gap-1.5 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform duration-300"><path d="m15 18-6-6 6-6"/></svg>
            Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
