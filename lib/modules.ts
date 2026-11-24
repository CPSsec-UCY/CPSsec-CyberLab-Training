import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { LensLevel, Module, ModuleMeta, TrackName } from "@/lib/types";
import { TRACK_ORDER } from "@/lib/tracks";

const CONTENT_DIR = path.join(process.cwd(), "content", "modules");

let cache: Module[] | null = null;

function normaliseLenses(value: unknown, content: string): LensLevel[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((entry): entry is LensLevel => entry === 1 || entry === 2 || entry === 3 || entry === 4);
  }

  const found = new Set<LensLevel>();
  for (const match of content.matchAll(/<Lens\s+level=\{?["']?([1-4])/g)) {
    found.add(Number(match[1]) as LensLevel);
  }
  return [...found].sort() as LensLevel[];
}

function readModule(fileName: string): Module {
  const filePath = path.join(CONTENT_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string | undefined) ?? fileName.replace(/\.mdx$/, "");

  const meta: ModuleMeta = {
    slug,
    title: data.title as string,
    subtitle: (data.subtitle as string | undefined) ?? "",
    track: data.track as TrackName,
    order: Number(data.order ?? 0),
    difficulty: (data.difficulty as ModuleMeta["difficulty"]) ?? "Intermediate",
    readingTime: Number(data.readingTime ?? 15),
    summary: data.summary as string,
    citations: (data.citations as string[] | undefined) ?? [],
    tags: (data.tags as string[] | undefined) ?? [],
    prerequisites: (data.prerequisites as string[] | undefined) ?? [],
    updated: (data.updated as string | undefined) ?? "2026-11-24",
    lenses: normaliseLenses(data.lenses, content),
  };

  return { ...meta, content };
}

export function getAllModules(): Module[] {
  if (cache) return cache;

  if (!fs.existsSync(CONTENT_DIR)) return [];

  cache = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map(readModule)
    .sort((a, b) => a.order - b.order);

  return cache;
}

export function getModule(slug: string): Module | undefined {
  return getAllModules().find((module) => module.slug === slug);
}

export function getModuleSlugs(): string[] {
  return getAllModules().map((module) => module.slug);
}

export function getModulesByTrack(): { track: TrackName; modules: Module[] }[] {
  const modules = getAllModules();
  return TRACK_ORDER.map((track) => ({
    track,
    modules: modules.filter((module) => module.track === track),
  })).filter((group) => group.modules.length > 0);
}

export function getAdjacentModules(slug: string): {
  prev?: ModuleMeta;
  next?: ModuleMeta;
} {
  const modules = getAllModules();
  const index = modules.findIndex((module) => module.slug === slug);
  if (index < 0) return {};
  return {
    prev: modules[index - 1],
    next: modules[index + 1],
  };
}

export function moduleHref(slug: string): string {
  return `/learn/${slug}/`;
}

export function getCurriculumStats(): {
  modules: number;
  citations: number;
  lenses: number;
  tracks: number;
} {
  const modules = getAllModules();
  const citations = new Set(modules.flatMap((module) => module.citations));

  return {
    modules: modules.length,
    citations: citations.size,
    lenses: 4,
    tracks: new Set(modules.map((module) => module.track)).size,
  };
}
