import Link from "next/link";
import { ArrowUpRight, BookOpen, FlaskConical, Github, ShieldCheck } from "lucide-react";

const REPO_URL = "https://github.com/CPSsec-UCY/pqc-cyberlab";

export function TopBar() {
  return (
    <div className="hidden border-b border-line bg-white md:block">
      <div className="container-page flex h-9 items-center justify-between text-[11px] text-muted">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium text-body">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            CPSsec · University of Cyprus
          </span>
          <span className="h-3 w-px bg-line" />
          <span>Open cybersecurity curriculum · no tracking</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/citations/" className="inline-flex items-center gap-1.5 hover:text-brand-600">
            <BookOpen className="h-3.5 w-3.5" /> Citation registry
          </Link>
          <Link href="/lab/" className="inline-flex items-center gap-1.5 hover:text-brand-600">
            <FlaskConical className="h-3.5 w-3.5" /> Labs
          </Link>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-brand-600">
            <Github className="h-3.5 w-3.5" /> GitHub <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
