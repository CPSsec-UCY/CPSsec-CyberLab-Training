import { AlertTriangle, FlaskConical, Info, ShieldCheck, Skull } from "lucide-react";

type Variant = "note" | "warning" | "success" | "danger" | "lab";

const STYLES: Record<Variant, { wrapper: string; title: string; Icon: typeof Info }> = {
  note: {
    wrapper: "border-cyber-cyan/25 bg-cyber-cyan/[0.06]",
    title: "text-cyber-cyan",
    Icon: Info,
  },
  warning: {
    wrapper: "border-cyber-amber/30 bg-cyber-amber/[0.07]",
    title: "text-cyber-amber",
    Icon: AlertTriangle,
  },
  success: {
    wrapper: "border-emerald-400/30 bg-emerald-400/[0.06]",
    title: "text-emerald-300",
    Icon: ShieldCheck,
  },
  danger: {
    wrapper: "border-cyber-rose/30 bg-cyber-rose/[0.07]",
    title: "text-cyber-rose",
    Icon: Skull,
  },
  lab: {
    wrapper: "border-cyber-violet/30 bg-cyber-violet/[0.07]",
    title: "text-cyber-violet",
    Icon: FlaskConical,
  },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const style = STYLES[variant];
  const Icon = style.Icon;

  return (
    <aside className={`not-prose my-6 rounded-xl border ${style.wrapper} p-4`}>
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.title}`} aria-hidden />
        <div className="min-w-0 flex-1">
          {title ? <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${style.title}`}>{title}</p> : null}
          <div className="mt-1 text-sm leading-6 text-slate-300 [&_a]:text-cyber-cyan [&_a]:underline [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:font-mono [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
