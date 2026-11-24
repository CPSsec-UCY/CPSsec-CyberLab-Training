"use client";

import { motion } from "framer-motion";
import { Activity, CheckCircle2, Play, ShieldCheck, Sigma, Sparkles, Star } from "lucide-react";

const LESSONS = [
  { label: "Threat models & attacker goals", done: true },
  { label: "Detection engineering with ATT&CK", done: true },
  { label: "Triage a live incident", done: false },
];

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -right-8 -top-8 h-52 w-52 rounded-full bg-coral-200/50 blur-3xl" />
      <div className="absolute -bottom-10 -left-8 h-56 w-56 rounded-full bg-brand-200/60 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-4 shadow-float sm:p-5"
      >
        <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-600 via-brand-500 to-coral-400 p-3">
          <div className="rounded-[1.1rem] bg-navy p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-coral-400" />
                <span className="h-2 w-2 rounded-full bg-gold-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                  soc-lab · live
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/70">
                <Star className="h-3 w-3 fill-gold-400 text-gold-400" /> 4.9
              </span>
            </div>

            <div className="relative mt-4 h-36 overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(240px_120px_at_50%_0%,rgba(108,77,246,0.55),transparent_75%)]">
              <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full" aria-hidden>
                {[
                  [60, 120, 160, 58],
                  [160, 58, 280, 96],
                  [280, 96, 340, 46],
                  [160, 58, 200, 126],
                  [200, 126, 320, 120],
                  [60, 120, 200, 126],
                ].map(([x1, y1, x2, y2], index) => (
                  <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                ))}
                {[
                  [60, 120, "#F26B5B"],
                  [160, 58, "#BCA8FF"],
                  [280, 96, "#0F9D8A"],
                  [340, 46, "#F5B942"],
                  [200, 126, "#9B7BFA"],
                  [320, 120, "#F26B5B"],
                ].map(([cx, cy, fill], index) => (
                  <circle key={index} cx={cx as number} cy={cy as number} r="5" fill={fill as string} stroke="#140342" strokeWidth="2" />
                ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-700 shadow-lg transition hover:scale-105"
                  aria-label="Preview a lesson"
                >
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-navy/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/70">
                incident · privilege escalation
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coral-300">SOC-201</p>
                <p className="mt-1 text-sm font-semibold text-white">Detection engineering &amp; response</p>
              </div>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-medium text-white/70">8 lessons</span>
            </div>

            <div className="mt-4 space-y-2">
              {LESSONS.map((lesson, index) => (
                <div key={lesson.label} className="flex items-center gap-2 text-[11px] text-white/60">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${lesson.done ? "bg-emerald-400/20 text-emerald-300" : "border border-white/20 text-white/30"}`}>
                    {lesson.done ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                  </span>
                  <span className={lesson.done ? "line-through decoration-white/20" : ""}>{lesson.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-coral-400 to-gold-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-5 top-24 hidden rounded-2xl border border-line bg-white p-3 shadow-float sm:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Verified</p>
            <p className="text-xs font-bold text-navy">60+ primary sources</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute -right-4 bottom-20 hidden rounded-2xl border border-line bg-white p-3 shadow-float sm:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Sigma className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">In-browser</p>
            <p className="text-xs font-bold text-navy">Wasm math labs</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -bottom-5 left-10 hidden rounded-xl border border-line bg-white px-3 py-2 shadow-card sm:flex sm:items-center sm:gap-2"
      >
        <Activity className="h-4 w-4 text-coral-500" />
        <span className="text-[11px] font-semibold text-navy">4 depth lenses</span>
      </motion.div>

      <div className="absolute -top-4 right-16 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700 shadow-card sm:flex">
        <Sparkles className="h-3.5 w-3.5 text-coral-500" /> new tracks
      </div>
    </div>
  );
}
