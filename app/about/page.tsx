import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookMarked, Boxes, CheckCircle2, CircleDashed, Cpu, GitPullRequest, Layers, Sigma } from "lucide-react";
import { LENSES } from "@/lib/lenses";

export const metadata: Metadata = {
  title: "About & roadmap",
  description:
    "How CPSsec CyberLab is built: static Next.js, MDX modules, a validated citation engine, Rust WebAssembly labs and GitHub Actions deployment.",
};

const PHASES = [
  {
    title: "Phase 1 — Foundation & citation engine",
    status: "done",
    detail: "Repository, static-export site, Depth Lens system, citation registry, content validation and CI.",
  },
  {
    title: "Phase 2 — Core concept modules",
    status: "done",
    detail: "Eight flagship modules covering foundations, ML-KEM, ML-DSA, SLH-DSA, NTTs, TLS/PKI and side channels across L1–L4.",
  },
  {
    title: "Phase 3 — Animations & Wasm lab",
    status: "done",
    detail: "Interactive protocol/math visualizers plus a Rust→wasm NTT, multiplication and compression lab with a TypeScript fallback.",
  },
  {
    title: "Phase 4 — Learning features & community",
    status: "active",
    detail: "Roadmap, local progress, glossary cross-links, knowledge checks, PR/issue templates and contributor authoring guide. More modules and review are ongoing.",
  },
];

const STACK = [
  {
    icon: Boxes,
    title: "Static, backend-free",
    text: "Next.js static export deployed to GitHub Pages. No server, no accounts, no analytics.",
  },
  {
    icon: BookMarked,
    title: "Citation-first authoring",
    text: "MDX modules carry frontmatter citations and inline locators. A Node validator runs in CI before the build.",
  },
  {
    icon: Layers,
    title: "Four depth lenses",
    text: "One MDX file, four <Lens> sections. The switcher preserves scroll position and the reader's last lens.",
  },
  {
    icon: Sigma,
    title: "Real browser compute",
    text: "Rust compiled to wasm32 with a hand-written ABI. No wasm-bindgen runtime, no package bloat.",
  },
  {
    icon: Cpu,
    title: "Performance honesty",
    text: "The lab compares NTT multiplication with schoolbook convolution, on the reader's device, in front of them.",
  },
  {
    icon: GitPullRequest,
    title: "Reviewable contributions",
    text: "Module, citation and animation proposals use explicit templates and a four-lens checklist.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">About the project</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        An open teaching instrument for the post-quantum transition.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
        CPSsec CyberLab is maintained by the CPSsec research group at the University of Cyprus. It exists to
        make modern cryptography and systems security teachable without flattening the details: the same
        concept is available as intuition, protocol mechanics, formal definitions and hardware reality.
      </p>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-cyber-cyan">Architecture</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STACK.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-ink-850/50 p-5">
                <Icon className="h-5 w-5 text-cyber-cyan" />
                <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-cyber-cyan">Depth lenses</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {LENSES.map((lens) => (
            <div key={lens.level} className={`rounded-xl border ${lens.accentBorder} ${lens.accentBg} p-4`}>
              <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${lens.accentText}`}>
                L{lens.level} · {lens.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{lens.description}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-500">
                {lens.audience}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-cyber-cyan">Build plan</h2>
        <ol className="mt-5 space-y-3">
          {PHASES.map((phase, index) => {
            const done = phase.status === "done";
            return (
              <li key={phase.title} className="flex gap-4 rounded-xl border border-white/10 bg-ink-850/50 p-4">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                  done ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-cyber-amber/30 bg-cyber-amber/10 text-cyber-amber"
                }`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
                </span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                    phase {index + 1} · {done ? "shipped" : "in progress"}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-white">{phase.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{phase.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-ink-850/50 p-5">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-cyber-cyan">Citation policy</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
            <li>Prefer standards, RFCs, peer-reviewed papers and maintained reference implementations.</li>
            <li>Every inline claim that depends on an external source carries a locator, not just a link.</li>
            <li>Unknown keys and malformed records fail the build; link checks run on a schedule.</li>
            <li>Corrections are welcome and treated as first-class contributions.</li>
          </ul>
          <Link href="/citations/" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyber-cyan hover:underline">
            Browse the registry <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-850/50 p-5">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-cyber-cyan">Governance</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
            <li>License: EUPL-1.2.</li>
            <li>Code of conduct: organisation-wide CPSsec-UCY policy.</li>
            <li>Maintainers: CPSsec-UCY organisation; changes land through pull requests.</li>
            <li>Content review: cryptographic claims should be reviewed by someone with domain expertise.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.12em]">
            <a href="https://github.com/CPSsec-UCY/pqc-cyberlab" className="text-cyber-cyan hover:underline">Repository</a>
            <a href="https://github.com/CPSsec-UCY/pqc-cyberlab/blob/main/CONTRIBUTING.md" className="text-cyber-cyan hover:underline">Contributing</a>
            <a href="https://github.com/CPSsec-UCY/pqc-cyberlab/blob/main/LICENSE" className="text-cyber-cyan hover:underline">License</a>
          </div>
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-cyber-cyan/20 bg-gradient-to-br from-cyber-cyan/[0.07] to-cyber-violet/[0.06] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Contribute a module or a correction</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          The authoring guide covers frontmatter, the four-lens requirement, citation keys, visualizer
          conventions and the local validation commands. If you only have a citation correction, open an
          issue with the source and locator.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="https://github.com/CPSsec-UCY/pqc-cyberlab/blob/main/CONTRIBUTING.md" className="btn-primary">
            Authoring guide <ArrowRight className="h-4 w-4" />
          </a>
          <a href="https://github.com/CPSsec-UCY/pqc-cyberlab/issues/new/choose" className="btn-ghost">
            Open an issue
          </a>
        </div>
      </section>
    </div>
  );
}
