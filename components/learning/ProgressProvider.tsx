"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface ProgressContextValue {
  completed: string[];
  isComplete: (slug: string) => boolean;
  toggle: (slug: string) => void;
  totalCompleted: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);
const STORAGE_KEY = "cyberlab:completed-modules";

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside ProgressProvider");
  return value;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) {
        setCompleted(parsed.filter((entry): entry is string => typeof entry === "string"));
      }
    } catch {
      // Keep empty progress when storage is unavailable.
    }
  }, []);

  const toggle = useCallback((slug: string) => {
    setCompleted((current) => {
      const next = current.includes(slug) ? current.filter((entry) => entry !== slug) : [...current, slug];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      completed,
      isComplete: (slug: string) => completed.includes(slug),
      toggle,
      totalCompleted: completed.length,
    }),
    [completed, toggle],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
