import Link from "next/link";
import { LogoMark } from "@/components/site/Logo";

const REPO_URL = "https://github.com/CPSsec-UCY/pqc-cyberlab";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink-950/60">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-200">CPSsec CyberLab</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            An open, citation-backed learning platform for cybersecurity and post-quantum cryptography.
            Every claim is traceable, every animation is inspectable, and every module is version-controlled.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Built at the University of Cyprus · EUPL-1.2
          </p>
        </div>
        <div>
          <p className="eyebrow">Learn</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/curriculum/" className="hover:text-cyber-cyan">Curriculum</Link></li>
            <li><Link href="/learn/ml-kem/" className="hover:text-cyber-cyan">ML-KEM deep dive</Link></li>
            <li><Link href="/lab/" className="hover:text-cyber-cyan">Interactive NTT lab</Link></li>
            <li><Link href="/glossary/" className="hover:text-cyber-cyan">Glossary</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Project</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/about/" className="hover:text-cyber-cyan">About &amp; roadmap</Link></li>
            <li><Link href="/citations/" className="hover:text-cyber-cyan">Citation registry</Link></li>
            <li><a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} className="hover:text-cyber-cyan">Contributing</a></li>
            <li><a href={REPO_URL} className="hover:text-cyber-cyan">GitHub repository</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-page flex flex-col gap-2 py-5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>CPSsec-UCY · Open source · No tracking</span>
          <span>Content reviewed 2026-11 · Verify sources before deployment</span>
        </div>
      </div>
    </footer>
  );
}
