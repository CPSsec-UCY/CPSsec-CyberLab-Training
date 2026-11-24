import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Layers } from "lucide-react";
import { getAllModules, getCurriculumStats } from "@/lib/modules";
import { TRACKS } from "@/lib/tracks";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { TrackCard } from "@/components/home/TrackCard";
import { ProgressSummary } from "@/components/learning/ProgressSummary";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Course catalogue",
  description:
    "Browse cybersecurity courses across cryptography, networks, distributed systems, SOC operations, post-quantum cryptography and hardware security.",
};

export default function CurriculumPage() {
  const modules = getAllModules();
  const stats = getCurriculumStats();

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_420px_at_12%_-10%,rgba(108,77,246,0.10),transparent_65%),radial-gradient(620px_360px_at_92%_0%,rgba(242,107,91,0.07),transparent_60%)]" />
        <div className="container-page relative grid gap-8 py-12 lg:grid-cols-[1fr_320px] lg:items-end sm:py-16">
          <div>
            <p className="eyebrow">Course catalogue</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Find the cybersecurity course you need.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-body">
              Seven tracks, {stats.modules} self-contained courses and a four-lens reading model. Search by
              topic, filter by level, or follow a role-based learning path.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip"><BookOpen className="h-3.5 w-3.5" /> {stats.modules} courses</span>
              <span className="chip"><Layers className="h-3.5 w-3.5" /> 4 depth lenses</span>
              <span className="chip"><Compass className="h-3.5 w-3.5" /> {stats.tracks} tracks</span>
            </div>
          </div>
          <ProgressSummary total={modules.length} />
        </div>
      </section>

      <section id="tracks" className="border-b border-line bg-mist-50/70">
        <div className="container-page py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Browse by track"
              title="Categories"
              description="Jump into a domain, then choose the depth that fits your role."
            />
            <Link href="#catalog" className="btn-ghost shrink-0">Jump to all courses <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRACKS.map((track) => (
              <div key={track.name} id={track.short.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-32">
                <TrackCard track={track} count={modules.filter((module) => module.track === track.name).length} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeading
          eyebrow="All courses"
          title="The full catalogue"
          description="Every course is citation-backed, interactive where it helps, and available at L1–L4."
        />
        <div className="mt-8">
          <CourseCatalog modules={modules} />
        </div>
      </section>
    </>
  );
}
