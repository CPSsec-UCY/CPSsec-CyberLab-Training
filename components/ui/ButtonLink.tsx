import Link from "next/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  external?: boolean;
}

export function ButtonLink({ href, children, variant = "primary", className = "", external }: ButtonLinkProps) {
  const classes = `${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
