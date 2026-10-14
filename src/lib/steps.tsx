import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

// Slides are advanced in "steps". Each step remembers the player frame at
// which it was revealed so animations can be timed relative to it.
export type StepState = { step: number; frames: number[] };

export const StepCtx = createContext<StepState>({ step: 0, frames: [0] });

export const NEVER = -1e6;

/** Frames elapsed since step `i` was revealed (huge negative if not yet). */
export const useSince = (i = 0) => {
  const frame = useCurrentFrame();
  const { step, frames } = useContext(StepCtx);
  return step >= i ? frame - (frames[i] ?? 0) : NEVER;
};

export const useStep = () => useContext(StepCtx).step;
