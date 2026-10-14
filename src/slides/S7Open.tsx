import React from "react";
import { useCurrentFrame } from "remotion";
import { enter, prog, typed } from "../lib/anim";
import { Ascii } from "../lib/Ascii";
import { Grid } from "../lib/grid";
import { useSince } from "../lib/steps";
import { At, Heading } from "../lib/ui";
import { useT } from "../lib/i18n";


const PAPERS = [
  "World Models      2018",
  "PlaNet            2019",
  "Dreamer           2020",
  "MuZero            2020",
  "DreamerV3         2023",
  "IRIS              2023",
  "GAIA-1            2023",
  "UniSim            2023",
  "Genie             2024",
  "DIAMOND           2024",
  "V-JEPA            2024",
  "Cosmos            2025",
  "V-JEPA 2          2025",
  "Genie 3           2025",
];

const Terminal: React.FC = () => {
  const f = useCurrentFrame();
  const t = useSince(0);
  const tr = useT();
  const g = new Grid(80, 15);
  const cmd1 = "pip install lerobot";
  const cmd2 = "git clone github.com/knightnemo/Awesome-World-Models";

  g.text(0, 0, "$", 2);
  g.text(2, 0, typed(cmd1, t, 12, 0.8), 0);
  if (t > 40) {
    const p = prog(t, 40, 40, (x) => x);
    const n = Math.round(p * 30);
    g.text(2, 1, `▕${"█".repeat(n)}${"░".repeat(30 - n)}▏ ${String(Math.round(p * 100)).padStart(3)}%`, 1);
  }
  if (t > 84) {
    [tr("datasets", "datos"), tr("models", "modelos"), "hardware"].forEach((w, i) => {
      if (t > 84 + i * 6) g.text(2 + i * 14, 2, `✓ ${w}`, 0);
    });
  }
  if (t > 104) {
    g.text(0, 4, "$", 2);
    g.text(2, 4, typed(cmd2, t, 108, 1.2), 0);
  }
  if (t > 160) {
    // an endless feed of research
    const off = (f * 0.08) % PAPERS.length;
    for (let i = 0; i < 6; i++) {
      const k = Math.floor(off + i) % PAPERS.length;
      const tone = i === 2 ? 0 : i === 1 || i === 3 ? 1 : 2;
      g.text(4, 6 + i, `${i === 2 ? "▸" : " "} ${PAPERS[k]}`, tone);
    }
    g.vline(2, 6, 11, "│", 3);
  }
  if (t > 180)
    g.text(2, 13, tr("papers ▸ 100s    code ▸ open    benchmarks ▸ ✓", "papers ▸ 100s    código ▸ abierto    benchmarks ▸ ✓"), 1);
  return <Ascii grid={g} size={20} />;
};

const Barrier: React.FC = () => {
  const t = useSince(1);
  const g = new Grid(26, 16);
  const hThen = Math.round(prog(t, 0, 30) * 12);
  const hNow = Math.max(1, Math.round(12 - prog(t, 30, 40) * 11));
  for (let i = 0; i < hThen; i++) g.text(3, 13 - i, "██████", 2);
  for (let i = 0; i < hNow; i++) g.text(15, 13 - i, "██████", 0);
  g.hline(0, 25, 14, "─", 1);
  g.text(4, 15, "lab", 2);
  g.text(15, 15, "laptop", 0);
  g.text(3, 13 - hThen, "$$$$$$", 2);
  g.text(17, 13 - hNow, "$", 0);
  return <Ascii grid={g} size={20} />;
};

export const S7Open: React.FC = () => {
  const t0 = useSince(0);
  const t1 = useSince(1);
  const tr = useT();
  return (
    <>
      <Heading text={tr("OPEN SOURCE", "CÓDIGO ABIERTO")} sub={tr("democratizing physical AI", "democratizando la IA física")} t={t0} />
      <At x={0} y={230} style={enter(t0, 4)}>
        <div style={{ border: "1px solid var(--dim)", width: 1060 }}>
          <div
            style={{
              borderBottom: "1px solid var(--faint)",
              padding: "8px 16px",
              fontSize: 18,
              color: "var(--dim)",
              display: "flex",
              gap: 18,
            }}
          >
            <span>● ● ●</span>
            <span>~/world-models</span>
          </div>
          <div style={{ padding: "18px 24px" }}>
            <Terminal />
          </div>
        </div>
      </At>
      {t1 >= 0 && (
        <At x={1250} y={250} style={enter(t1, 0)}>
          <div className="label dim" style={{ marginBottom: 12 }}>
            {tr("cost to start", "costo de entrada")}
          </div>
          <Barrier />
        </At>
      )}
    </>
  );
};
