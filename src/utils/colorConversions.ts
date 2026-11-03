/**
 * Conversiones avanzadas entre espacios de color
 * 
 * Implementa conversiones entre:
 * - RGB ↔ CMYK
 * - RGB ↔ HSL
 * - RGB ↔ HSV
 * 
 * Todas las conversiones asumen espacio sRGB y punto blanco D65
 */

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface CMYK {
  c: number; // 0-100%
  m: number; // 0-100%
  y: number; // 0-100%
  k: number; // 0-100%
}

export interface HSL {
  h: number; // 0-360°
  s: number; // 0-100%
  l: number; // 0-100%
}

export interface HSV {
  h: number; // 0-360°
  s: number; // 0-100%
  v: number; // 0-100%
}

/**
 * Convierte RGB a CMYK
 * Fórmula estándar de conversión
 */
export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

/**
 * Convierte CMYK a RGB
 * Fórmula estándar de conversión
 */
export function cmykToRgb(cmyk: CMYK): RGB {
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
}

/**
 * Convierte RGB a HSL
 * Algoritmo estándar de conversión
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
    default:
      h = 0;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convierte HSL a RGB
 * Algoritmo estándar de conversión
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  };
}

/**
 * Convierte RGB a HSV
 * Algoritmo estándar de conversión
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h: number;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

/**
 * Convierte HSV a RGB
 * Algoritmo estándar de conversión
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number, g: number, b: number;

  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
    default:
      r = 0; g = 0; b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convierte LAB a RGB (usando chroma-js)
 */
export function labToRgb(L: number, a: number, b: number): RGB {
  // Importar chroma dinámicamente para evitar dependencias circulares
  const chroma = require("chroma-js");
  const color = chroma.lab(L, a, b);
  const rgb = color.rgb();
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

/**
 * Obtiene todos los formatos de color desde LAB
 */
export function getAllColorFormats(L: number, a: number, b: number): {
  lab: { L: number; a: number; b: number };
  rgb: RGB;
  cmyk: CMYK;
  hsl: HSL;
  hsv: HSV;
  hex: string;
} {
  const rgb = labToRgb(L, a, b);
  const cmyk = rgbToCmyk(rgb);
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  
  const chroma = require("chroma-js");
  const hex = chroma.lab(L, a, b).hex();

  return {
    lab: { L, a, b },
    rgb,
    cmyk,
    hsl,
    hsv,
    hex
  };
}
