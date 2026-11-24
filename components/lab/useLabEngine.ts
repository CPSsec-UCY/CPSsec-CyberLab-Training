"use client";

import { useEffect, useState } from "react";
import { getLabEngine, type LabEngine } from "@/lib/wasm/pqcLab";

export function useLabEngine(): {
  engine: LabEngine | null;
  error: string | null;
} {
  const [engine, setEngine] = useState<LabEngine | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getLabEngine()
      .then((loaded) => {
        if (active) setEngine(loaded);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unknown lab error");
      });
    return () => {
      active = false;
    };
  }, []);

  return { engine, error };
}
