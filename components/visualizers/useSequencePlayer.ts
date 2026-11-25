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
  const maxStep = Math.max(0, length - 1);
  const safeStep = Math.min(step, maxStep);
  const isPlaying = playing && !reducedMotion;

  useEffect(() => {
    if (!isPlaying || length < 2) return;
    const timer = window.setInterval(() => {
      setStep((current) => (Math.min(current, maxStep) + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, length, intervalMs, maxStep]);

  function select(next: number) {
    setPlaying(false);
    setStep(Math.max(0, Math.min(length - 1, next)));
  }

  function restart() {
    setStep(0);
    setPlaying(!reducedMotion);
  }

  function toggle() {
    if (safeStep >= maxStep && !isPlaying) setStep(0);
    setPlaying((current) => !current);
  }

  return { step: safeStep, playing: isPlaying, select, restart, toggle };
}
