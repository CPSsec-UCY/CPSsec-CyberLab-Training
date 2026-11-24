"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const LINKS = [
  { href: "/curriculum/", label: "Courses" },
  { href: "/lab/", label: "Labs" },
  { href: "/glossary/", label: "Glossary" },
  { href: "/citations/", label: "Citations" },
  { href: "/about/", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href.replace(/\/$/, "") || pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
      <div className="container-page flex h-[78px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-body hover:bg-mist-100 hover:text-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/curriculum/#catalog"
            aria-label="Search courses"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-line text-body transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:flex"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/curriculum/" className="hidden rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:inline-flex">
            Start learning
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-body lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile navigation">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive(pathname, link.href) ? "bg-brand-50 text-brand-700" : "text-body"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/curriculum/"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-navy px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Start learning
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
