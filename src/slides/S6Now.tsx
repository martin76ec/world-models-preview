import React from "react";
import { random } from "remotion";
import { enter, prog } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { CELL_H, CELL_W, Grid } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Heading } from "../lib/ui";
import { useT } from "../lib/i18n";


const W = 40;
const H = 20;

/** Self-driving: predict the pedestrian hidden behind the van. */
const Drive: React.FC<{ t: number }> = ({ t }) => {
  const c = Math.max(0, t) % 220;
  const g = new Grid(W, H);
  // braking: the world slows down once the hazard is predicted
  const v = c < 80 ? 1 : c < 180 ? 0 : prog(c, 180, 30);
  const scroll = Math.floor(c < 80 ? c * 0.5 : c < 180 ? 40 : 40 + (c - 180) * 0.5 * v);

  g.text(0, 3, "5s", 2);
  g.text(0, 8, "3s", 2);
  g.text(0, 16, "0s", 2);
  g.vline(3, 3, 16, "│", 3);
  g.vline(6, 0, H - 1, "│", 1);
  g.vline(33, 0, H - 1, "│", 1);
  for (let y = 0; y < H; y++) {
    if ((y + scroll) % 4 < 2) g.set(19, y, ":", 2);
    for (let x = 35; x < W; x += 2) if ((y + scroll + x) % 3 === 0) g.set(x, y, "·", 3);
  }
  g.box(29, 4, 4, 6, 2);
  g.fill(30, 5, 2, 4, "▒", 3);

  const ped = c < 100 ? 35 : Math.round(35 - prog(c, 100, 70, (x) => x) * 25);
  if (c >= 20 && c < 100) g.set(35, 7, Math.floor(c / 8) % 2 ? "?" : " ", 1);
  if (c >= 40) {
    const n = Math.floor(prog(c, 40, 30) * 12);
    for (let i = 0; i < n; i++) g.set(34 - i * 2, 7, "·", 1);
    g.text(10, 6, "t+3s", 2);
  }
  if (c >= 30) for (let y = 8; y < 15; y++) if (y % 2 === 0) g.set(24, y, "·", 2);
  if (c >= 70 && c < 175) g.set(24, 7, "×", Math.floor(c / 6) % 2 ? 0 : 1);
  if (c >= 80 && c < 180) g.hline(21, 27, 10, "═", 0);
  if (c >= 100) g.set(ped, 7, "o", 0);
  g.text(23, 15, "┌─┐\n│▲│\n└─┘", 0);
  return <Ascii grid={g} size={17} />;
};

/** Robot arm rehearses thousands of grasps before the real one. */
const Grasp: React.FC<{ t: number }> = ({ t }) => {
  const c = Math.max(0, t) % 220;
  const tr = useT();
  const g = new Grid(W, H);
  const B = { x: 8 * CELL_W, y: 17 * CELL_H };
  const L1 = 9;
  const L2 = 9;

  const lift = prog(c, 160, 30) * 3;
  const target = { x: 29 * CELL_W, y: (14 - lift) * CELL_H };
  const ik = (tx: number, ty: number) => {
    const dx = tx - B.x;
    const dy = ty - B.y;
    const d = Math.min(L1 + L2 - 0.01, Math.hypot(dx, dy));
    const a2 = Math.acos((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2));
    const a1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
    return [a1, a2];
  };
  const fk = (a1: number, a2: number) => {
    const e = { x: B.x + L1 * Math.cos(a1), y: B.y + L1 * Math.sin(a1) };
    const h = { x: e.x + L2 * Math.cos(a1 + a2), y: e.y + L2 * Math.sin(a1 + a2) };
    return { e: { x: e.x / CELL_W, y: e.y / CELL_H }, h: { x: h.x / CELL_W, y: h.y / CELL_H } };
  };
  const drawArm = (a1: number, a2: number, tone: 0 | 1 | 3, closed: boolean) => {
    const { e, h } = fk(a1, a2);
    g.line(8, 17, e.x, e.y, tone);
    g.line(e.x, e.y, h.x, h.y, tone);
    g.set(e.x, e.y, "o", tone);
    if (tone !== 3) {
      const hx = Math.round(h.x);
      const hy = Math.round(h.y);
      g.set(hx, hy, "┴", tone);
      const jaw = closed ? 2 : 3;
      g.hline(hx - jaw, hx + jaw, hy, "─", tone);
      g.vline(hx - jaw, hy + 1, hy + 2, "│", tone);
      g.vline(hx + jaw, hy + 1, hy + 2, "│", tone);
    }
  };

  g.hline(14, W - 1, 18, "═", 1);
  g.text(7, 18, "▄█▄", 1);

  const [ta1, ta2] = ik(target.x, target.y);
  const rest = [-1.7, 1.2];
  // 1) imagined grasps
  if (c < 90) {
    for (let k = 0; k < 7; k++) {
      const r1 = random(`a${c}-${k}`) - 0.5;
      const r2 = random(`b${c}-${k}`) - 0.5;
      drawArm(ta1 + r1 * 0.9, ta2 + r2 * 1.2, 3, false);
    }
  }
  // 2) the real one
  const p = prog(c, 95, 50);
  const a1 = rest[0] + (ta1 - rest[0]) * p;
  const a2 = rest[1] + (ta2 - rest[1]) * p;
  drawArm(a1, a2, c < 90 ? 1 : 0, c > 148);

  const jy = Math.round(15 - lift);
  g.text(28, jy, "┌─┐\n│~│\n└─┘", 0);

  const sims = Math.floor(prog(c, 0, 88, (x) => x * x) * 10000);
  g.text(0, 0, `sims ${sims.toLocaleString("en").padStart(6)}`, c < 90 ? 0 : 2);
  if (c > 148) {
    const n = 4;
    g.text(0, 2, `${tr("grip", "agarre")} ▕${"▓".repeat(n)}${"░".repeat(3)}▏ ok`, 1);
  }
  return <Ascii grid={g} size={17} />;
};

