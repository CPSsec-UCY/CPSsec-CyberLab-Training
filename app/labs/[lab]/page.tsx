import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical, TerminalSquare } from "lucide-react";
import { getLab, LABS } from "@/lib/labs";
import { getModule } from "@/lib/modules";
import { ModuleReferences } from "@/components/citations/ModuleReferences";

export function generateStaticParams() {
  return LABS.map((lab) => ({ lab: lab.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lab: string }> }): Promise<Metadata> {
  const { lab: labSlug } = await params;
  const lab = getLab(labSlug);
  if (!lab) return { title: "Lab not found" };
  return { title: lab.title, description: lab.description };
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: labSlug } = await params;
  const lab = getLab(labSlug);
  if (!lab) notFound();
  const Lab = await lab.load();
  const courseSlug = lab.course.split("/").filter(Boolean)[1] ?? "";
  const supportingModule = getModule(courseSlug);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/lab/#catalog" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-700 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> All workbenches
          </Link>
          <div className="flex items-center gap-2">
            <span className="chip">{lab.category}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">
              <FlaskConical className="h-3 w-3" /> simulated lab
            </span>
          </div>
        </div>
        <header className="mb-7 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">{lab.title}</h1>
          <p className="mt-3 text-sm leading-6 text-body">{lab.description}</p>
          <Link href={lab.course} className="mt-4 inline-flex text-[11px] font-semibold text-brand-700 hover:underline">
            Read the supporting course →
          </Link>
          {courseSlug ? (
            <>
              <Link
                href={`${lab.course}#terminal-${courseSlug}`}
                className="ml-4 mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 hover:underline"
              >
                <TerminalSquare className="h-3.5 w-3.5" /> Practise the commands in the course terminal →
              </Link>
              <Link
                href={`${lab.course}#linux-terminal-${courseSlug}`}
                className="mt-2 block text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Open the Linux practice shell →
              </Link>
            </>
          ) : null}
        </header>
        <Lab />
        {supportingModule ? (
          <div className="mx-auto mt-8 max-w-4xl">
            <p className="mb-3 text-xs leading-6 text-body">
              This workbench uses simplified, deterministic teaching data. Use the supporting module and
              its primary sources to distinguish the illustrated mechanism from production assumptions.
            </p>
            <ModuleReferences ids={supportingModule.citations} title="Primary sources for this workbench" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
