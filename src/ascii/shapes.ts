import { random } from "remotion";
import { ASPECT, CELL_H, CELL_W, Grid, Tone } from "../lib/grid";

const TAU = Math.PI * 2;

const landMask = (lon: number, lat: number) =>
  Math.sin(lon * 2 + 0.5) * Math.cos(lat * 3) +
  0.6 * Math.sin(lon * 5 + lat * 2 + 1.3) +
  0.4 * Math.cos(lon * 3 - lat * 5);

/** Shaded rotating planet. `r` is the radius in rows. */
export function globe(g: Grid, cx: number, cy: number, r: number, rot: number, tilt = 0.4) {
  const LAND = ":-=+*#%";
  const SEA = ".·:";
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) {
      const nx = ((x - cx) * ASPECT) / r;
      const ny = (y - cy) / r;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2);
      const y1 = ny * Math.cos(tilt) - nz * Math.sin(tilt);
      const z1 = ny * Math.sin(tilt) + nz * Math.cos(tilt);
      const lat = Math.asin(Math.max(-1, Math.min(1, -y1)));
      const lon = Math.atan2(nx, z1) + rot;
      const light = Math.pow(Math.max(0, -0.45 * nx - 0.35 * ny + 0.82 * nz), 0.8);
      const v = landMask(lon, lat);
      const meridian = Math.abs(((((lon * 180) / Math.PI) % 30) + 30) % 30 - 15) > 14.2;
      if (Math.abs(lat) > 1.38) {
        g.set(x, y, light > 0.4 ? "*" : "+", 1);
      } else if (v > 0.42) {
        const i = Math.min(LAND.length - 1, Math.floor(light * LAND.length));
        g.set(x, y, LAND[i], light > 0.3 ? 0 : 1);
      } else if (meridian) {
        g.set(x, y, "│", 3);
      } else {
        const i = Math.min(SEA.length - 1, Math.floor(light * SEA.length));
        g.set(x, y, SEA[i], light > 0.5 ? 2 : 3);
      }
    }
}

/** Tilted orbit ellipse with a satellite; parts behind the planet are hidden. */
export function orbit(
  g: Grid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  planetR: number,
  phase: number,
) {
  const N = 220;
  const behind = (x: number, y: number) =>
    ((x - cx) * ASPECT) ** 2 + (y - cy) ** 2 < planetR * planetR;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU;
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry - Math.cos(a) * ry * 0.6;
    const back = Math.sin(a) < 0;
    if (back && behind(x, y)) continue;
    if (g.get(Math.round(x), Math.round(y)) === " " || !back) g.set(x, y, "·", back ? 3 : 2);
  }
  const a = phase % TAU;
  const sx = cx + Math.cos(a) * rx;
  const sy = cy + Math.sin(a) * ry - Math.cos(a) * ry * 0.6;
  if (!(Math.sin(a) < 0 && behind(sx, sy))) {
    g.set(sx, sy, "◉", 0);
  }
}

