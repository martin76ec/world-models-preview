import React from "react";
import { Grid } from "./grid";

const TONES = ["var(--fg)", "var(--mid)", "var(--dim)", "var(--faint)"];

// 0xProto lacks block elements, arrows and geometric shapes; those fall back
// to another font with a different advance, so pin them to exactly 1ch.
const needsCell = (ch: string) => {
  const c = ch.codePointAt(0)!;
  return c >= 0x2190 && !(c >= 0x2500 && c <= 0x257f);
};

// Shade blocks are painted as solid cells so they tile without seams.
const BLOCKS: Record<string, string> = {
  "█": "currentColor",
  "▓": "color-mix(in srgb, currentColor 70%, transparent)",
  "▒": "color-mix(in srgb, currentColor 42%, transparent)",
  "░": "color-mix(in srgb, currentColor 20%, transparent)",
  "▄": "linear-gradient(transparent 50%, currentColor 50%)",
  "▀": "linear-gradient(currentColor 50%, transparent 50%)",
};

const renderRun = (s: string, key: number, color: string) => {
  const parts: React.ReactNode[] = [];
  let buf = "";
  let k = 0;
  for (const ch of s) {
    if (BLOCKS[ch]) {
      if (buf) parts.push(buf);
      buf = "";
      parts.push(<span key={k++} className="cell" style={{ background: BLOCKS[ch] }} />);
    } else if (needsCell(ch)) {
      if (buf) parts.push(buf);
      buf = "";
      parts.push(
        <span key={k++} className="cell">
          {ch}
        </span>,
      );
    } else buf += ch;
  }
  if (buf) parts.push(buf);
  return (
    <span key={key} style={{ color }}>
      {parts}
    </span>
  );
};

export const Ascii: React.FC<{
  grid?: Grid;
  text?: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}> = ({ grid, text, size = 20, style, className }) => {
  const g = grid ?? Grid.from(text ?? "");
  return (
    <pre className={`ascii ${className ?? ""}`} style={{ fontSize: size, ...style }}>
      {g.rows().map((row, y) => (
        <div key={y}>{row.map((seg, i) => renderRun(seg.s, i, TONES[seg.t]))}</div>
      ))}
    </pre>
  );
};
