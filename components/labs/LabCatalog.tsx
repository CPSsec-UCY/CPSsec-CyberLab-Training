"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FlaskConical, Search } from "lucide-react";
import { LAB_CATEGORIES, LABS, type LabCategory } from "@/lib/labs";

export function LabCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LabCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LABS.filter((lab) => {
      if (category !== "all" && lab.category !== category) return false;
      if (!q) return true;
      return [lab.title, lab.description, lab.category, lab.course].join(" ").toLowerCase().includes(q);
    });
  }, [category, query]);

  return (
    <section id="catalog" className="mt-16 scroll-mt-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Mechanism catalogue</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Choose a system. Break an assumption. Fix it.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
            {LABS.length} interactive workbenches across protocols, privacy, networks, SOC, application security, red team, cloud, malware, DFIR and PQC.
          </p>
        </div>
        <span className="chip"><FlaskConical className="h-3.5 w-3.5" /> all run locally</span>
      </div>

      <div className="mt-7 rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[1fr_250px]">
          <label className="relative">
            <span className="sr-only">Search labs</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search labs, techniques or courses…"
              className="w-full rounded-xl border border-line bg-mist-50 px-11 py-3 text-sm text-navy placeholder:text-muted focus:border-brand-300 focus:bg-white"
            />
          </label>
          <label>
            <span className="sr-only">Filter labs by category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as LabCategory | "all")}
              className="w-full rounded-xl border border-line bg-mist-50 px-3 py-3 text-sm text-navy focus:border-brand-300 focus:bg-white"
            >
              <option value="all">All categories</option>
              {LAB_CATEGORIES.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${category === "all" ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-body"}`}
          >
            All labs
          </button>
          {LAB_CATEGORIES.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setCategory(item.name)}
              aria-pressed={category === item.name}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${category === item.name ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-body hover:border-brand-200"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        {filtered.length} of {LABS.length} workbenches
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((lab) => (
          <Link
            key={lab.slug}
            href={`/labs/${lab.slug}/`}
            className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-float"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="chip">{lab.category}</span>
              <ArrowUpRight className="h-4 w-4 text-brand-300 transition group-hover:text-brand-700" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy group-hover:text-brand-700">{lab.title}</h3>
            <p className="mt-2 flex-1 text-xs leading-5 text-body">{lab.description}</p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">open workbench →</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-body">
          No workbench matches that search. Try a broader technique or category.
        </div>
      ) : null}
    </section>
  );
}
