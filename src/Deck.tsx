import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Ascii } from "./lib/Ascii";
import { CELL_W, Grid } from "./lib/grid";
import { StepCtx } from "./lib/steps";
import { SLIDES } from "./slides";
import { Lang, LangCtx } from "./lib/i18n";
import { Logo } from "./lib/Logo";

export type DeckProps = { index: number; step: number; frames: number[]; entry: number; lang: Lang };

const WIPE = 16;
const COLS = 130;
const ROWS = 38;

/** Glyph band that sweeps across on every slide change. */
const Wipe: React.FC<{ entry: number }> = ({ entry }) => {
  const frame = useCurrentFrame() - entry;
  if (frame < 0 || frame >= WIPE) return null;
  const head = (frame / WIPE) * (COLS + 14);
  const size = 1920 / COLS / CELL_W;
  const g = new Grid(COLS, ROWS);
  const RAMP = "█▓▒░·";
  const edges: number[] = [];
  for (let y = 0; y < ROWS; y++) {
    const edge = Math.floor(head + random(`w${y}`) * 6);
    edges.push(edge);
    for (let x = Math.max(0, edge - 8); x <= edge && x < COLS; x++) {
      const d = edge - x;
      g.set(x, y, RAMP[Math.min(RAMP.length - 1, Math.floor(d / 1.6))], d < 3 ? 0 : 2);
    }
  }
  return (
    <AbsoluteFill>
      {edges.map((e, y) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: (e + 1) * size * CELL_W,
            right: 0,
            top: y * size * 1.2,
            height: size * 1.2 + 1,
            background: "var(--bg)",
          }}
        />
      ))}
      <Ascii grid={g} size={size} />
    </AbsoluteFill>
  );
};

export const Deck: React.FC<DeckProps> = ({ index, step, frames, entry, lang }) => {
  const def = SLIDES[index];
  const n = String(index + 1).padStart(2, "0");
  const total = String(SLIDES.length).padStart(2, "0");
  return (
    <AbsoluteFill className="slide">
      <div className="slide-grid" />
      <div
        className="label dim"
        style={{ position: "absolute", right: 112, top: 48, fontSize: 20, display: "flex", gap: 28, alignItems: "center" }}
      >
        {index > 0 && <Logo height={18} style={{ opacity: 0.45 }} />}
        <span>[{n}/{total}]</span>
      </div>
      <div className="content">
        <LangCtx.Provider value={lang}>
          <StepCtx.Provider value={{ step, frames }}>
            <def.Component />
          </StepCtx.Provider>
        </LangCtx.Provider>
      </div>
      <div style={{ position: "absolute", left: 112, right: 112, bottom: 48, display: "flex", gap: 8 }}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            style={{ flex: 1, height: 2, background: i <= index ? "var(--mid)" : "var(--faint)" }}
          />
        ))}
      </div>
      <div className="label dim" style={{ position: "absolute", right: 112, bottom: 60, fontSize: 16 }}>
        {Array.from({ length: def.steps }, (_, i) => (i <= step ? "■" : "□")).join(" ")}
      </div>
      <Wipe entry={entry} />
    </AbsoluteFill>
  );
};
