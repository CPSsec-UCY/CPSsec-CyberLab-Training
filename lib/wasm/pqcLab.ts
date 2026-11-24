export type BufferId = "a" | "b" | "out";

export interface LabEngine {
  kind: "wasm" | "typescript";
  n: number;
  q: number;
  read: (id: BufferId) => number[];
  write: (id: BufferId, values: number[]) => void;
  seed: (seed: number) => void;
  ntt: (id: BufferId) => void;
  invntt: (id: BufferId) => void;
  pointwiseMul: () => void;
  add: () => void;
  naiveMul: () => void;
  compress: (id: BufferId, d: number) => void;
  decompress: (id: BufferId, d: number) => void;
  selfTest: () => boolean;
}

const N = 128;
const Q = 3329;
const PSI = 17;
const OMEGA = 289;

const IDS: Record<BufferId, number> = { a: 0, b: 1, out: 2 };

function modQ(value: number): number {
  const reduced = value % Q;
  return reduced < 0 ? reduced + Q : reduced;
}

function powMod(base: number, exponent: number): number {
  let result = 1;
  let value = modQ(base);
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * value) % Q;
    value = (value * value) % Q;
    power >>= 1;
  }
  return result;
}

function bitrev7(value: number): number {
  let result = 0;
  for (let bit = 0; bit < 7; bit += 1) {
    result |= ((value >> bit) & 1) << (6 - bit);
  }
  return result;
}

class TypeScriptEngine implements LabEngine {
  kind = "typescript" as const;
  n = N;
  q = Q;
  private buffers: Record<BufferId, number[]> = {
    a: new Array<number>(N).fill(0),
    b: new Array<number>(N).fill(0),
    out: new Array<number>(N).fill(0),
  };

  read(id: BufferId): number[] {
    return [...this.buffers[id]];
  }

  write(id: BufferId, values: number[]): void {
    for (let index = 0; index < N; index += 1) {
      this.buffers[id][index] = modQ(values[index] ?? 0);
    }
  }

  seed(seed: number): void {
    let state = seed | 0 || 0x9e3779b9;
    const next = () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state;
    };
    for (let index = 0; index < N; index += 1) {
      this.buffers.a[index] = next() % Q;
      this.buffers.b[index] = next() % Q;
      this.buffers.out[index] = 0;
    }
  }

  private bitReverse(values: number[]): void {
    for (let index = 0; index < N; index += 1) {
      const reversed = bitrev7(index);
      if (reversed > index) {
        [values[index], values[reversed]] = [values[reversed], values[index]];
      }
    }
  }

  private dit(values: number[], root: number): void {
    let length = 2;
    while (length <= N) {
      const wlen = powMod(root, N / length);
      const half = length / 2;
      for (let start = 0; start < N; start += length) {
        let w = 1;
        for (let j = 0; j < half; j += 1) {
          const u = values[start + j];
          const v = (values[start + j + half] * w) % Q;
          values[start + j] = modQ(u + v);
          values[start + j + half] = modQ(u - v);
          w = (w * wlen) % Q;
        }
      }
      length *= 2;
    }
  }

  ntt(id: BufferId): void {
    const values = this.buffers[id];
    let twiddle = 1;
    for (let index = 0; index < N; index += 1) {
      values[index] = (values[index] * twiddle) % Q;
      twiddle = (twiddle * PSI) % Q;
    }
    this.bitReverse(values);
    this.dit(values, OMEGA);
  }

  invntt(id: BufferId): void {
    const values = this.buffers[id];
    this.bitReverse(values);
    this.dit(values, powMod(OMEGA, Q - 2));
    const nInv = powMod(N, Q - 2);
    const psiInv = powMod(PSI, Q - 2);
    let twiddle = 1;
    for (let index = 0; index < N; index += 1) {
      values[index] = (((values[index] * nInv) % Q) * twiddle) % Q;
      twiddle = (twiddle * psiInv) % Q;
    }
  }

  pointwiseMul(): void {
    for (let index = 0; index < N; index += 1) {
      this.buffers.out[index] = (this.buffers.a[index] * this.buffers.b[index]) % Q;
    }
  }

  add(): void {
    for (let index = 0; index < N; index += 1) {
      this.buffers.out[index] = modQ(this.buffers.a[index] + this.buffers.b[index]);
    }
  }

  naiveMul(): void {
    const accumulator = new Array<number>(N).fill(0);
    for (let i = 0; i < N; i += 1) {
      for (let j = 0; j < N; j += 1) {
        const product = this.buffers.a[i] * this.buffers.b[j];
        if (i + j < N) accumulator[i + j] += product;
        else accumulator[i + j - N] -= product;
      }
    }
    for (let index = 0; index < N; index += 1) {
      this.buffers.out[index] = modQ(accumulator[index]);
    }
  }

  compress(id: BufferId, d: number): void {
    const modulus = 2 ** d;
    for (let index = 0; index < N; index += 1) {
      this.buffers[id][index] = Math.floor((this.buffers[id][index] * modulus + Math.floor(Q / 2)) / Q) % modulus;
    }
  }

  decompress(id: BufferId, d: number): void {
    const rounding = 2 ** (d - 1);
    for (let index = 0; index < N; index += 1) {
      this.buffers[id][index] = Math.floor((this.buffers[id][index] * Q + rounding) / 2 ** d);
    }
  }

  selfTest(): boolean {
    this.seed(0x12345678);
    const original = [...this.buffers.a];
    this.ntt("a");
    this.invntt("a");
    if (original.some((value, index) => value !== this.buffers.a[index])) return false;

    this.seed(0x12345678);
    this.naiveMul();
    const expected = [...this.buffers.out];
    this.seed(0x12345678);
    this.ntt("a");
    this.ntt("b");
    this.pointwiseMul();
    this.invntt("out");
    const matches = expected.every((value, index) => value === this.buffers.out[index]);
    this.seed(0x12345678);
    return matches;
  }
}

