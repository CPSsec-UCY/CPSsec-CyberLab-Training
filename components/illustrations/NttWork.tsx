import { Cite } from "@/components/citations/Cite";

export function NttWork() {
  const products = 256 * 256;
  const butterflies = (256 / 2) * 8;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-rose-700">schoolbook convolution</p>
        <p className="mt-2 font-mono text-2xl font-bold text-rose-700">{products.toLocaleString("en-GB")}</p>
        <p className="mt-1 text-[10px] leading-4 text-rose-800">coefficient products for n = 256, O(n²)</p>
        <div className="mt-3 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px]">
          {Array.from({ length: 128 }).map((_, index) => (
            <span key={index} className="aspect-square rounded-[1px] bg-rose-300/70" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">incomplete NTT · 7 layers</p>
        <p className="mt-2 font-mono text-2xl font-bold text-emerald-700">{butterflies.toLocaleString("en-GB")}</p>
        <p className="mt-1 text-[10px] leading-4 text-emerald-800">butterflies, then a 2×2 base-case multiply</p>
        <div className="mt-3 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px]">
          {Array.from({ length: 32 }).map((_, index) => (
            <span key={index} className="aspect-square rounded-[1px] bg-emerald-300/80" />
          ))}
        </div>
      </div>
      <p className="sm:col-span-2 text-center text-[9px] leading-4 text-muted">
        The shapes are illustrative. Real cost depends on reductions, memory traffic, twiddle loads and vector width. <Cite id="fips203" locator="§4.3" /> <Cite id="longa2016" locator="pp. 124–139" />
      </p>
    </div>
  );
}
