import React from "react";
import { useCurrentFrame } from "remotion";
import { gear, globe } from "../ascii/shapes";
import { enter, prog, scramble } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { Grid } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Cursor, Heading } from "../lib/ui";
import { Logo } from "../lib/Logo";
import { useT } from "../lib/i18n";

const GearIcon: React.FC = () => {
  const f = useCurrentFrame();
  const g = new Grid(24, 11);
  gear(g, 12, 5, 6, 10, f * 0.03);
  return <Ascii grid={g} size={18} />;
};

const LoopIcon: React.FC = () => {
  const f = useCurrentFrame();
  const g = new Grid(24, 11);
  g.box(4, 2, 16, 7, 1, true);
  g.set(19, 5, "▼", 2);
  g.set(4, 5, "▲", 2);
  const per: [number, number][] = [];
  for (let x = 5; x < 19; x++) per.push([x, 2]);
  for (let y = 3; y < 8; y++) per.push([19, y]);
  for (let x = 18; x > 4; x--) per.push([x, 8]);
  for (let y = 7; y > 2; y--) per.push([4, y]);
  const i = Math.floor(f * 0.5) % per.length;
  g.set(per[i][0], per[i][1], "●", 0);
  g.text(9, 5, "±err", 2);
  return <Ascii grid={g} size={18} />;
};

const GlobeIcon: React.FC = () => {
  const f = useCurrentFrame();
  const g = new Grid(24, 11);
  globe(g, 12, 5, 5.2, f * 0.03);
  return <Ascii grid={g} size={18} />;
};

const ERAS = [
  [["AUTOMATA", "AUTÓMATAS"], ["blind", "ciegos"], ["gears", "engranajes"], GearIcon],
  [["CYBERNETICS", "CIBERNÉTICA"], ["reactive", "reactiva"], ["feedback", "retroalimentación"], LoopIcon],
  [["WORLD MODELS", "MODELOS DEL MUNDO"], ["imagine", "imaginar"], ["simulation", "simulación"], GlobeIcon],
] as const;

const Axis: React.FC<{ t: number }> = ({ t }) => {
  const tr = useT();
  const g = new Grid(124, 2);
  const p = prog(t, 10, 90, (x) => x);
  const end = Math.round(p * 122);
  g.hline(0, end, 0, "─", 2);
  if (p >= 1) g.set(123, 0, "▶", 1);
  [
    [10, tr("~60 AD", "~60 d.C.")],
    [55, "1788"],
    [100, tr("now", "hoy")],
  ].forEach(([x, label]) => {
    if (end >= (x as number)) {
      g.set(x as number, 0, "●", 0);
      g.text((x as number) - 2, 1, label as string, 1);
    }
  });
  return <Ascii grid={g} size={20} />;
};

export const S8End: React.FC = () => {
  const t0 = useSince(0);
  const t1 = useSince(1);
  const tr = useT();
  const dimmed = t1 >= 0 ? 1 - prog(t1, 0, 20) : 1;
  return (
    <>
      <div style={{ opacity: dimmed }}>
        <Heading text={tr("EVOLUTION OF ACTION", "EVOLUCIÓN DE LA ACCIÓN")} sub={tr("recap", "resumen")} t={t0} />
        {ERAS.map(([name, word, what, Icon], i) => (
          <At key={name[0]} x={i * 560} y={240} style={enter(t0, 10 + i * 28)}>
            <Icon />
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 18 }}>{tr(name[0], name[1])}</div>
            <div style={{ fontSize: 44, marginTop: 6 }}>{tr(word[0], word[1])}</div>
            <div className="label dim" style={{ marginTop: 6 }}>
              {tr(what[0], what[1])}
            </div>
          </At>
        ))}
        {[0, 1].map((i) => (
          <At key={i} x={360 + i * 560} y={350} style={enter(t0, 30 + i * 28)}>
            <div style={{ fontSize: 36, color: "var(--dim)" }}>──▶</div>
          </At>
        ))}
        <At x={0} y={720}>
          <Axis t={t0} />
        </At>
      </div>
      {t1 >= 0 && (
        <At x={0} y={260}>
          <div style={{ fontWeight: 700, fontSize: 112, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
            <div>{scramble(tr("imagine the future", "imaginar el futuro"), t1, 10, 24, 7)}</div>
            <div style={{ color: "var(--mid)" }}>{scramble(tr("before stepping into it.", "antes de vivirlo."), t1, 30, 28, 8)}</div>
          </div>
          <div style={{ fontSize: 34, marginTop: 70, color: "var(--mid)", ...enter(t1, 80) }}>
            $ {tr("thank you", "gracias")} <Cursor />
          </div>
          <div style={enter(t1, 100)}>
            <Logo height={40} style={{ marginTop: 60, opacity: 0.85 }} />
          </div>
        </At>
      )}
    </>
  );
};
