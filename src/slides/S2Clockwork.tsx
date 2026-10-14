import React from "react";
import { useCurrentFrame } from "remotion";
import { gear, gearMesh } from "../ascii/shapes";
import { enter, prog } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { Grid } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Heading } from "../lib/ui";
import { useT } from "../lib/i18n";


const MESH = gearMesh(19, 10, 12, 40, 19.3, 9);
const DUCK = "  __\n<(o )___\n ( ._> /\n  `---'";

const Gears: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useSince(0);
  const g = new Grid(56, 28);
  const s = prog(t, 0, 30);
  const rot = frame * 0.03;
  gear(g, 19, 10, 11 * s, 12, rot);
  gear(g, 40, 19.3, 8 * s, 9, (-rot * 12) / 9 + MESH, false);
  return <Ascii grid={g} size={15} />;
};

const EVENTS = [
  [["~60 AD", "~60 d.C."], "HERO", ["ropes · weights", "cuerdas · pesas"]],
  [["~1200", "~1200"], "AL-JAZARI", ["pegboard robots", "robots de clavijas"]],
  [["1739", "1739"], "VAUCANSON", ["duck · 400 parts", "pato · 400 piezas"]],
] as const;

const Duck: React.FC = () => {
  const t = useSince(1);
  const g = new Grid(56, 7);
  const G = 6; // grain column
  const nudge = prog(t, 70, 10);
  const dx = G + Math.round(nudge * 6);
  const cycle = t % 36;
  const pecking = cycle < 8;
  const hit = nudge === 0;

  g.hline(0, 55, 5, "─", 2);
  g.text(dx, 0, DUCK, 0);
  g.text(dx + 1, 4, "╧══════╧", 1);

  const grainVisible = !(hit && cycle >= 4 && cycle < 24);
  if (grainVisible) g.set(G, 4, "∴", 1);
  if (pecking) {
    g.vline(dx, 2, cycle < 4 ? 3 : 4, "│", 0);
    if (cycle >= 4) g.set(dx, 4, "*", 0);
  }
  if (cycle >= 6 && cycle < 30) g.set(dx, 0, hit ? "✓" : "✗", hit ? 1 : 0);

  if (t > 56 && t < 84) {
    const hx = Math.round(dx - 6 + prog(t, 56, 14) * 2);
    g.text(Math.max(0, hx - 3), 2, "──▶", 0);
  }
  if (t > 84) g.text(22, 2, "world_model = null", Math.floor(t / 16) % 2 ? 0 : 1);
  return <Ascii grid={g} size={24} />;
};

export const S2Clockwork: React.FC = () => {
  const t0 = useSince(0);
  const t1 = useSince(1);
  const tr = useT();
  return (
    <>
      <Heading text={tr("BLIND GEARS", "ENGRANAJES")} sub={tr("automata", "autómatas")} t={t0} />
      <At x={0} y={220}>
        <Gears />
      </At>
      <At x={680} y={230}>
        {EVENTS.map(([year, who, what], i) => (
          <div
            key={who}
            style={{ display: "flex", gap: 36, alignItems: "baseline", marginBottom: 26, ...enter(t0, 30 + i * 14) }}
          >
            <div style={{ fontSize: 44, fontWeight: 700, width: 230 }}>{tr(year[0], year[1])}</div>
            <div style={{ fontSize: 26, width: 220 }}>{who}</div>
            <div className="label dim">{tr(what[0], what[1])}</div>
          </div>
        ))}
      </At>
      {t1 >= 0 && (
        <At x={680} y={560} style={enter(t1, 0)}>
          <Duck />
        </At>
      )}
    </>
  );
};
