import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404 · route not found</p>
      <h1 className="mt-4 text-4xl font-semibold text-navy">This page is out of scope.</h1>
      <p className="mt-4 max-w-md leading-7 text-body">
        The page you requested does not exist. Try the course catalogue, the labs or the glossary.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/curriculum/" className="btn-primary">Curriculum</Link>
        <Link href="/lab/" className="btn-ghost">Labs</Link>
      </div>
    </div>
  );
}
