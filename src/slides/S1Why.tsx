import React from "react";
import { useCurrentFrame } from "remotion";
import { arc } from "../ascii/shapes";
import { enter, prog } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { Grid } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Heading } from "../lib/ui";
import { useT } from "../lib/i18n";


const CAT = " /\\_/\\\n( o.o )\n > ^ <";

const GY = 10; // ground row
const A = { x0: 28, y0: 9, x1: 45, y1: 15, h: 3 };
const B = { x0: 28, y0: 9, x1: 66, y1: 9, h: 6 };

const drawArc = (g: Grid, a: typeof A, p: number, tone: 0 | 1 | 2) => {
  const N = 60;
  for (let i = 0; i <= N * p; i++) {
    if (i % 2) continue;
    const { x, y } = arc(a.x0, a.y0 - 2, a.x1, a.y1 - 2, a.h, i / N);
    g.set(x, y, "·", tone);
  }
  if (p > 0 && p < 1) {
    const { x, y } = arc(a.x0, a.y0 - 2, a.x1, a.y1 - 2, a.h, p);
    g.set(x, y, "o", 1);
  }
};

const Cliff: React.FC = () => {
  const t0 = useSince(0);
  const t1 = useSince(1);
  const g = new Grid(96, 16);

  // terrain
  for (let x = 0; x < 96; x++) {
    const solid = x <= 34 || x >= 56;
    if (solid) {
      g.set(x, GY, "═", 1);
      for (let y = GY + 1; y < 16; y++) if ((x + y) % 3 === 0) g.set(x, y, "/", 3);
    } else g.set(x, 15, "^", 2);
  }

  // imagined jumps
  const pa = prog(t0, 15, 30);
  const pb = prog(t0, 50, 34);
  drawArc(g, A, pa, 2);
  if (pa >= 1) g.text(A.x1 - 1, 13, "✗", 0);
  drawArc(g, B, pb, 2);
  if (pb >= 1) g.text(B.x1 - 1, 4, "✓", 0);

  // the real jump follows the arc that survived
  const pj = prog(t1, 0, 26);
  const { x, y } = arc(B.x0, B.y0, B.x1, B.y1, B.h, pj);
  if (pj > 0) drawArc(g, B, pj, 0);
  g.text(Math.round(x) - 3, Math.round(y) - 2, CAT, 0, true);
  if (t1 > 26 && t1 < 44) {
    const d = Math.floor((t1 - 26) / 3);
    g.set(B.x1 - 5 - d, GY - 1, "·", 2);
    g.set(B.x1 + 5 + d, GY - 1, "·", 2);
  }

  return <Ascii grid={g} size={20} />;
};

const Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = useT();
  const t = useSince(2);
  const g = new Grid(92, 5);
  const boxes = [
    [0, tr("PERCEIVE", "OBSERVAR")],
    [38, tr("SIMULATE", "SIMULAR")],
    [76, tr("ACT", "ACTUAR")],
  ] as const;
  boxes.forEach(([x, label], i) => {
    if (t < i * 10) return;
    g.box(x, 0, 16, 5, i === 1 ? 0 : 1);
    g.text(x + Math.floor((16 - label.length) / 2), 2, label, 0);
  });
  if (t > 20) {
    for (const x0 of [16, 54]) {
      g.hline(x0 + 1, x0 + 20, 2, "─", 2);
      g.set(x0 + 21, 2, "▶", 1);
    }
    // a packet of "thought" flowing through
    const p = (frame % 60) / 60;
    const px = Math.floor(p * 42);
    const x = px < 21 ? 17 + px : 55 + (px - 21);
    g.set(x, 2, "●", 0);
  }
  return <Ascii grid={g} size={24} />;
};

export const S1Why: React.FC = () => {
  const t0 = useSince(0);
  const t2 = useSince(2);
  const tr = useT();
  return (
    <>
      <Heading text={tr("WHY IMAGINE?", "¿POR QUÉ IMAGINAR?")} sub={tr("prediction", "predicción")} t={t0} />
      <At x={0} y={200}>
        <Cliff />
      </At>
      <At x={1220} y={250} style={enter(t0, 90)}>
        <div className="label">{tr("imagine", "imaginar")}</div>
        <div style={{ fontSize: 56, fontWeight: 700 }}>{tr("cheap", "barato")}</div>
        <div className="label" style={{ marginTop: 28 }}>
          {tr("reality", "realidad")}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700 }}>fatal</div>
      </At>
      {t2 >= 0 && (
        <At x={0} y={640} style={enter(t2, 0)}>
          <Pipeline />
          <div className="label dim" style={{ marginTop: 22, ...enter(t2, 40, 10) }}>
            {tr("AI: react ──▶ predict", "IA: reaccionar ──▶ predecir")}
          </div>
        </At>
      )}
    </>
  );
};