interface WasmExports {
  memory: WebAssembly.Memory;
  lab_n: () => number;
  lab_q: () => number;
  buf_a: () => number;
  buf_b: () => number;
  buf_out: () => number;
  seed: (value: number) => void;
  ntt: (id: number) => void;
  invntt: (id: number) => void;
  pointwise_mul: () => void;
  add: () => void;
  naive_mul: () => void;
  compress: (id: number, d: number) => void;
  decompress: (id: number, d: number) => void;
  self_test: () => number;
}

class WasmEngine implements LabEngine {
  kind = "wasm" as const;
  private exports: WasmExports;
  private pointers: Record<BufferId, number>;

  constructor(instance: WebAssembly.Instance) {
    const exports = instance.exports as unknown as WasmExports;
    if (!exports.memory || exports.lab_n() !== N || exports.lab_q() !== Q) {
      throw new Error("Unexpected PQC lab WebAssembly ABI");
    }
    this.exports = exports;
    this.pointers = { a: exports.buf_a(), b: exports.buf_b(), out: exports.buf_out() };
  }

  get n(): number {
    return N;
  }

  get q(): number {
    return Q;
  }

  private view(pointer: number): Int32Array {
    return new Int32Array(this.exports.memory.buffer, pointer, N);
  }

  read(id: BufferId): number[] {
    return Array.from(this.view(this.pointers[id]));
  }

  write(id: BufferId, values: number[]): void {
    const target = this.view(this.pointers[id]);
    for (let index = 0; index < N; index += 1) {
      target[index] = modQ(values[index] ?? 0);
    }
  }

  seed(seed: number): void {
    this.exports.seed(seed >>> 0);
  }

  ntt(id: BufferId): void {
    this.exports.ntt(IDS[id]);
  }

  invntt(id: BufferId): void {
    this.exports.invntt(IDS[id]);
  }

  pointwiseMul(): void {
    this.exports.pointwise_mul();
  }

  add(): void {
    this.exports.add();
  }

  naiveMul(): void {
    this.exports.naive_mul();
  }

  compress(id: BufferId, d: number): void {
    this.exports.compress(IDS[id], d);
  }

  decompress(id: BufferId, d: number): void {
    this.exports.decompress(IDS[id], d);
  }

  selfTest(): boolean {
    return this.exports.self_test() === 1;
  }
}

let enginePromise: Promise<LabEngine> | null = null;

async function loadWasmEngine(): Promise<LabEngine> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const response = await fetch(`${base}/wasm/pqc_lab.wasm`, { cache: "force-cache" });
  if (!response.ok) throw new Error(`WASM fetch failed: ${response.status}`);
  const bytes = await response.arrayBuffer();
  const result = (await WebAssembly.instantiate(bytes, {})) as unknown as
    | WebAssembly.Instance
    | { instance: WebAssembly.Instance };
  const instance = "instance" in result ? result.instance : result;
  const engine = new WasmEngine(instance);
  if (!engine.selfTest()) throw new Error("WASM self-test failed");
  return engine;
}

export function getLabEngine(): Promise<LabEngine> {
  if (!enginePromise) {
    enginePromise = loadWasmEngine().catch(() => {
      const fallback = new TypeScriptEngine();
      if (!fallback.selfTest()) throw new Error("TypeScript lab self-test failed");
      return fallback;
    });
  }
  return enginePromise;
}
