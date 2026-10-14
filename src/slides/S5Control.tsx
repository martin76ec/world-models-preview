import React from "react";
import { useCurrentFrame } from "remotion";
import { enter, prog, typed } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { CELL_H, CELL_W, Grid, Tone } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Heading } from "../lib/ui";
import { useT } from "../lib/i18n";


/** Watt's centrifugal governor: spin faster → balls fly out → valve closes. */
const Governor: React.FC = () => {
  const f = useCurrentFrame();
  const tr = useT();
  const g = new Grid(36, 20);
  const hx = 14;
  const hy = 3;
  const theta = 0.8 + 0.3 * Math.sin(f * 0.025);
  const phi = f * (0.12 + theta * 0.12);
  const L = 10;
  const dy = (L * Math.cos(theta)) / CELL_H;
  const collarY = Math.round(hy + dy * 1.7);

  g.text(hx - 2, 0, "═╤═", 1);
  g.vline(hx, 1, 16, "│", 2);
  g.set(hx, hy, "o", 0);
  const balls = [0, Math.PI].map((off) => {
    const c = Math.cos(phi + off);
    const depth = Math.sin(phi + off);
    return { x: hx + (L * Math.sin(theta) * c) / CELL_W, y: hy + dy, depth };
  });
  balls
    .sort((a, b) => a.depth - b.depth)
    .forEach(({ x, y, depth }) => {
      const tone: Tone = depth < 0 ? 2 : 0;
      g.line(hx, hy, x, y, tone === 0 ? 1 : 3);
      g.line(x, y, hx, collarY, tone === 0 ? 2 : 3);
      g.set(x, y, "●", tone);
    });
  g.set(hx, collarY, "╪", 0);
  g.hline(hx + 1, 24, collarY, "─", 2);
  const open = 1 - prog(theta, 0.5, 0.6);
  const n = Math.round(open * 6);
  g.text(25, collarY, `▕${"▓".repeat(n)}${"░".repeat(6 - n)}▏`, 1);
  g.text(25, collarY + 1, tr("valve", "válvula"), 2);
  g.box(hx - 6, 17, 13, 3, 1);
  g.text(hx - 3, 18, tr("STEAM", "VAPOR"), 1);
  return <Ascii grid={g} size={22} />;
};

const PULSE: [number, number][] = [
  ...Array.from({ length: 9 }, (_, i) => [16 + i, 1] as [number, number]),
  [32, 4],
  [32, 5],
  ...Array.from({ length: 26 }, (_, i) => [32 - i, 6] as [number, number]),
  [7, 5],
];

const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const tr = useT();
  const g = new Grid(41, 7);
  g.box(0, 0, 15, 6, 1);
  g.text(3, 1, tr("REGULATOR", "REGULADOR"), 1);
  const i = Math.floor(f * 0.5) % (PULSE.length + 8);
  const flash = i >= PULSE.length - 1;
  g.box(2, 2, 11, 3, flash ? 0 : 2, true);
  g.text(tr("MODEL", "MODELO").length > 5 ? 4 : 5, 3, tr("MODEL", "MODELO"), flash ? 0 : 1);
  g.box(25, 0, 15, 4, 1);
  g.text(29, 1, tr("SYSTEM", "SISTEMA"), 1);
  g.text(29, 2, tr("~ship~", "~barco~"), 2);
  g.hline(15, 23, 1, "─", 2);
  g.set(24, 1, "▶", 1);
  g.set(32, 3, "┬", 1);
  g.vline(32, 4, 5, "│", 2);
  g.set(32, 6, "┘", 2);
  g.hline(8, 31, 6, "─", 2);
  g.set(7, 6, "└", 2);
  g.set(7, 5, "▲", 1);
  g.text(16, 6, " sensor ", 2);
  if (i < PULSE.length) {
    const [x, y] = PULSE[i];
    g.set(x, y, "●", 0);
    if (i > 0 && PULSE[i - 1][1] === y) g.set(PULSE[i - 1][0], y, "•", 1);
  }
  return <Ascii grid={g} size={22} />;
};

const SHIP = "  |\\\n__|_\\__\n\\_____/";

const wave = (x: number, f: number) => {
  const wx = 52 - ((f * 0.32) % 80);
  return 1.0 * Math.sin(x * 0.3 - f * 0.1) + 1.6 * Math.exp(-((x - wx) ** 2) / 14);
};

