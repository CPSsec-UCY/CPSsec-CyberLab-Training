"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Difficulty, ModuleMeta, TrackName } from "@/lib/types";
import { getTrack, TRACKS } from "@/lib/tracks";
import { ModuleCard } from "@/components/modules/ModuleCard";

type Sort = "recommended" | "shortest" | "advanced";

export function CourseCatalog({ modules }: { modules: ModuleMeta[] }) {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<TrackName | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [sort, setSort] = useState<Sort>("recommended");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = modules.filter((module) => {
      if (track !== "all" && module.track !== track) return false;
      if (difficulty !== "all" && module.difficulty !== difficulty) return false;
      if (!q) return true;
      const haystack = [
        module.title,
        module.subtitle,
        module.summary,
        module.track,
        module.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    if (sort === "shortest") result.sort((a, b) => a.readingTime - b.readingTime);
    else if (sort === "advanced") {
      const rank = { Introductory: 1, Intermediate: 2, Advanced: 3 };
      result.sort((a, b) => rank[b.difficulty] - rank[a.difficulty] || a.order - b.order);
    } else result.sort((a, b) => a.order - b.order);
    return result;
  }, [difficulty, modules, query, sort, track]);

  return (
    <div id="catalog" className="scroll-mt-32">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[1fr_210px_180px]">
          <label className="relative">
            <span className="sr-only">Search courses</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses, topics or keywords…"
              className="w-full rounded-xl border border-line bg-mist-50 py-3 pl-11 pr-4 text-sm text-navy placeholder:text-muted focus:border-brand-300 focus:bg-white"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by difficulty</span>
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty | "all")}
              className="w-full appearance-none rounded-xl border border-line bg-mist-50 py-3 pl-11 pr-8 text-sm text-navy focus:border-brand-300 focus:bg-white"
            >
              <option value="all">All levels</option>
              <option value="Introductory">Introductory</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort courses</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="w-full rounded-xl border border-line bg-mist-50 px-3 py-3 text-sm text-navy focus:border-brand-300 focus:bg-white"
            >
              <option value="recommended">Recommended order</option>
              <option value="shortest">Shortest first</option>
              <option value="advanced">Most advanced</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setTrack("all")}
            aria-pressed={track === "all"}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition ${
              track === "all" ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-body hover:border-brand-200"
            }`}
          >
            All tracks
          </button>
          {TRACKS.map((item) => {
            const active = track === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setTrack(item.name)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition ${
                  active ? `${item.border} ${item.accent} ${item.text}` : "border-line bg-white text-body hover:border-brand-200"
                }`}
              >
                {item.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {filtered.length} of {modules.length} courses
        </p>
        {track !== "all" ? (
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${getTrack(track).border} ${getTrack(track).accent} ${getTrack(track).text}`}>
            {track}
          </span>
        ) : null}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-semibold text-navy">No courses match that filter.</p>
          <p className="mt-2 text-sm text-body">Try a broader keyword or choose “All tracks”.</p>
          <button type="button" onClick={() => { setQuery(""); setTrack("all"); setDifficulty("all"); }} className="btn-ghost mt-5">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
