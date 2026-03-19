"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

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
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full navbar-blur ${
        scrolled
          ? "is-scrolled bg-white/90 border-b border-neutral-200 shadow-sm"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex h-[72px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-shadow duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
          <span className="text-[22px] font-bold text-neutral-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Mon <span className="text-cyan-600">Ecole</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 rounded-xl text-[15px] font-medium transition-all duration-250 ease-out ${
                pathname === link.href
                  ? "text-cyan-600 bg-cyan-50"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center">
          <Link
            href="/login"
            className="btn-primary h-10 px-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold text-[15px] hover:from-cyan-600 hover:to-teal-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
          >
            Espace prive
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-200"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <div className="relative w-[22px] h-[22px]">
            <span
              className={`absolute left-0 w-full h-0.5 bg-current rounded-full transition-all duration-300 ease-out ${
                open ? "top-[10px] rotate-45" : "top-[4px] rotate-0"
              }`}
            />
            <span
              className={`absolute left-0 top-[10px] w-full h-0.5 bg-current rounded-full transition-all duration-200 ${
                open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
              }`}
            />
            <span
              className={`absolute left-0 w-full h-0.5 bg-current rounded-full transition-all duration-300 ease-out ${
                open ? "top-[10px] -rotate-45" : "top-[16px] rotate-0"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu with animation */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-neutral-100 bg-white px-6 py-5 space-y-1 animate-mobile-menu-in">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-250 ${
                pathname === link.href
                  ? "bg-cyan-50 text-cyan-600"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block mt-4 h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-teal-600"
          >
            Espace prive
          </Link>
        </div>
      </div>
    </header>
  );
}
