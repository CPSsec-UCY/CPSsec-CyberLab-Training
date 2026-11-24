"use client";

import { MotionConfig } from "framer-motion";
import { CitationProvider } from "@/components/citations/CitationProvider";
import { ProgressProvider } from "@/components/learning/ProgressProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CitationProvider>
        <ProgressProvider>{children}</ProgressProvider>
      </CitationProvider>
    </MotionConfig>
  );
}
