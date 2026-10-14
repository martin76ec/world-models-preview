import React, { useMemo } from "react";
import { maze } from "../ascii/shapes";
import { enter, prog } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { Grid, Tone } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Heading } from "../lib/ui";
import { useT } from "../lib/i18n";


type P = [number, number];

const PATH_A: P[] = [
  [3, 6],
  [15, 6],
];
const PATH_B: P[] = [
  [3, 6],
  [9, 6],
  [9, 10],
  [29, 10],
];

const along = (pts: P[], p: number): P => {
  const segs = pts.slice(1).map((b, i) => {
    const a = pts[i];
    return { a, b, len: Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]) };
  });
  const total = segs.reduce((s, x) => s + x.len, 0);
  let d = p * total;
  for (const { a, b, len } of segs) {
    if (d <= len) {
      const k = len ? d / len : 0;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    d -= len;
  }
  return pts[pts.length - 1];
};

const room = (g: Grid, ox: number, oy: number, s: number, tone: Tone) => {
  const r = (v: number) => Math.round(v * s);
  g.box(ox, oy, r(32) + 1, r(12) + 1, tone);
  g.fill(ox + r(13), oy + r(3), Math.max(2, r(6)), Math.max(2, r(6)), "░", 2);
  g.fill(ox + r(23), oy + r(2), Math.max(2, r(5)), 1, "▒", tone);
  g.set(ox + r(29), oy + r(10), "*", 0);
  g.vline(ox, oy + r(5), oy + r(7), " ");
};

const Craik: React.FC = () => {
  const t = useSince(0);
  const tr = useT();
  const g = new Grid(64, 15);
  const c = Math.max(0, t - 20) % 160;

  g.text(0, 0, tr("world", "mundo"), 2);
  room(g, 0, 1, 1, 1);
  g.text(42, 0, tr("mind", "mente"), 2);
  g.box(41, 2, 21, 11, 0, true);
  room(g, 44, 4, 0.5, 1);
  g.text(34, 7, "──▶", 2);

  // 1) rehearse in the mind
  const m = (pt: P): P => [44 + Math.round(pt[0] * 0.5), 4 + Math.round(pt[1] * 0.5)];
  if (c < 30) g.set(...m(along(PATH_A, prog(c, 0, 26))), "@", 0);
  if (c >= 24) g.set(m([15, 5])[0], m([15, 5])[1] - 1, "✗", 0);
  if (c >= 30 && c < 70) g.set(...m(along(PATH_B, prog(c, 32, 32))), "@", 0);
  if (c >= 64) g.set(m([29, 10])[0], m([29, 10])[1] - 1, "✓", 0);

  // 2) then act in the world
  const [wx, wy] = along(PATH_B, prog(c, 76, 56));
  g.set(Math.round(wx), 1 + Math.round(wy), "@", 0);
  return <Ascii grid={g} size={18} />;
};

const Turing: React.FC = () => {
  const t = useSince(1);
  const tr = useT();
  const { map, walk, W, H } = useMemo(() => maze(17, 8, "turing"), []);
  const period = walk.length * 1.5 + 70;
  const idx = Math.min(walk.length - 1, Math.floor((Math.max(0, t) % period) / 1.5));

  const known = new Set<number>();
  for (let i = 0; i <= idx; i++) {
    const [x, y] = walk[i];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) known.add((y + dy) * W + x + dx);
  }
  const trail = new Set(walk.slice(Math.max(0, idx - 14), idx).map(([x, y]) => y * W + x));

  const g = new Grid(W * 2, H + 2);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (!known.has(k)) g.text(x * 2, y, "··", 3);
      else if (map[y][x] === "#") g.text(x * 2, y, "██", 1);
      else if (trail.has(k)) g.text(x * 2, y, "· ", 2);
    }
  const [ax, ay] = walk[idx];
  g.text(ax * 2, ay, "●", 0);

  const pct = Math.round((known.size / (W * H)) * 100);
  g.text(0, H + 1, `${tr("map", "mapa")} ${String(Math.min(100, pct)).padStart(3)}%`, 1);
  const hint = tr("▸ explore · learn", "▸ explorar · aprender");
  g.text(W * 2 - hint.length, H + 1, hint, 2);
  return <Ascii grid={g} size={15} />;
};

const Who: React.FC<{ year: string; name: string; tag: string; t: number }> = ({ year, name, tag, t }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 26, ...enter(t, 6) }}>
    <div style={{ fontSize: 52, fontWeight: 700 }}>{year}</div>
    <div style={{ fontSize: 26 }}>{name}</div>
    <span className="tag">{tag}</span>
  </div>
);

export const S3Mind: React.FC = () => {
  const t0 = useSince(0);
  const t1 = useSince(1);
  const tr = useT();
  return (
    <>
      <Heading text={tr("THE MIND'S EYE", "EL OJO DE LA MENTE")} sub={tr("internal maps", "mapas internos")} t={t0} />
      <At x={0} y={230} style={{ opacity: t1 >= 0 ? 0.35 + 0.65 * (1 - prog(t1, 0, 20)) : 1 }}>
        <Who year="1943" name="CRAIK" tag={tr("mental model", "modelo mental")} t={t0} />
        <div style={enter(t0, 14)}>
          <Craik />
        </div>
      </At>
      {t1 >= 0 && (
        <At x={880} y={230}>
          <Who year="1950" name="TURING" tag={tr("child machine", "máquina niño")} t={t1} />
          <div style={enter(t1, 10)}>
            <Turing />
          </div>
        </At>
      )}
      {t1 >= 0 && (
        <At x={0} y={790} style={enter(t1, 60, 10)}>
          <div className="label">
            {tr("reality:", "realidad:")}{" "}
            <span style={{ color: "var(--dim)", textDecoration: "line-through" }}>{tr("programmed", "programada")}</span>{" "}
            ──▶ {tr("learned", "aprendida")}
          </div>
        </At>
      )}
    </>
  );
};
