// A character canvas. Every diagram in the deck is drawn into one of these
// per frame and rendered as monospaced text by <Ascii />.

/** 0 = bright, 1 = mid, 2 = dim, 3 = faint */
export type Tone = 0 | 1 | 2 | 3;

/** Physical size of one cell relative to font-size (0xProto advance / line-height). */
export const CELL_W = 0.62;
export const CELL_H = 1.2;
export const ASPECT = CELL_W / CELL_H;

export type Segment = { s: string; t: Tone };

export class Grid {
  readonly w: number;
  readonly h: number;
  private c: string[];
  private t: Uint8Array;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.c = new Array(w * h).fill(" ");
    this.t = new Uint8Array(w * h);
  }

  static from(text: string, tone: Tone = 0): Grid {
    const lines = text.replace(/^\n/, "").split("\n");
    const g = new Grid(Math.max(...lines.map((l) => [...l].length)), lines.length);
    g.text(0, 0, lines.join("\n"), tone);
    return g;
  }

  inside(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  set(x: number, y: number, ch: string, tone: Tone = 0) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inside(x, y)) return;
    const i = y * this.w + x;
    this.c[i] = ch;
    this.t[i] = tone;
  }

  get(x: number, y: number) {
    return this.inside(x, y) ? this.c[y * this.w + x] : " ";
  }

  /** Multi-line text. With `transparent`, spaces don't overwrite. */
  text(x: number, y: number, s: string, tone: Tone = 0, transparent = false) {
    s.split("\n").forEach((line, dy) => {
      [...line].forEach((ch, dx) => {
        if (transparent && ch === " ") return;
        this.set(x + dx, y + dy, ch, tone);
      });
    });
  }

  hline(x0: number, x1: number, y: number, ch = "─", tone: Tone = 0) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, ch, tone);
  }

  vline(x: number, y0: number, y1: number, ch = "│", tone: Tone = 0) {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) this.set(x, y, ch, tone);
  }

  box(x: number, y: number, w: number, h: number, tone: Tone = 0, rounded = false) {
    const [tl, tr, bl, br] = rounded ? ["╭", "╮", "╰", "╯"] : ["┌", "┐", "└", "┘"];
    this.hline(x + 1, x + w - 2, y, "─", tone);
    this.hline(x + 1, x + w - 2, y + h - 1, "─", tone);
    this.vline(x, y + 1, y + h - 2, "│", tone);
    this.vline(x + w - 1, y + 1, y + h - 2, "│", tone);
    this.set(x, y, tl, tone);
    this.set(x + w - 1, y, tr, tone);
    this.set(x, y + h - 1, bl, tone);
    this.set(x + w - 1, y + h - 1, br, tone);
  }

  fill(x: number, y: number, w: number, h: number, ch: string, tone: Tone = 0) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, ch, tone);
  }

  /** Line in cell coordinates; picks a slash/bar glyph from the slope unless `ch` given. */
  line(x0: number, y0: number, x1: number, y1: number, tone: Tone = 0, ch?: string) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1) * 2;
    // slope in physical space decides the glyph
    const px = dx * CELL_W;
    const py = dy * CELL_H;
    const ang = Math.atan2(py, px);
    const a = ((ang % Math.PI) + Math.PI) % Math.PI;
    const glyph =
      ch ??
      (a < Math.PI / 8 || a > (7 * Math.PI) / 8
        ? "─"
        : a < (3 * Math.PI) / 8
          ? "\\"
          : a < (5 * Math.PI) / 8
            ? "│"
            : "/");
    for (let i = 0; i <= steps; i++) {
      const s = i / steps;
      this.set(x0 + dx * s, y0 + dy * s, glyph, tone);
    }
  }

  /** Copy another grid in, skipping spaces. */
  blit(src: Grid, x: number, y: number, toneOverride?: Tone) {
    for (let j = 0; j < src.h; j++)
      for (let i = 0; i < src.w; i++) {
        const ch = src.c[j * src.w + i];
        if (ch !== " ") this.set(x + i, y + j, ch, toneOverride ?? (src.t[j * src.w + i] as Tone));
      }
  }

  rows(): Segment[][] {
    const out: Segment[][] = [];
    for (let y = 0; y < this.h; y++) {
      const row: Segment[] = [];
      let cur: Segment | null = null;
      for (let x = 0; x < this.w; x++) {
        const i = y * this.w + x;
        const ch = this.c[i];
        // spaces carry no visible tone; merge them into the current run
        const tone = (ch === " " && cur ? cur.t : this.t[i]) as Tone;
        if (cur && cur.t === tone) cur.s += ch;
        else {
          cur = { s: ch, t: tone };
          row.push(cur);
        }
      }
      out.push(row);
    }
    return out;
  }
}
