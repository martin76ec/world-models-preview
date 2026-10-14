import React from "react";
import { random, useCurrentFrame } from "remotion";
import { enter, prog } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { Grid, Tone } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Heading } from "../lib/ui";
import { useT } from "../lib/i18n";


const NOISE = ".,:;'`^~-_*+=/\\|()#%&";

/** The clean scene the noise collapses into. */
const essence = (tr: (en: string, es: string) => string) => {
  const g = new Grid(56, 18);
  g.vline(8, 0, 17, "│", 1);
  g.vline(47, 0, 17, "│", 1);
  for (let y = 0; y < 18; y++) if (y % 3 !== 2) g.set(21, y, ":", 3), g.set(34, y, ":", 3);
  g.box(10, 1, 10, 5, 0);
  g.text(12, 3, tr("TRUCK", "CAMIÓN"), 0);
  g.box(10, 12, 10, 5, 0);
  g.text(tr("YOU", "TÚ") === "TÚ" ? 14 : 13, 14, tr("YOU", "TÚ"), 0);
  for (let y = 7; y < 12; y++) g.set(15, y, y % 2 ? "·" : " ", 2);
  g.text(50, 7, " o\n/|\\\n/ \\", 0);
  g.text(50, 11, tr("PED", "PEATÓN"), 1);
  return g;
};

const Abstract: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useSince(0);
  const tr = useT();
  const target = essence(tr);
  const p = prog(t, 30, 70);
  const g = new Grid(56, 18);
  const tick = Math.floor(frame / 2);
  for (let y = 0; y < 18; y++)
    for (let x = 0; x < 56; x++) {
      if (random(`r${x},${y}`) < p) {
        const ch = target.get(x, y);
        if (ch !== " ") g.set(x, y, ch, 0);
      } else {
        const n = random(`n${x},${y},${tick}`);
        g.set(x, y, NOISE[Math.floor(n * NOISE.length)], (1 + Math.floor(n * 7) % 3) as Tone);
      }
    }
  if (p >= 1) g.blit(target, 0, 0);
  return <Ascii grid={g} size={18} />;
};

const clip = (g: Grid, x: number, y: number, s: string, reveal: number, tone: Tone) =>
  g.text(x, y, [...s].slice(0, Math.max(0, reveal - x)).join(""), tone);

const WhatIf: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useSince(1);
  const tr = useT();
  const g = new Grid(62, 9);
  const reveal = Math.floor(prog(t, 6, 60) * 62);
  const done = t > 80;
  const bad: Tone = done ? 3 : 1;
  const good: Tone = 0;

  if (reveal > 10) {
    g.vline(10, 2, 6, "│", 1);
    g.set(10, 1, "┌", 1);
    g.set(10, 7, "└", 1);
  }
  clip(g, 0, 4, "( @ ) ────┤", reveal, 0);
  clip(g, 11, 1, tr("──▶ puddle ──▶ friction ↓ ──▶ fall  ✗", "──▶ charco ──▶ fricción ↓ ──▶ caída ✗"), reveal, bad);
  clip(g, 11, 7, tr("──▶ around ──▶ dry floor  ──▶ safe  ✓", "──▶ rodear ──▶ piso seco  ──▶ seguro ✓"), reveal, good);
  if (done) {
    // a pulse travels the chosen branch, only along its arrows
    const x = Math.round(11 + ((frame * 0.6) % 38));
    if (g.get(x, 7) === "─") g.set(x, 7, "●", 0);
  }
  return <Ascii grid={g} size={18} />;
};

export const S4Pillars: React.FC = () => {
  const t0 = useSince(0);
  const t1 = useSince(1);
  const tr = useT();
  return (
    <>
      <Heading text={tr("TWO PILLARS", "DOS PILARES")} sub={tr("artificial imagination", "imaginación artificial")} t={t0} />
      <At x={0} y={225} style={enter(t0, 10)}>
        <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 18 }}>
          <span style={{ color: "var(--dim)" }}>01 / </span>{tr("abstract", "abstraer")}
        </div>
        <Abstract />
        <div className="label dim" style={{ marginTop: 16, ...enter(t0, 100, 8) }}>
          {tr("pixels ──▶ things", "píxeles ──▶ cosas")}
        </div>
      </At>
      {t1 >= 0 && (
        <At x={780} y={225} style={enter(t1, 0)}>
          <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 18 }}>
            <span style={{ color: "var(--dim)" }}>02 / </span>{tr("what if?", "¿y si…?")}
          </div>
          <div style={{ marginTop: 90 }}>
            <WhatIf />
          </div>
          <div className="label dim" style={{ marginTop: 40, ...enter(t1, 90, 8) }}>
            {tr("Δt ≈ ms · cost = 0", "Δt ≈ ms · costo = 0")}
          </div>
        </At>
      )}
    </>
  );
};
