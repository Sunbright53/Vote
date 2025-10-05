

// src/utils/colors.ts
// แฮชสตริงให้เป็นตัวเลขคงที่ (FNV-1a)
export function hash32(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// สร้างสีจากชื่อ (HSL) ที่อ่านง่ายและสด
export function colorForName(
  name: string,
  opts: { alpha?: number; sat?: number; light?: number } = {}
) {
  const { alpha = 0.95, sat = 70, light = 52 } = opts;
  const h = hash32(name) % 360; // hue คงที่ตามชื่อ
  return `hsl(${h} ${sat}% ${light}% / ${alpha})`;
}

// ทำพาเลตสำหรับ labels ทั้งหมด (bg/hover/border)
export function paletteFor(labels: string[]) {
  const bg = labels.map((n) => colorForName(n, { alpha: 0.95, sat: 72, light: 52 }));
  const hover = labels.map((n) => colorForName(n, { alpha: 1, sat: 75, light: 48 }));
  const border = labels.map((n) => colorForName(n, { alpha: 1, sat: 72, light: 35 }));
  return { bg, hover, border };
}
