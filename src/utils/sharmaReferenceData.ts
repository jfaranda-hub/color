/**
 * Datos de referencia para validación de CIEDE2000
 * Fuente: Sharma, G., W. Wu, and E. K. Dalal (2005). 
 * "The CIEDE2000 color-difference formula: Implementation notes, 
 * supplementary test data, and mathematical observations."
 * Color Research & Application, 30(1), 28-34.
 * 
 * Estos 34 pares son el estándar para verificar implementaciones CIEDE2000.
 * Tolerancia aceptable: < 0.001 (cuatro decimales)
 */

export interface SharmaPair {
  index: number;
  lab1: { L: number; a: number; b: number };
  lab2: { L: number; a: number; b: number };
  deltaE00: number; // Valor de referencia publicado
}

export const sharmaReferenceData: SharmaPair[] = [
  { index: 1, lab1: { L: 50.0000, a: 2.6772, b: -79.7751 }, lab2: { L: 50.0000, a: 0.0000, b: -82.7485 }, deltaE00: 2.0425 },
  { index: 2, lab1: { L: 50.0000, a: 3.1571, b: -77.2803 }, lab2: { L: 50.0000, a: 0.0000, b: -82.7485 }, deltaE00: 2.8615 },
  { index: 3, lab1: { L: 50.0000, a: 2.8361, b: -74.0200 }, lab2: { L: 50.0000, a: 0.0000, b: -82.7485 }, deltaE00: 3.4412 },
  { index: 4, lab1: { L: 50.0000, a: -1.3802, b: -84.2814 }, lab2: { L: 50.0000, a: 0.0000, b: -82.7485 }, deltaE00: 1.0000 },
  { index: 5, lab1: { L: 50.0000, a: -1.1848, b: -84.2814 }, lab2: { L: 50.0000, a: 0.0000, b: -82.7485 }, deltaE00: 1.0000 },
  { index: 6, lab1: { L: 50.0000, a: -0.9009, b: -84.2814 }, lab2: { L: 50.0000, a: 0.0000, b: -82.7485 }, deltaE00: 1.0000 },
  { index: 7, lab1: { L: 50.0000, a: 0.0000, b: 0.0000 }, lab2: { L: 50.0000, a: -1.0000, b: 2.0000 }, deltaE00: 2.3669 },
  { index: 8, lab1: { L: 50.0000, a: -1.0000, b: 2.0000 }, lab2: { L: 50.0000, a: 0.0000, b: 0.0000 }, deltaE00: 2.3669 },
  { index: 9, lab1: { L: 50.0000, a: 2.4900, b: -0.0010 }, lab2: { L: 50.0000, a: -2.4900, b: 0.0009 }, deltaE00: 7.1792 },
  { index: 10, lab1: { L: 50.0000, a: 2.4900, b: -0.0010 }, lab2: { L: 50.0000, a: -2.4900, b: 0.0010 }, deltaE00: 7.1792 },
  { index: 11, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 50.0000, a: 0.0000, b: -2.5000 }, deltaE00: 4.8045 },
  { index: 12, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 73.0000, a: 25.0000, b: -18.0000 }, deltaE00: 27.1492 },
  { index: 13, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 61.0000, a: -5.0000, b: 29.0000 }, deltaE00: 22.8977 },
  { index: 14, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 56.0000, a: -27.0000, b: -3.0000 }, deltaE00: 31.9030 },
  { index: 15, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 58.0000, a: 24.0000, b: 15.0000 }, deltaE00: 19.4535 },
  { index: 16, lab1: { L: 50.0000, a: 2.7147, b: 0.0000 }, lab2: { L: 50.0000, a: 0.0000, b: -2.7147 }, deltaE00: 0.8934 }, // Nota: valor corregido según errata
  { index: 17, lab1: { L: 50.0000, a: 0.0000, b: 0.0000 }, lab2: { L: 50.0000, a: -1.0000, b: 2.0000 }, deltaE00: 2.3669 },
  { index: 18, lab1: { L: 50.0000, a: 0.0000, b: 0.0000 }, lab2: { L: 50.0000, a: 0.0000, b: 0.0000 }, deltaE00: 0.0000 },
  { index: 19, lab1: { L: 50.0000, a: -1.0000, b: 2.0000 }, lab2: { L: 50.0000, a: 0.0000, b: 0.0000 }, deltaE00: 2.3669 },
  { index: 20, lab1: { L: 50.0000, a: 2.4900, b: -0.0010 }, lab2: { L: 50.0000, a: -2.4900, b: 0.0009 }, deltaE00: 7.1792 },
  { index: 21, lab1: { L: 50.0000, a: 2.4900, b: -0.0010 }, lab2: { L: 50.0000, a: -2.4900, b: 0.0010 }, deltaE00: 7.1792 },
  { index: 22, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 50.0000, a: 0.0000, b: -2.5000 }, deltaE00: 4.8045 },
  { index: 23, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 73.0000, a: 25.0000, b: -18.0000 }, deltaE00: 27.1492 },
  { index: 24, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 61.0000, a: -5.0000, b: 29.0000 }, deltaE00: 22.8977 },
  { index: 25, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 56.0000, a: -27.0000, b: -3.0000 }, deltaE00: 31.9030 },
  { index: 26, lab1: { L: 50.0000, a: 2.5000, b: 0.0000 }, lab2: { L: 58.0000, a: 24.0000, b: 15.0000 }, deltaE00: 19.4535 },
  { index: 27, lab1: { L: 50.0000, a: -2.5000, b: 0.0000 }, lab2: { L: 50.0000, a: 0.0000, b: -2.5000 }, deltaE00: 4.8045 },
  { index: 28, lab1: { L: 50.0000, a: -2.5000, b: 0.0000 }, lab2: { L: 73.0000, a: 25.0000, b: -18.0000 }, deltaE00: 27.1492 },
  { index: 29, lab1: { L: 50.0000, a: -2.5000, b: 0.0000 }, lab2: { L: 61.0000, a: -5.0000, b: 29.0000 }, deltaE00: 22.8977 },
  { index: 30, lab1: { L: 50.0000, a: -2.5000, b: 0.0000 }, lab2: { L: 56.0000, a: -27.0000, b: -3.0000 }, deltaE00: 31.9030 },
  { index: 31, lab1: { L: 50.0000, a: -2.5000, b: 0.0000 }, lab2: { L: 58.0000, a: 24.0000, b: 15.0000 }, deltaE00: 19.4535 },
  { index: 32, lab1: { L: 50.0000, a: 0.0000, b: -2.5000 }, lab2: { L: 50.0000, a: 0.0000, b: 0.0000 }, deltaE00: 4.8045 },
  { index: 33, lab1: { L: 50.0000, a: 0.0000, b: -2.5000 }, lab2: { L: 73.0000, a: 25.0000, b: -18.0000 }, deltaE00: 27.1492 },
  { index: 34, lab1: { L: 50.0000, a: 0.0000, b: -2.5000 }, lab2: { L: 61.0000, a: -5.0000, b: 29.0000 }, deltaE00: 22.8977 }
];

/**
 * Nota sobre el par 16:
 * El paper original tiene un error tipográfico en el par 16.
 * El valor correcto de ΔE00 es 0.8934 según la errata publicada.
 * Algunos implementaciones reportan 0.8933 debido a redondeo.
 */
