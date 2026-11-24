"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { LensLevel } from "@/lib/types";
import { getLens } from "@/lib/lenses";

interface DepthLensContextValue {
  lens: LensLevel;
  setLens: (level: LensLevel) => void;
}

const DepthLensContext = createContext<DepthLensContextValue | null>(null);

const STORAGE_KEY = "cyberlab:depth-lens";

export function useDepthLens(): DepthLensContextValue {
  const value = useContext(DepthLensContext);
  if (!value) throw new Error("useDepthLens must be used inside DepthLensProvider");
  return value;
}

export function DepthLensProvider({ children }: { children: React.ReactNode }) {
  const [lens, setLensState] = useState<LensLevel>(1);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (stored === 1 || stored === 2 || stored === 3 || stored === 4) {
        setLensState(stored);
      }
    } catch {
      // Storage can be unavailable in private browsing; keep L1.
    }
  }, []);

  const setLens = useCallback((next: LensLevel) => {
    const scrollY = window.scrollY;
    setLensState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Ignore storage failures.
    }
    const announce = document.getElementById("depth-lens-announcer");
    if (announce) {
      announce.textContent = `Depth lens ${next}: ${getLens(next).name}. Scroll position preserved.`;
    }
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
    });
  }, []);

  return (
    <DepthLensContext.Provider value={{ lens, setLens }}>
      <div data-depth-root data-active-lens={lens}>
        {children}
        <p id="depth-lens-announcer" className="sr-only" aria-live="polite" />
      </div>
    </DepthLensContext.Provider>
  );
}