/** Generative video: gravity, bounces and arcs learned from pixels. */
const Physics: React.FC<{ t: number }> = ({ t }) => {
  const c = Math.max(0, t) % 170;
  const g = new Grid(W, H);
  const GROUND = 18;
  const grav = 0.045;
  let x = 2;
  let y = 16;
  let vx = 0.24;
  let vy = -0.72;
  const trail: [number, number][] = [];
  for (let i = 0; i < c; i++) {
    vy += grav;
    x += vx;
    y += vy;
    if (y > GROUND - 1) {
      y = GROUND - 1;
      vy = -vy * 0.62;
      vx *= 0.92;
    }
    trail.push([x, y]);
  }
  g.hline(0, W - 1, GROUND, "─", 1);
  for (let i = 3; i < W; i += 6) g.set(i, GROUND + 1, "'", 3);
  // the model's prediction of where the ball goes next
  let px = x;
  let py = y;
  let pvy = vy;
  for (let i = 0; i < 24; i++) {
    pvy += grav;
    px += vx;
    py += pvy;
    if (py > GROUND - 1) break;
    if (i % 3 === 2) g.set(px, py, "·", 2);
  }
  trail.slice(-18).forEach(([tx, ty], i) => g.set(tx, ty, i % 2 ? "·" : " ", 3));
  if (x < W) {
    g.set(x, y, "●", 0);
  }
  g.text(W - 12, 0, "g ≈ 9.8 m/s²", 2);
  return <Ascii grid={g} size={17} />;
};

const PANELS = [
  [["drive", "conducir"], ["predict 3–5 s ahead", "predice 3–5 s adelante"], Drive],
  [["grasp", "agarrar"], ["1000s of tries · ms", "miles de intentos · ms"], Grasp],
  [["physics", "física"], ["laws ◀ video", "leyes ◀ video"], Physics],
] as const;

export const S6Now: React.FC = () => {
  const t0 = useSince(0);
  const ts = [t0 - 15, useSince(1), useSince(2)];
  const tr = useT();
  return (
    <>
      <Heading text={tr("PHYSICAL AI · NOW", "IA FÍSICA · HOY")} sub={tr("from sandbox to street", "del sandbox a la calle")} t={t0} />
      {PANELS.map(([name, caption, Comp], i) =>
        ts[i] >= 0 ? (
          <At key={name[0]} x={i * 580} y={225} style={enter(ts[i], 0)}>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 16 }}>
              <span style={{ color: "var(--dim)" }}>[ </span>
              {tr(name[0], name[1])}
              <span style={{ color: "var(--dim)" }}> ]</span>
            </div>
            <div style={{ border: "1px solid var(--faint)", padding: "14px 18px", display: "inline-block" }}>
              <Comp t={ts[i]} />
            </div>
            <div className="label dim" style={{ marginTop: 14, ...enter(ts[i], 30, 8) }}>
              {tr(caption[0], caption[1])}
            </div>
          </At>
        ) : null,
      )}
    </>
  );
};
