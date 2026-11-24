import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  Cpu,
  FileCheck2,
  GitBranch,
  Layers,
  Sigma,
  Sparkles,
} from "lucide-react";
import { getAllModules, getCurriculumStats } from "@/lib/modules";
import { CITATIONS } from "@/lib/citations";
import { TRACKS } from "@/lib/tracks";
import { HeroVisual } from "@/components/home/HeroVisual";
import { DepthDemo } from "@/components/home/DepthDemo";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stat } from "@/components/ui/Stat";

const FEATURED = ["ml-kem", "ml-dsa", "slh-dsa", "side-channel"];

export default function HomePage() {
  const modules = getAllModules();
  const stats = getCurriculumStats();
  const featured = FEATURED.map((slug) => modules.find((module) => module.slug === slug)).filter(
    (module): module is NonNullable<typeof module> => Boolean(module),
  );

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_-20%,rgba(34,211,238,0.14),transparent_65%),radial-gradient(700px_400px_at_90%_10%,rgba(167,139,250,0.12),transparent_65%)]" />
        <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/25 bg-cyber-cyan/[0.06] px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyber-cyan" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyber-cyan">
                CPSsec-UCY · open source · no tracking
              </span>
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Cybersecurity, from <span className="text-gradient">intuition</span> to{" "}
              <span className="text-gradient">silicon</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              A four-depth learning platform for security engineering and post-quantum cryptography.
              Every claim is cited. Every protocol animation is inspectable. Every algebraic routine can
              be run in your browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/curriculum/" className="btn-primary">
                Explore the curriculum <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/learn/ml-kem/" className="btn-ghost">
                Start with ML-KEM
              </Link>
              <Link href="/lab/" className="btn-ghost">
                <Sigma className="h-4 w-4" /> Open the PQC lab
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={String(stats.modules)} label="modules" />
              <Stat value="4" label="depth lenses" />
              <Stat value={String(CITATIONS.length)} label="sources" />
              <Stat value="Wasm" label="math lab" />
            </dl>
          </div>

          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink-900/40">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="Depth lenses"
            title="One concept. Four honest explanations."
            description="Switch abstraction layers without losing your place. L1 builds intuition and threat models. L2 shows the protocol. L3 gives the definitions and bounds. L4 lands in cache lines, vector units and fault checks."
          />
          <div className="mt-10">
            <DepthDemo />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { icon: Layers, label: "L1", text: "Intuition & threat model" },
              { icon: GitBranch, label: "L2", text: "Protocol & system mechanics" },
              { icon: Sigma, label: "L3", text: "Formal math & correctness" },
              { icon: Cpu, label: "L4", text: "Implementation & hardware" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-850/40 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-950/60">
                    <Icon className="h-4 w-4 text-cyber-cyan" />
                  </span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                    <p className="text-xs text-slate-300">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Flagship modules"
            title="Start where the migration is happening."
            description="Lattice KEMs, lattice signatures, hash-based signatures and the implementation layer that decides whether any of it survives contact with hardware."
          />
          <Link href="/curriculum/" className="btn-ghost shrink-0">
            All modules <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink-900/40">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center sm:py-20">
          <div>
            <p className="eyebrow">Interactive PQC lab</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Run the arithmetic, not just the diagram.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              A Rust-compiled WebAssembly module implements negacyclic NTTs, point-wise multiplication,
              compression rounding and a schoolbook cross-check. The same page falls back to a deterministic
              TypeScript engine when Wasm is unavailable.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {[
                "Forward and inverse NTT with an inspectable coefficient index",
                "NTT multiplication benchmarked against the O(n²) schoolbook product",
                "Compression d slider with error histogram and reconciliation margin",
                "ML-KEM, ML-DSA, SLH-DSA and Classic McEliece size trade-offs",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/lab/" className="btn-primary">
                Open the lab <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/CPSsec-UCY/pqc-cyberlab/tree/main/wasm/pqc-lab"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                Inspect the Rust source
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-950/70 p-4 shadow-panel">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">pqc_lab.rs · core</span>
              <span className="chip">wasm32</span>
            </div>
            <pre className="mt-3 overflow-x-auto text-[11px] leading-6 text-slate-300">
              <code>{`// negacyclic NTT over Z_3329, n = 128
unsafe fn forward_ntt(buf: i32) {
    pre_twist(buf);      // b[j] = a[j] · ψ^j
    bit_reverse(buf);
    dit(buf, OMEGA);     // log2(128) layers
}

#[no_mangle]
pub extern "C" fn self_test() -> i32 {
    // NTT round-trip + NTT product vs naive convolution
}`}</code>
            </pre>
            <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="rounded-lg border border-white/10 bg-ink-900 p-2">
                <p className="text-slate-600">q</p>
                <p className="text-cyber-cyan">3329</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-ink-900 p-2">
                <p className="text-slate-600">n</p>
                <p className="text-cyber-violet">128</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-ink-900 p-2">
                <p className="text-slate-600">self-test</p>
                <p className="text-emerald-400">passing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Built for trust"
          title="Citations are a build dependency."
          description="A central registry stores authors, venues, DOIs, RFC numbers and precise locators. Inline references open a drawer with BibTeX. CI fails when a module cites a key that does not exist or skips a depth lens."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: FileCheck2,
              title: "Validated provenance",
              text: "Citation keys, module frontmatter and four-lens coverage are enforced by scripts/validate-content.mjs on every pull request.",
            },
            {
              icon: Boxes,
              title: "Static and portable",
              text: "Next.js static export on GitHub Pages. No backend, no accounts, no tracking. Progress lives in localStorage only.",
            },
            {
              icon: BookOpen,
              title: "Open authoring",
              text: "MDX modules live in the repository next to the visualizers. Propose a module, a correction or a new citation through the PR template.",
            },
          ].map((item) => {
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

      <section className="border-t border-white/10 bg-ink-900/40">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="Curriculum tracks"
            title="Follow a track or jump straight to the maths."
            description="The roadmap is ordered for a first pass, but every module is self-contained and every depth lens is independently useful."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TRACKS.map((track) => {
              const items = modules.filter((module) => module.track === track.name);
              return (
                <Link
                  key={track.name}
                  href="/curriculum/"
                  className="group rounded-2xl border border-white/10 bg-ink-850/50 p-5 transition hover:border-white/25 hover:bg-ink-800/70"
                >
                  <div className={`h-1 w-10 rounded-full ${track.dot}`} />
                  <h3 className="mt-4 font-semibold text-white">{track.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{track.description}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    {items.length} modules · {items.map((item) => item.slug).join(" · ")}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-cyber-cyan/20 bg-gradient-to-br from-cyber-cyan/[0.08] via-ink-850/70 to-cyber-violet/[0.08] p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyber-cyan/10 blur-3xl" />
          <p className="eyebrow">Open source · EUPL-1.2</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Teach the next migration in public.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            CPSsec CyberLab is built to be forked, reviewed and extended. Add a module, correct a citation,
            record a better animation, or bring your own protocol visualiser.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="https://github.com/CPSsec-UCY/pqc-cyberlab"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Star / fork on GitHub
            </a>
            <Link href="/about/" className="btn-ghost">
              Read the roadmap
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
