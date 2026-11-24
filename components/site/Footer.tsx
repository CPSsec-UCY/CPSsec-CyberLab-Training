import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";

const REPO_URL = "https://github.com/CPSsec-UCY/CPSsec-CyberLab-Training";

export function Footer() {
  return (
    <footer className="mt-24 bg-navy text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <span className="font-sans text-lg font-bold tracking-tight">CPSsec CyberLab Training</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            An open, citation-backed curriculum for modern cybersecurity: red team, AppSec, identity,
            cloud, malware, DFIR, SOC operations, cryptography and post-quantum migration.
          </p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
            University of Cyprus · EUPL-1.2
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-300">Learn</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link href="/curriculum/" className="hover:text-white">Course catalogue</Link></li>
            <li><Link href="/learn/red-team-penetration-testing/" className="hover:text-white">Red team methodology</Link></li>
            <li><Link href="/learn/digital-forensics-incident-response/" className="hover:text-white">DFIR &amp; evidence</Link></li>
            <li><Link href="/learn/ml-kem/" className="hover:text-white">ML-KEM deep dive</Link></li>
            <li><Link href="/lab/" className="hover:text-white">32 interactive labs</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-300">Reference</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link href="/glossary/" className="hover:text-white">Glossary</Link></li>
            <li><Link href="/citations/" className="hover:text-white">Citation registry</Link></li>
            <li><Link href="/about/" className="hover:text-white">About &amp; roadmap</Link></li>
            <li><a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} className="hover:text-white">Contribute</a></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-300">Project</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li>
              <a href={REPO_URL} className="inline-flex items-center gap-1.5 hover:text-white">
                <Github className="h-4 w-4" /> GitHub <ArrowUpRight className="h-3 w-3" />
              </a>
            </li>
            <li><a href={`${REPO_URL}/issues/new/choose`} className="hover:text-white">Propose a module</a></li>
            <li><a href={`${REPO_URL}/security/advisories/new`} className="hover:text-white">Security policy</a></li>
            <li><a href={`${REPO_URL}/actions`} className="hover:text-white">Platform status</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[11px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CPSsec-UCY · Open source · No tracking</span>
          <span>Content reviewed November 2026 · Verify sources before operational use</span>
        </div>
      </div>
    </footer>
  );
}
