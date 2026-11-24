import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { getLab, LABS } from "@/lib/labs";

export function generateStaticParams() {
  return LABS.map((lab) => ({ lab: lab.slug }));
}

export function generateMetadata({ params }: { params: { lab: string } }): Metadata {
  const lab = getLab(params.lab);
  if (!lab) return { title: "Lab not found" };
  return { title: lab.title, description: lab.description };
}

export default async function LabPage({ params }: { params: { lab: string } }) {
  const lab = getLab(params.lab);
  if (!lab) notFound();
  const Lab = await lab.load();

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
        </header>
        <Lab />
      </div>
    </div>
  );
}
