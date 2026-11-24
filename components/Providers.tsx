"use client";

import { CitationProvider } from "@/components/citations/CitationProvider";
import { ProgressProvider } from "@/components/learning/ProgressProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CitationProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </CitationProvider>
  );
}
