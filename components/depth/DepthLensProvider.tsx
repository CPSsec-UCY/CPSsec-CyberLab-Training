"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { LensLevel } from "@/lib/types";
import { getLens } from "@/lib/lenses";

type DepthMode = "guide" | "lens";

interface DepthLensContextValue {
  lens: LensLevel;
  mode: DepthMode;
  setLens: (level: LensLevel) => void;
  showGuide: () => void;
}

const DepthLensContext = createContext<DepthLensContextValue | null>(null);
const LENS_KEY = "cyberlab:depth-lens";
const MODE_KEY = "cyberlab:depth-mode";

export function useDepthLens(): DepthLensContextValue {
  const value = useContext(DepthLensContext);
  if (!value) throw new Error("useDepthLens must be used inside DepthLensProvider");
  return value;
}

export function DepthLensProvider({ children }: { children: React.ReactNode }) {
  const [lens, setLensState] = useState<LensLevel>(1);
  const [mode, setMode] = useState<DepthMode>("guide");

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(LENS_KEY));
      if (stored === 1 || stored === 2 || stored === 3 || stored === 4) setLensState(stored);
      const storedMode = window.localStorage.getItem(MODE_KEY);
      if (storedMode === "guide" || storedMode === "lens") setMode(storedMode);
    } catch {
      // Storage may be unavailable; the full guide remains the default.
    }
  }, []);

  const preserveScroll = useCallback((announcement: string) => {
    const scrollY = window.scrollY;
    const announcer = document.getElementById("depth-lens-announcer");
    if (announcer) announcer.textContent = announcement;
    window.requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "auto" }));
  }, []);

  const setLens = useCallback((next: LensLevel) => {
    setLensState(next);
    setMode("lens");
    try {
      window.localStorage.setItem(LENS_KEY, String(next));
      window.localStorage.setItem(MODE_KEY, "lens");
    } catch {
      // Ignore storage failures.
    }
    preserveScroll(`Depth lens ${next}: ${getLens(next).name}. Scroll position preserved.`);
  }, [preserveScroll]);

  const showGuide = useCallback(() => {
    setMode("guide");
    try {
      window.localStorage.setItem(MODE_KEY, "guide");
    } catch {
      // Ignore storage failures.
    }
    preserveScroll("Full guide: all four depth chapters are visible. Scroll position preserved.");
  }, [preserveScroll]);

  return (
    <DepthLensContext.Provider value={{ lens, mode, setLens, showGuide }}>
      <div data-depth-root data-depth-mode={mode} data-active-lens={lens}>
        {children}
        <p id="depth-lens-announcer" className="sr-only" aria-live="polite" />
      </div>
    </DepthLensContext.Provider>
  );
}
