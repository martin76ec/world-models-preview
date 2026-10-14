import type React from "react";
import { Easing, interpolate, random } from "remotion";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0→1 progress of an animation that starts at `start` and lasts `dur` frames. */
export const prog = (t: number, start: number, dur: number, ease = Easing.out(Easing.cubic)) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

/** Typewriter: `cpf` characters per frame. */
export const typed = (s: string, t: number, start = 0, cpf = 0.8) =>
  [...s].slice(0, Math.max(0, Math.floor((t - start) * cpf))).join("");

const GLITCH = "!<>-_\\/[]{}=+*^?#$%&01";

/** Decode effect: characters resolve left→right out of random glyphs. */
export const scramble = (s: string, t: number, start = 0, dur = 24, seed = 0) => {
  const chars = [...s];
  return chars
    .map((ch, i) => {
      if (ch === " ") return " ";
      const at = start + (dur * i) / Math.max(1, chars.length);
      if (t >= at + 6) return ch;
      if (t < at) return " ";
      return GLITCH[Math.floor(random(`${seed}-${i}-${Math.floor(t / 2)}`) * GLITCH.length)];
    })
    .join("");
};

/** Fade + rise style for plain DOM elements. */
export const enter = (t: number, delay = 0, dy = 24, dur = 18): React.CSSProperties => {
  const p = prog(t, delay, dur);
  return { opacity: p, transform: `translateY(${(1 - p) * dy}px)` };
};

export const blink = (frame: number, period = 30) => (frame % period < period / 2 ? 1 : 0);
