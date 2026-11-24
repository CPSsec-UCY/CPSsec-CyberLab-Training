import Link from "next/link";
import { Activity, Atom, Bug, Cloud, Code2, Cpu, Fingerprint, KeyRound, Network, Package, Share2, ShieldCheck, Crosshair, Search } from "lucide-react";
import type { TrackMeta } from "@/lib/tracks";

const ICONS = {
  shield: ShieldCheck,
  atom: Atom,
  network: Network,
  share: Share2,
  activity: Activity,
  cpu: Cpu,
  key: KeyRound,
  code: Code2,
  cloud: Cloud,
  bug: Bug,
  package: Package,
  fingerprint: Fingerprint,
  crosshair: Crosshair,
  search: Search,
};

export function TrackCard({ track, count }: { track: TrackMeta; count: number }) {
  const Icon = ICONS[track.icon];
  return (
    <Link
      href={`/curriculum/#${track.short.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      className={`group flex h-full flex-col rounded-2xl border ${track.border} ${track.accent} p-5 transition hover:-translate-y-1 hover:shadow-card`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white ${track.text} shadow-sm`}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-bold text-navy">{track.name}</h3>
      <p className="mt-2 text-xs leading-5 text-body">{track.description}</p>
      <p className={`mt-auto pt-4 text-[11px] font-bold uppercase tracking-[0.12em] ${track.text}`}>
        {count} {count === 1 ? "course" : "courses"}
      </p>
    </Link>
  );
}
