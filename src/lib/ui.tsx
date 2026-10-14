import React from "react";
import { useCurrentFrame } from "remotion";
import { blink, enter, prog, scramble } from "./anim";

export const Heading: React.FC<{ text: string; sub?: string; t: number; size?: number }> = ({
  text,
  sub,
  t,
  size,
}) => {
  const len = [...text].length;
  return (
    <div className="heading">
      <div className="title" style={size ? { fontSize: size } : undefined}>
        {scramble(text, t, 0, 18)}
      </div>
      <div className="rule">{"=".repeat(Math.round(prog(t, 4, 26) * len * 2))}
      </div>
      {sub && (
        <div className="sub" style={enter(t, 16, 12)}>
          [{sub}]
        </div>
      )}
    </div>
  );
};

export const Cursor: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  return <span style={{ opacity: blink(frame, 32), ...style }}>▍</span>;
};

/** Absolutely positioned block, in px. */
export const At: React.FC<{
  x: number;
  y: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, ...style }}>{children}</div>
);
