import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Layers,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { getAllModules, getCurriculumStats } from "@/lib/modules";
import { CITATIONS } from "@/lib/citations";
import { TRACKS } from "@/lib/tracks";
import { HeroVisual } from "@/components/home/HeroVisual";
import { TrackCard } from "@/components/home/TrackCard";
import { DepthDemo } from "@/components/home/DepthDemo";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const FEATURED = [
  "soc-operations",
  "federated-learning",
  "deep-packet-inspection",
  "tls-pki",
  "ml-kem",
  "zero-knowledge-mpc",
];

const PATHS = [
  {
    title: "Blue team & SOC",
    description: "Detection engineering, packet-level visibility, incident triage and response.",
    slugs: ["deep-packet-inspection", "soc-operations", "tls-pki"],
    className: "from-blue-50 to-white border-blue-200",
    accent: "text-blue-700",
    icon: ShieldCheck,
  },
  {
    title: "Cryptography",
    description: "Symmetric and public-key primitives, hashing, zero-knowledge and post-quantum schemes.",
    slugs: ["asymmetric-primitives", "symmetric-crypto", "hashing-mac-kdf", "zero-knowledge-mpc"],
    className: "from-brand-50 to-white border-brand-200",
    accent: "text-brand-700",
    icon: LockKeyhole,
  },
  {
    title: "Distributed systems",
    description: "Centralised versus decentralised trust, federated learning and privacy engineering.",
    slugs: ["centralised-decentralised", "federated-learning"],
    className: "from-violet-50 to-white border-violet-200",
    accent: "text-violet-700",
    icon: Users,
  },
];

