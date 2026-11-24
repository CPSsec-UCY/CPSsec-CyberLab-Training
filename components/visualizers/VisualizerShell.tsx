"use client";

import type { ReactNode } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";

interface VisualizerShellProps {
  title: string;
  description: string;
  controls?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onReset?: () => void;
}

export function VisualizerShell({ title, description, controls, children, footer, onReset }: VisualizerShellProps) {
  return (
    <div className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-line bg-mist-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-700">
            <FlaskConical className="h-3.5 w-3.5" /> interactive mechanism
          </p>
          <h3 className="mt-1 text-sm font-bold text-navy">{title}</h3>
          <p className="mt-0.5 text-[10px] leading-4 text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {controls}
          {onReset ? (
            <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted hover:border-brand-200 hover:text-brand-700">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          ) : null}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {footer ? <div className="border-t border-line bg-mist-50/70 px-4 py-3 text-[10px] leading-5 text-muted sm:px-5">{footer}</div> : null}
    </div>
  );
}

export function Metric({ label, value, tone = "brand" }: { label: string; value: string | number; tone?: "brand" | "coral" | "teal" | "gold" | "rose" }) {
  const tones = {
    brand: "text-brand-700",
    coral: "text-coral-600",
    teal: "text-emerald-600",
    gold: "text-gold-600",
    rose: "text-rose-600",
  };
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-3">
      <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className={`mt-1 font-mono text-lg font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export function StepButton({ active, done, children, onClick }: { active: boolean; done: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition ${
        active
          ? "border-brand-300 bg-brand-50 text-brand-700"
          : done
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-line bg-white text-muted hover:border-brand-200"
      }`}
    >
      {children}
    </button>
  );
}
