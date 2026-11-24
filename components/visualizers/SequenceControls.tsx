"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

interface SequenceControlsProps {
  label: string;
  step: number;
  length: number;
  playing: boolean;
  onSelect: (step: number) => void;
  onToggle: () => void;
  onRestart: () => void;
}

export function SequenceControls({
  label,
  step,
  length,
  playing,
  onSelect,
  onToggle,
  onRestart,
}: SequenceControlsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label={`${label} playback controls`}>
      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] font-bold text-body hover:border-brand-200 hover:text-brand-700"
        aria-label={`Restart ${label}`}
      >
        <RotateCcw className="h-3 w-3" aria-hidden="true" /> Restart
      </button>
      <button
        type="button"
        onClick={() => onSelect(step - 1)}
        disabled={step === 0}
        className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1.5 text-[10px] font-bold text-body disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Previous step of ${label}`}
      >
        <ChevronLeft className="h-3 w-3" aria-hidden="true" /> Back
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-[10px] font-bold text-brand-700 hover:border-brand-300"
        aria-label={`${playing ? "Pause" : "Play"} ${label}`}
      >
        {playing ? <Pause className="h-3 w-3" aria-hidden="true" /> : <Play className="h-3 w-3" aria-hidden="true" />}
        {playing ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        onClick={() => onSelect(step + 1)}
        disabled={step >= length - 1}
        className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1.5 text-[10px] font-bold text-body disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Next step of ${label}`}
      >
        Next <ChevronRight className="h-3 w-3" aria-hidden="true" />
      </button>
      <label className="flex min-w-[140px] flex-1 items-center gap-2">
        <span className="sr-only">{label} step</span>
        <input
          type="range"
          min={0}
          max={Math.max(0, length - 1)}
          value={step}
          onChange={(event) => onSelect(Number(event.target.value))}
          className="lab-range"
        />
        <span className="whitespace-nowrap font-mono text-[9px] text-muted" aria-hidden="true">
          {step + 1}/{length}
        </span>
      </label>
    </div>
  );
}
