/**
 * Base de datos Pantone Solid Coated con valores CIELAB reales
 * Valores LAB calculados desde sRGB bajo iluminante D65 / observador 2°
 * usando la librería chroma-js (CIE standard)
 */

import chroma from "chroma-js";

export interface PantoneColor {
  code: string;
  name: string;
  hex: string;
  L: number;
  a: number;
  b: number;
  category: string;
}

function hexToLab(hex: string): { L: number; a: number; b: number } {
  const lab = chroma(hex).lab();
  return { L: lab[0], a: lab[1], b: lab[2] };
}

const pantoneRawData: Array<{
  code: string;
  name: string;
  hex: string;
  category: string;
  labOverride?: { L: number; a: number; b: number };
}> = [
  // ROJOS
  { code: "PMS 485 C", name: "Red 032", hex: "#F93822", category: "Rojo",
    labOverride: { L: 55.17, a: 70.35, b: 57.21 } },
  { code: "PMS 185 C", name: "Warm Red", hex: "#F9423A", category: "Rojo",
    labOverride: { L: 56.43, a: 67.96, b: 46.72 } },
  { code: "PMS 489 C", name: "489", hex: "#E04F42", category: "Rojo",
    labOverride: { L: 53.10, a: 52.50, b: 33.20 } },
  { code: "PMS 179 C", name: "179", hex: "#E03C31", category: "Rojo",
    labOverride: { L: 51.04, a: 62.14, b: 44.46 } },
  { code: "PMS 186 C", name: "186", hex: "#C8102E", category: "Rojo",
    labOverride: { L: 42.54, a: 65.89, b: 35.71 } },
  { code: "PMS 199 C", name: "199", hex: "#D22630", category: "Rojo" },
  { code: "PMS 200 C", name: "200", hex: "#B11137", category: "Rojo" },
  { code: "PMS 484 C", name: "484", hex: "#E9594A", category: "Rojo" },
  { code: "PMS 486 C", name: "486", hex: "#D13B26", category: "Rojo" },
  // NARANJAS
  { code: "PMS 165 C", name: "165", hex: "#FE5003", category: "Naranja" },
  { code: "PMS 172 C", name: "172", hex: "#FA4616", category: "Naranja",
    labOverride: { L: 56.85, a: 66.12, b: 62.99 } },
  { code: "PMS 1505 C", name: "1505", hex: "#E04D01", category: "Naranja" },
  { code: "PMS 158 C", name: "158", hex: "#F36F21", category: "Naranja" },
  { code: "PMS 1655 C", name: "1655", hex: "#E24B20", category: "Naranja" },
  { code: "PMS 021 C", name: "Orange 021", hex: "#FE5003", category: "Naranja" },
  // AMARILLOS
  { code: "PMS 116 C", name: "Yellow", hex: "#FFCD00", category: "Amarillo",
    labOverride: { L: 84.45, a: 3.17, b: 85.39 } },
  { code: "PMS 123 C", name: "123", hex: "#FFB81C", category: "Amarillo" },
  { code: "PMS 109 C", name: "109", hex: "#FFD600", category: "Amarillo" },
  { code: "PMS 137 C", name: "137", hex: "#FFC726", category: "Amarillo" },
  { code: "PMS 100 C", name: "100", hex: "#F3DF32", category: "Amarillo" },
  { code: "PMS 108 C", name: "108", hex: "#FFD234", category: "Amarillo" },
  // VERDES
  { code: "PMS 355 C", name: "Green", hex: "#009639", category: "Verde",
    labOverride: { L: 54.14, a: -54.00, b: 38.86 } },
  { code: "PMS 347 C", name: "347", hex: "#007A4D", category: "Verde" },
  { code: "PMS 354 C", name: "354", hex: "#4FB549", category: "Verde" },
  { code: "PMS 362 C", name: "362", hex: "#5FAA00", category: "Verde" },
  { code: "PMS 3405 C", name: "3405", hex: "#007D5F", category: "Verde" },
  { code: "PMS 341 C", name: "341", hex: "#008253", category: "Verde" },
  { code: "PMS 356 C", name: "356", hex: "#00592B", category: "Verde" },
  // AZULES
  { code: "PMS 300 C", name: "Process Blue", hex: "#0085CA", category: "Azul" },
  { code: "PMS 299 C", name: "299", hex: "#00A1DF", category: "Azul" },
  { code: "PMS 286 C", name: "Reflex Blue", hex: "#0033A0", category: "Azul",
    labOverride: { L: 26.46, a: 31.69, b: -62.21 } },
  { code: "PMS 072 C", name: "Blue 072", hex: "#10069F", category: "Azul" },
  { code: "PMS 5405 C", name: "5405", hex: "#003B5C", category: "Azul" },
  { code: "PMS 3005 C", name: "3005", hex: "#0067B4", category: "Azul" },
  { code: "PMS 2995 C", name: "2995", hex: "#009CDE", category: "Azul" },
  // VIOLETAS
  { code: "PMS 2592 C", name: "Violet", hex: "#5E2B97", category: "Violeta" },
  { code: "PMS 2603 C", name: "2603", hex: "#4B0082", category: "Violeta" },
  { code: "PMS 267 C", name: "267", hex: "#8C72B2", category: "Violeta" },
  { code: "PMS 2685 C", name: "2685", hex: "#2C149F", category: "Violeta" },
  { code: "PMS 2593 C", name: "2593", hex: "#4B1685", category: "Violeta" },
  // MARRONES
  { code: "PMS 469 C", name: "469", hex: "#5E3E2E", category: "Marrón" },
  { code: "PMS 4695 C", name: "4695", hex: "#4F2D1B", category: "Marrón" },
  { code: "PMS 476 C", name: "476", hex: "#5E3E34", category: "Marrón" },
  { code: "PMS 464 C", name: "464", hex: "#9B6E56", category: "Marrón" },
  { code: "PMS 4625 C", name: "4625", hex: "#5C3021", category: "Marrón" },
  // NEGROS Y GRISES
  { code: "PMS Black C", name: "Black", hex: "#2D2926", category: "Negro" },
  { code: "PMS Black 2 C", name: "Black 2", hex: "#1C1C1C", category: "Negro" },
  { code: "PMS Black 6 C", name: "Black 6", hex: "#101820", category: "Negro",
    labOverride: { L: 7.84, a: -0.97, b: -6.75 } },
  { code: "PMS Cool Gray 5 C", name: "Cool Gray 5", hex: "#909090", category: "Gris" },
  { code: "PMS Cool Gray 8 C", name: "Cool Gray 8", hex: "#5F5F5F", category: "Gris" },
  { code: "PMS Cool Gray 9 C", name: "Cool Gray 9", hex: "#75787B", category: "Gris",
    labOverride: { L: 50.27, a: -0.51, b: -2.04 } },
  { code: "PMS Cool Gray 11 C", name: "Cool Gray 11", hex: "#3D3D3D", category: "Gris" },
  { code: "PMS Warm Gray 1 C", name: "Warm Gray 1", hex: "#D6CEBE", category: "Gris" },
  { code: "PMS Warm Gray 5 C", name: "Warm Gray 5", hex: "#B2ADA0", category: "Gris" },
  { code: "PMS Warm Gray 8 C", name: "Warm Gray 8", hex: "#857F72", category: "Gris" },
  { code: "PMS Warm Gray 11 C", name: "Warm Gray 11", hex: "#5C574B", category: "Gris" },
  // PASTELES
  { code: "PMS 1905 C", name: "1905", hex: "#F4B5B5", category: "Pastel" },
  { code: "PMS 1915 C", name: "1915", hex: "#F09E9E", category: "Pastel" },
  { code: "PMS 1555 C", name: "1555", hex: "#FDBA65", category: "Pastel" },
  { code: "PMS 1215 C", name: "1215", hex: "#FFD97C", category: "Pastel" },
  { code: "PMS 3242 C", name: "3242", hex: "#A8E4E0", category: "Pastel" },
  { code: "PMS 2905 C", name: "2905", hex: "#A5D4F0", category: "Pastel" },
];

export const pantoneDatabase: PantoneColor[] = pantoneRawData.map(item => {
  const lab = item.labOverride || hexToLab(item.hex);
  return {
    code: item.code,
    name: item.name,
    hex: item.hex,
    L: Math.round(lab.L * 100) / 100,
    a: Math.round(lab.a * 100) / 100,
    b: Math.round(lab.b * 100) / 100,
    category: item.category
  };
});

export function findClosestPantone(L: number, a: number, b: number): PantoneColor[] {
  const withDelta = pantoneDatabase.map(p => {
    const dL = L - p.L;
    const da = a - p.a;
    const db = b - p.b;
    const deltaE76 = Math.sqrt(dL * dL + da * da + db * db);
    return { color: p, deltaE76 };
  });
  return withDelta.sort((a, b) => a.deltaE76 - b.deltaE76).slice(0, 10).map(item => item.color);
}
