"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Shared playback state for explanatory protocol/mechanism sequences.
 * Autoplay is always pausable and starts paused when the user prefers reduced
 * motion. The final state is not hidden when playback stops.
 */
export function useSequencePlayer(length: number, intervalMs = 2200) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    setStep((current) => Math.min(current, Math.max(0, length - 1)));
  }, [length]);

  useEffect(() => {
    if (!playing || length < 2) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [playing, length, intervalMs]);

  function select(next: number) {
    setPlaying(false);
    setStep(Math.max(0, Math.min(length - 1, next)));
  }

  function restart() {
    setStep(0);
    setPlaying(!reducedMotion);
  }

  function toggle() {
    if (step >= length - 1 && !playing) setStep(0);
    setPlaying((current) => !current);
  }

  return { step, playing, select, restart, toggle };
}