const Sea: React.FC<{ predictive: boolean }> = ({ predictive }) => {
  const f = useCurrentFrame();
  const g = new Grid(44, 8);
  const base = 5;
  for (let x = 0; x < 44; x++) {
    const y = Math.round(base - wave(x, f));
    g.set(x, y, "~", 1);
    for (let yy = y + 1; yy < 8; yy++) if ((x + yy) % 2 === 0) g.set(x, yy, "·", 3);
  }
  const sx = 20;
  const fl = predictive ? f : f - 8; // the reactive ship responds late
  const slope = wave(sx + 3, fl) - wave(sx - 3, fl);
  const tilt = predictive ? slope * 0.12 : slope * 1.5;
  const bob = predictive ? wave(sx, f) * 0.35 + 0.6 : wave(sx, fl);
  const top = Math.round(base - bob) - 2;
  SHIP.split("\n").forEach((row, r) => {
    const shear = Math.round(-tilt * (2 - r));
    g.text(sx - 3 + shear, top + r, row, 0, true);
  });
  if (!predictive && Math.abs(tilt) > 1.3) {
    g.text(sx + 6, top - 1, "!!", 0);
    g.set(sx - 5, top + 1, "*", 1);
  }
  if (predictive) {
    // the model sees the wave coming
    for (let x = sx + 5; x < 44; x += 2) g.set(x, Math.round(base - wave(x, f + 10)) - 1, "·", 2);
  }
  return <Ascii grid={g} size={20} />;
};

const EVENTS = [
  ["1788", "WATT", ["governor", "regulador"]],
  ["1948", "WIENER", ["feedback", "retroalimentación"]],
  ["1970", "CONANT & ASHBY", ["theorem", "teorema"]],
] as const;

export const S5Control: React.FC = () => {
  const t0 = useSince(0);
  const t1 = useSince(1);
  const t2 = useSince(2);
  const tr = useT();
  const fadeA = t1 >= 0 ? 1 - prog(t1, 0, 12) : 1;
  const QUOTE = tr(
    "every good regulator of a system must be a model of that system.",
    "todo buen regulador de un sistema debe ser un modelo de ese sistema.",
  );
  return (
    <>
      <Heading text={tr("CONTROL = SIMULATION", "CONTROL = SIMULACIÓN")} sub={tr("cybernetics", "cibernética")} t={t0} />
      {fadeA > 0 && (
        <div style={{ opacity: fadeA }}>
          <At x={40} y={230} style={enter(t0, 10)}>
            <Governor />
          </At>
          <At x={760} y={290}>
            {EVENTS.map(([year, who, what], i) => (
              <div
                key={year}
                style={{ display: "flex", gap: 36, alignItems: "baseline", marginBottom: 34, ...enter(t0, 30 + i * 14) }}
              >
                <div style={{ fontSize: 52, fontWeight: 700, width: 170 }}>{year}</div>
                <div style={{ fontSize: 28, width: 330 }}>{who}</div>
                <div className="label dim">{tr(what[0], what[1])}</div>
              </div>
            ))}
          </At>
        </div>
      )}
      {t1 >= 0 && (
        <>
          <At x={0} y={225} style={{ ...enter(t1, 8), width: 1500 }}>
            <div style={{ fontSize: 46, fontStyle: "italic", lineHeight: 1.3 }}>
              <span style={{ color: "var(--dim)" }}>“</span>
              {typed(QUOTE, t1, 10, 1.6)}
              <span style={{ color: "var(--dim)" }}>{t1 > 10 + QUOTE.length / 1.6 ? "”" : ""}</span>
            </div>
            <div className="label dim" style={{ marginTop: 12 }}>
              — conant & ashby, 1970
            </div>
          </At>
          <At x={0} y={470} style={enter(t1, 40)}>
            <Loop />
          </At>
        </>
      )}
      {t2 >= 0 && (
        <At x={800} y={440} style={enter(t2, 0)}>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <div className="label" style={{ width: 120 }}>{tr("react", "reactivo")}</div>
            <Sea predictive={false} />
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center", marginTop: 16, ...enter(t2, 20) }}>
            <div className="label" style={{ width: 120, color: "var(--fg)" }}>{tr("model", "modelo")}</div>
            <Sea predictive />
          </div>
        </At>
      )}
    </>
  );
};
