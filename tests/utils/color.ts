/**
 * Minimal color math for test-time WCAG contrast checks — hex and OKLCH only
 * (the two formats used by tokens/colors.ts). Not part of the public API;
 * kept test-local rather than adding a runtime dependency just to verify
 * contrast in CI.
 */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const parts: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    parts[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16) / 255;
  }
  return parts;
}

function oklchToRgb(l: number, c: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const ll = l_ ** 3;
  const mm = m_ ** 3;
  const ss = s_ ** 3;
  const r = 4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss;
  const g = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss;
  const bl = -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss;
  const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055);
  return [r, g, bl].map((v) => Math.min(1, Math.max(0, gamma(v)))) as [number, number, number];
}

/** Parses a `#rrggbb` hex string or an `oklch(L C H)` string into linear-adjacent sRGB [0,1]. */
export function parseColor(value: string): [number, number, number] {
  const trimmed = value.trim();
  if (trimmed.startsWith('#')) return hexToRgb(trimmed);
  const match = trimmed.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/i);
  if (!match) throw new Error(`Unsupported color for contrast test: "${value}"`);
  const [, l, c, h] = match;
  return oklchToRgb(Number(l), Number(c), Number(h));
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors (any order), each a hex or oklch string. */
export function contrastRatio(a: string, b: string): number {
  const sorted = [relativeLuminance(parseColor(a)), relativeLuminance(parseColor(b))].sort(
    (x, y) => y - x,
  );
  const [lumA, lumB] = sorted as [number, number];
  return (lumA + 0.05) / (lumB + 0.05);
}
