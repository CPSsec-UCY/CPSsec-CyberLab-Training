interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 leading-7 text-slate-400">{description}</p> : null}
    </div>
  );
}
