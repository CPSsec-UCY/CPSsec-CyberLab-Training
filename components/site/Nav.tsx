"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Github, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const LINKS = [
  { href: "/curriculum/", label: "Curriculum" },
  { href: "/lab/", label: "PQC Lab" },
  { href: "/glossary/", label: "Glossary" },
  { href: "/citations/", label: "Citations" },
  { href: "/about/", label: "About" },
];

const REPO_URL = "https://github.com/CPSsec-UCY/pqc-cyberlab";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href.replace(/\/$/, "") || pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
                  active ? "bg-cyber-cyan/10 text-cyber-cyan" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300 transition hover:border-white/25 hover:text-white sm:flex"
          >
            <Github className="h-4 w-4" aria-hidden />
            Source
          </a>
          <Link href="/curriculum/" className="btn-primary hidden sm:inline-flex">
            Start learning
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-white/10 bg-ink-950/95 lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile navigation">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 font-mono text-xs uppercase tracking-[0.16em] ${
                  isActive(pathname, link.href) ? "bg-cyber-cyan/10 text-cyber-cyan" : "text-slate-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-3 font-mono text-xs uppercase tracking-[0.16em] text-slate-300"
            >
              GitHub source
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