export default function HomePage() {
  const modules = getAllModules();
  const stats = getCurriculumStats();
  const featured = FEATURED.map((slug) => modules.find((module) => module.slug === slug)).filter(
    (module): module is NonNullable<typeof module> => Boolean(module),
  );

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_10%_-10%,rgba(108,77,246,0.10),transparent_65%),radial-gradient(700px_420px_at_92%_4%,rgba(242,107,91,0.08),transparent_62%)]" />
        <div className="container-page relative grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">Start learning for free</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-6xl">
              Learn cybersecurity from first principles to <span className="text-gradient">live operations</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-body">
              Cited, interactive courses across cryptography, network defence, distributed systems,
              SOC operations and post-quantum migration. Choose the depth you need, then verify every claim.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/curriculum/" className="btn-primary px-7 py-3.5 text-base">
                Explore courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/lab/" className="btn-ghost px-6 py-3.5 text-base">
                <PlayCircle className="h-5 w-5" /> Open a lab
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {[
                { value: String(stats.modules), label: "courses" },
                { value: String(stats.tracks), label: "tracks" },
                { value: String(CITATIONS.length), label: "sources" },
                { value: "4", label: "depth lenses" },
              ].map((item) => (
                <div key={item.label} className="border-l-2 border-brand-100 pl-4">
                  <p className="text-2xl font-bold text-navy">{item.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-line bg-mist-50/70">
        <div className="container-page py-16 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Top categories"
              title="Pick a track. Go as deep as you need."
              description="Seven tracks cover the defensive, cryptographic and architectural sides of security. Every course is available at four levels of abstraction."
            />
            <Link href="/curriculum/" className="btn-ghost shrink-0">All courses <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRACKS.map((track) => (
              <TrackCard key={track.name} track={track} count={modules.filter((module) => module.track === track.name).length} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured courses"
            title="Start with the work that matters."
            description="From packet-level detection and incident response to federated learning, lattice KEMs and zero-knowledge proofs."
          />
          <Link href="/curriculum/" className="btn-ghost shrink-0">Browse all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="Learning paths"
            title="Follow a role, not a syllabus."
            description="Sequenced paths for defensive operations, cryptography and distributed-system security. Jump in anywhere; every course stands alone."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PATHS.map((path) => {
              const Icon = path.icon;
              const pathModules = path.slugs
                .map((slug) => modules.find((module) => module.slug === slug))
                .filter((module): module is NonNullable<typeof module> => Boolean(module));
              return (
                <div key={path.title} className={`rounded-2xl border bg-gradient-to-br p-6 ${path.className}`}>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ${path.accent}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-navy">{path.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-body">{path.description}</p>
                  <ul className="mt-5 space-y-2">
                    {pathModules.map((module) => (
                      <li key={module.slug}>
                        <Link href={`/learn/${module.slug}/`} className="group flex items-center gap-2 text-sm font-medium text-navy hover:text-brand-700">
                          <CheckCircle2 className={`h-4 w-4 ${path.accent}`} />
                          <span className="flex-1 group-hover:underline">{module.title}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/curriculum/" className={`mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${path.accent}`}>
                    View path <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-mist-50/70">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="Depth lenses"
            title="One concept. Four honest explanations."
            description="Switch abstraction layers without losing your place. L1 builds intuition and threat models. L2 shows the protocol or system. L3 gives definitions and bounds. L4 lands in cache lines, hardware and operational reality."
          />
          <div className="mt-10"><DepthDemo /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { icon: Layers, label: "L1", text: "Intuition & threat model" },
              { icon: GraduationCap, label: "L2", text: "Protocol & system mechanics" },
              { icon: FileCheck2, label: "L3", text: "Formal math & correctness" },
              { icon: ShieldCheck, label: "L4", text: "Implementation & operations" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-card">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">{item.label}</p>
                    <p className="text-xs font-semibold text-navy">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Interactive labs</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Read it. Run it. Break it.
            </h2>
            <p className="mt-4 leading-7 text-body">
              Labs turn abstractions into observable behaviour: NTT arithmetic in WebAssembly, AEAD tamper checks,
              federated poisoning and secure aggregation, DPI pipelines and SOC triage decisions.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-body">
              {[
                "Rust-compiled Wasm with a deterministic self-test",
                "Client-side only: no accounts and no tracking",
                "Explicit assumptions and cited parameters",
                "Keyboard-accessible controls and reduced-motion fallbacks",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/lab/" className="btn-primary mt-7">Open the lab <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Sparkles, title: "PQC math lab", text: "NTT, polynomial multiplication, compression and parameter trade-offs.", href: "/lab/" },
              { icon: Users, title: "Federated simulator", text: "Compare centralised training, federated averaging and secure aggregation.", href: "/learn/federated-learning/" },
              { icon: ShieldCheck, title: "SOC triage", text: "Work an alert queue, map detections and decide containment.", href: "/learn/soc-operations/" },
              { icon: PlayCircle, title: "DPI pipeline", text: "Follow packets through parsing, flow reconstruction and encrypted-traffic limits.", href: "/learn/deep-packet-inspection/" },
            ].map((lab) => {
              const Icon = lab.icon;
              return (
                <Link key={lab.title} href={lab.href} className="group rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-float">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-navy group-hover:text-brand-700">{lab.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-body">{lab.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-navy">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-300">Built on primary sources</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Every claim has a locator.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              A central registry stores authors, venues, DOIs, RFC numbers and precise sections. Inline references
              open a drawer with BibTeX. CI fails when a module cites an unknown key or skips a depth lens.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["NIST", "IETF", "ACM", "IEEE", "OWASP", "MITRE"].map((source) => (
                <span key={source} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {source}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: String(CITATIONS.length), label: "references" },
              { value: "DOI / RFC", label: "resolvable" },
              { value: "BibTeX", label: "export" },
              { value: "CI", label: "validated" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-bold text-white">{item.value}</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-coral-50 p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl" />
          <p className="eyebrow">Open source · EUPL-1.2</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Learn in public. Teach in public.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-body">
            CPSsec CyberLab is built to be forked, reviewed and extended. Add a course, correct a citation,
            improve a lab, or bring your own protocol visualiser.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="https://github.com/CPSsec-UCY/pqc-cyberlab" target="_blank" rel="noreferrer" className="btn-primary">
              Star or fork on GitHub
            </a>
            <Link href="/about/" className="btn-ghost">Read the roadmap</Link>
          </div>
        </div>
      </section>
    </>
  );
}
