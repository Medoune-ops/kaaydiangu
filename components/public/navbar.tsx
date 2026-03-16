"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "A propos" },
  { href: "/nos-classes", label: "Nos classes" },
  { href: "/revisions", label: "Revisions" },
  { href: "/actualites", label: "Actualites" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto flex h-[72px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Kaaydiangu
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center">
          <Link
            href="/login"
            className="h-10 px-6 inline-flex items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            Connexion
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#0a0a0a] px-6 py-5 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === link.href
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block mt-4 h-11 flex items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25"
          >
            Connexion
          </Link>
        </div>
      )}
    </header>
  );
}
