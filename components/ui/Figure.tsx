export function Figure({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-white/10 bg-ink-850/60">
      <div className="p-4 sm:p-6">{children}</div>
      <figcaption className="border-t border-white/10 bg-ink-900/60 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500 sm:px-6">
        {caption}
      </figcaption>
    </figure>
  );
}
