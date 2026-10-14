import React from "react";
import { useCurrentFrame } from "remotion";
import { globe, orbit } from "../ascii/shapes";
import { enter, prog, scramble, typed } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { Grid } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Cursor } from "../lib/ui";
import { Logo } from "../lib/Logo";
import { useT } from "../lib/i18n";


export const S0Title: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useSince(0);
  const tr = useT();

  const g = new Grid(68, 34);
  const r = 13 * prog(t, 0, 40);
  if (r > 0.5) {
    globe(g, 34, 17, r, frame * 0.018);
    orbit(g, 34, 17, 31 * prog(t, 20, 40), 5, r, frame * 0.035);
  }

  return (
    <>
      <At x={0} y={150}>
        <div className="label" style={{ fontSize: 28 }}>
          <span style={{ color: "var(--dim)" }}>$ </span>
          {typed(tr("./imagine --world", "./imaginar --mundo"), t, 4, 0.7)}
          {t < 60 && <Cursor />}
        </div>
      </At>
      <At x={0} y={220}>
        <div style={{ fontWeight: 700, fontSize: 132, lineHeight: 1.02, letterSpacing: "-0.03em" }}>
          <div>{scramble(tr("MACHINES", "MÁQUINAS"), t, 22, 22, 1)}</div>
          <div>{scramble(tr("THAT DREAM", "QUE SUEÑAN"), t, 32, 22, 2)}</div>
        </div>
        <div className="rule" style={{ color: "var(--dim)", fontSize: 66, lineHeight: 1, height: 70, overflow: "hidden" }}>
          {"=".repeat(Math.round(prog(t, 40, 30) * 20))}
        </div>
      </At>
      <At x={0} y={600} style={enter(t, 60)}>
        <div style={{ fontSize: 34, color: "var(--mid)" }}>
          {tr("[ world models ]", "[ modelos del mundo ]")} <Cursor />
        </div>
      </At>
      <At x={0} y={780} style={enter(t, 75)}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Logo height={34} />
          <div className="label dim">// Martin Larrea</div>
        </div>
      </At>
      <At x={960} y={70}>
        <Ascii grid={g} size={18} />
      </At>
    </>
  );
};
