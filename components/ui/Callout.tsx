import { AlertTriangle, FlaskConical, Info, ShieldCheck, Skull } from "lucide-react";

type Variant = "note" | "warning" | "success" | "danger" | "lab";

const STYLES: Record<Variant, { wrapper: string; title: string; Icon: typeof Info }> = {
  note: {
    wrapper: "border-brand-200 bg-brand-50/70",
    title: "text-brand-700",
    Icon: Info,
  },
  warning: {
    wrapper: "border-gold-200 bg-gold-50",
    title: "text-gold-600",
    Icon: AlertTriangle,
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-700",
    Icon: ShieldCheck,
  },
  danger: {
    wrapper: "border-rose-200 bg-rose-50",
    title: "text-rose-700",
    Icon: Skull,
  },
  lab: {
    wrapper: "border-violet-200 bg-violet-50",
    title: "text-violet-700",
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
    <aside className={`not-prose my-6 rounded-2xl border ${style.wrapper} p-4`}>
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.title}`} aria-hidden />
        <div className="min-w-0 flex-1">
          {title ? <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${style.title}`}>{title}</p> : null}
          <div className="mt-1 text-sm leading-6 text-body [&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline [&_code]:rounded [&_code]:bg-white/80 [&_code]:px-1 [&_code]:font-mono [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