/** Spur gear. `R` is the outer radius in physical units (≈ rows × 1.2). */
export function gear(
  g: Grid,
  cx: number,
  cy: number,
  R: number,
  teeth: number,
  rot: number,
  bright = true,
) {
  const root = R * 0.72;
  const rim = root * 0.8;
  const hub = R * 0.26;
  const bore = hub * 0.45;
  const spokes = 6;
  const spokeW = R * 0.09; // half-width
  const t0: Tone = bright ? 0 : 1;
  const t1: Tone = bright ? 1 : 2;

  /** 0 = air, 1 = spoke, 2 = solid (teeth, rim, hub) at a physical point. */
  const material = (px: number, py: number) => {
    const r = Math.hypot(px, py);
    if (r > R || r < bore) return 0;
    const phi = Math.atan2(py, px) - rot;
    if (r > root) {
      // tapered tooth: wide at the root, narrow at the tip
      const tf = ((((phi / TAU) * teeth) % 1) + 1) % 1;
      const u = (r - root) / (R - root);
      return Math.abs(tf - 0.25) < 0.27 - 0.09 * u ? 2 : 0;
    }
    if (r > rim || r < hub) return 2;
    const sa = (Math.round((phi / TAU) * spokes) / spokes) * TAU;
    return Math.abs(r * Math.sin(phi - sa)) < spokeW ? 1 : 0;
  };

  // Supersample each cell so edges follow coverage instead of popping
  // between whole cells as the gear turns. Only two glyph steps, so the
  // outline stays crisp rather than fuzzy.
  const S = 4;
  const reach = R / CELL_W + 1;
  for (let y = Math.floor(cy - reach); y <= cy + reach; y++)
    for (let x = Math.floor(cx - reach); x <= cx + reach; x++) {
      if (!g.inside(x, y)) continue;
      let solid = 0;
      let web = 0;
      for (let j = 0; j < S; j++)
        for (let i = 0; i < S; i++) {
          const m = material(
            (x - cx + (i + 0.5) / S - 0.5) * CELL_W,
            (y - cy + (j + 0.5) / S - 0.5) * CELL_H,
          );
          if (m === 2) solid++;
          else if (m === 1) web++;
        }
      solid /= S * S;
      web /= S * S;
      const d = solid + web;
      if (d < 0.4) continue;
      g.set(x, y, d > 0.7 ? "█" : "▓", solid >= web ? t0 : t1);
    }
}

/** Phase for a second gear so its teeth fall into the first gear's gaps.
 * Drive it with `rot2 = -rot1 * n1 / n2 + gearMesh(...)`. */
export function gearMesh(cx1: number, cy1: number, n1: number, cx2: number, cy2: number, n2: number) {
  const th = Math.atan2((cy2 - cy1) * CELL_H, (cx2 - cx1) * CELL_W);
  // tooth centres sit at 1/4 pitch, gaps at 3/4
  return th + Math.PI - ((0.75 - ((th * n1) / TAU - 0.25)) * TAU) / n2;
}

/** Points along a parabola from (x0,y0) to (x1,y1) peaking `h` rows above the chord. */
export const arc = (x0: number, y0: number, x1: number, y1: number, h: number, s: number) => ({
  x: x0 + (x1 - x0) * s,
  y: y0 + (y1 - y0) * s - 4 * h * s * (1 - s),
});

/** Perfect maze via seeded DFS. Returns the char map ('#' wall) and the
 * explorer's walk (including backtracking) in char coordinates. */
export function maze(cw: number, ch: number, seed: string) {
  const W = cw * 2 + 1;
  const H = ch * 2 + 1;
  const map: string[][] = Array.from({ length: H }, () => Array(W).fill("#"));
  const seen = new Set<string>();
  const walk: [number, number][] = [];
  const stack: [number, number][] = [[0, 0]];
  seen.add("0,0");
  map[1][1] = " ";
  walk.push([1, 1]);
  let n = 0;
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const options = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].filter(([dx, dy]) => {
      const nx = cx + dx;
      const ny = cy + dy;
      return nx >= 0 && ny >= 0 && nx < cw && ny < ch && !seen.has(`${nx},${ny}`);
    });
    if (options.length) {
      const [dx, dy] = options[Math.floor(random(`${seed}${n++}`) * options.length)];
      const nx = cx + dx;
      const ny = cy + dy;
      seen.add(`${nx},${ny}`);
      map[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = " ";
      map[ny * 2 + 1][nx * 2 + 1] = " ";
      walk.push([cx * 2 + 1 + dx, cy * 2 + 1 + dy], [nx * 2 + 1, ny * 2 + 1]);
      stack.push([nx, ny]);
    } else {
      stack.pop();
      if (stack.length) {
        const [px, py] = stack[stack.length - 1];
        walk.push([(cx + px) + 1, (cy + py) + 1], [px * 2 + 1, py * 2 + 1]);
      }
    }
  }
  return { map, walk, W, H };
}
