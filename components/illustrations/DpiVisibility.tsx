import { Eye, EyeOff, LockKeyhole } from "lucide-react";

const ROWS = [
  { field: "source / destination IP", plain: true, tls: true },
  { field: "ports and protocol", plain: true, tls: true },
  { field: "packet sizes and timing", plain: true, tls: true },
  { field: "TLS SNI / certificate", plain: true, tls: true },
  { field: "application payload", plain: true, tls: false },
  { field: "request path / body", plain: true, tls: false },
];

export function DpiVisibility() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="grid grid-cols-[1fr_90px_90px] gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
        <span>field</span>
        <span className="text-center">plaintext</span>
        <span className="text-center">TLS 1.3</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {ROWS.map((row) => (
          <div key={row.field} className="grid grid-cols-[1fr_90px_90px] items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
            <span className="text-[10px] text-body">{row.field}</span>
            <span className="flex justify-center">
              {row.plain ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-rose-600" />}
            </span>
            <span className="flex justify-center">
              {row.tls ? <Eye className="h-4 w-4 text-emerald-600" /> : <LockKeyhole className="h-4 w-4 text-rose-600" />}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[9px] leading-4 text-muted">
        Visibility depends on the protocol version, extensions and deployment. SNI may be hidden by encrypted client hello in some configurations.
      </p>
    </div>
  );
}
