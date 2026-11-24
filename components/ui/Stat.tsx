export function Stat({ value, label, detail }: { value: string; label: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-850/50 p-4">
      <p className="font-mono text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cyber-cyan">{label}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
}
