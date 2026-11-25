import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlueTeamHuntLab } from "@/components/visualizers/BlueTeamHuntLab";
import { DfirTimelineLab } from "@/components/visualizers/DfirTimelineLab";

const LABS = {
  "dfir-timeline": {
    title: "DFIR timeline and evidence workbench",
    description: "Interactive simulated memory, filesystem, custody and super-timeline exercise.",
    course: "/learn/digital-forensics-incident-response/",
    component: DfirTimelineLab,
  },
  "blue-team-hunt": {
    title: "Threat-hunting and detection workbench",
    description: "Interactive simulated hypothesis, query, ATT&CK and response exercise.",
    course: "/learn/blue-team-threat-hunting/",
    component: BlueTeamHuntLab,
  },
} as const;

type VisualizerSlug = keyof typeof LABS;

export function generateStaticParams() {
  return Object.keys(LABS).map((visualizer) => ({ visualizer }));
}

export async function generateMetadata({ params }: { params: Promise<{ visualizer: string }> }): Promise<Metadata> {
  const { visualizer } = await params;
  const lab = LABS[visualizer as VisualizerSlug];
  if (!lab) return { title: "Visualizer not found" };
  return { title: lab.title, description: lab.description };
}

export default async function VisualizerEmbedPage({ params }: { params: Promise<{ visualizer: string }> }) {
  const { visualizer } = await params;
  const lab = LABS[visualizer as VisualizerSlug];
  if (!lab) notFound();
  const Lab = lab.component;

  return (
    <main className="min-h-screen bg-mist-50 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link href={lab.course} className="text-[11px] font-bold text-brand-700 hover:underline">
            Back to course
          </Link>
          <span className="rounded-full border border-line bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
            Simulated interactive lab
          </span>
        </div>
        <Lab />
      </div>
    </main>
  );
}
