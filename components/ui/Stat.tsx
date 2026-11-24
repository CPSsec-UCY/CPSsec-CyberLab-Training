export function Stat({ value, label, detail }: { value: string; label: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">{label}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-muted">{detail}</p> : null}
    </div>
  );
}
