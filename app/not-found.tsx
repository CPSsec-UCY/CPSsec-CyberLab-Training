import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404 · route not found</p>
      <h1 className="mt-4 text-4xl font-semibold text-white">This coefficient is out of range.</h1>
      <p className="mt-4 max-w-md leading-7 text-slate-400">
        The page you requested does not exist. Try the curriculum roadmap or jump into the PQC lab.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/curriculum/" className="btn-primary">Curriculum</Link>
        <Link href="/lab/" className="btn-ghost">PQC Lab</Link>
      </div>
    </div>
  );
}
