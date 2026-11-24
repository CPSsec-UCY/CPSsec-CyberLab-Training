export function Figure({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="p-4 sm:p-6">{children}</div>
      <figcaption className="border-t border-line bg-mist-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted sm:px-6">
        {caption}
      </figcaption>
    </figure>
  );
}
