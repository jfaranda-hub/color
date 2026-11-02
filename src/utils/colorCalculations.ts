// Funciones de cálculo de color para formulación flexográfica
// Basado en estándares CIE y modelos de mezcla sustractiva

import { TintaBase } from "../data/tintasBase";
import { Sustrato } from "../data/sustratos";

// ============================================
// DELTA E - CIEDE2000 (Colorimetric Difference)
// ============================================

export function deltaE76(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
  return Math.sqrt(
    Math.pow(L1 - L2, 2) +
    Math.pow(a1 - a2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

export function deltaE2000(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
  // CIEDE2000 - Fórmula completa
  const kL = 1, kC = 1, kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;
  const Cab7 = Math.pow(Cab, 7);
  const G = 0.5 * (1 - Math.sqrt(Cab7 / (Cab7 + Math.pow(25, 7))));

  const ap1 = a1 * (1 + G);
  const ap2 = a2 * (1 + G);

  const Cp1 = Math.sqrt(ap1 * ap1 + b1 * b1);
  const Cp2 = Math.sqrt(ap2 * ap2 + b2 * b2);

  let hp1 = Math.atan2(b1, ap1) * 180 / Math.PI;
  if (hp1 < 0) hp1 += 360;
  let hp2 = Math.atan2(b2, ap2) * 180 / Math.PI;
  if (hp2 < 0) hp2 += 360;

  const dLp = L2 - L1;
  const dCp = Cp2 - Cp1;

  let dhp: number;
  if (Cp1 * Cp2 === 0) {
    dhp = 0;
  } else if (Math.abs(hp2 - hp1) <= 180) {
    dhp = hp2 - hp1;
  } else if (hp2 - hp1 > 180) {
    dhp = hp2 - hp1 - 360;
  } else {
    dhp = hp2 - hp1 + 360;
  }

  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dhp * Math.PI / 360);

  const Lp = (L1 + L2) / 2;
  const Cp = (Cp1 + Cp2) / 2;

  let hp: number;
  if (Cp1 * Cp2 === 0) {
    hp = hp1 + hp2;
  } else if (Math.abs(hp1 - hp2) <= 180) {
    hp = (hp1 + hp2) / 2;
  } else if (hp1 + hp2 < 360) {
    hp = (hp1 + hp2 + 360) / 2;
  } else {
    hp = (hp1 + hp2 - 360) / 2;
  }

  const T = 1
    - 0.17 * Math.cos((hp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * hp * Math.PI / 180)
    + 0.32 * Math.cos((3 * hp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * hp - 63) * Math.PI / 180);

  const SL = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;

  const Cp7 = Math.pow(Cp, 7);
  const RT = -2 * Math.sqrt(Cp7 / (Cp7 + Math.pow(25, 7)))
    * Math.sin(60 * Math.exp(-Math.pow((hp - 275) / 25, 2)) * Math.PI / 180);

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

// ============================================
// EVALUACIÓN DE DELTA E
// ============================================

export function evaluateDeltaE(deltaE: number): {
  rating: string;
  color: string;
  description: string;
} {
  if (deltaE <= 0.5) {
    return { rating: "Excelente", color: "#10B981", description: "Diferencia imperceptible" };
  } else if (deltaE <= 1.0) {
    return { rating: "Muy Bueno", color: "#22C55E", description: "Diferencia apenas perceptible" };
  } else if (deltaE <= 2.0) {
    return { rating: "Bueno", color: "#84CC16", description: "Aceptable para la mayoría de trabajos" };
  } else if (deltaE <= 3.5) {
    return { rating: "Aceptable", color: "#EAB308", description: "Diferencia notable pero tolerable" };
  } else if (deltaE <= 5.0) {
    return { rating: "Marginal", color: "#F97316", description: "Requiere ajuste" };
  } else {
    return { rating: "Rechazado", color: "#EF4444", description: "Diferencia excesiva, reformular" };
  }
}

// ============================================
// FORMULACIÓN DE COLOR - Modelo de mezcla sustractiva
// ============================================

export interface FormulacionInsumo {
  tintaId: string;
  tintaName: string;
  gramos: number;
  porcentaje: number;
}

export interface Formulacion {
  insumos: FormulacionInsumo[];
  totalGramos: number;
  labEstimado: { L: number; a: number; b: number };
  deltaE: number;
  sustratoId: string;
}

// Calcula el LAB resultante de una mezcla de tintas
// Usa modelo de mezcla ponderada con corrección por sustrato
export function calcularLABMezcla(
  insumos: FormulacionInsumo[],
  tintas: TintaBase[],
  sustrato: Sustrato
): { L: number; a: number; b: number } {
  let totalWeight = 0;
  let sumL = 0, sumA = 0, sumB = 0;

  for (const insumo of insumos) {
    const tinta = tintas.find(t => t.id === insumo.tintaId);
    if (!tinta) continue;

    const weight = insumo.gramos;
    totalWeight += weight;

    // Contribución de cada tinta basada en su fuerza tintórea y concentración
    const strength = tinta.tintingStrength;
    const concentration = insumo.gramos / 100; // Normalizado

    // Modelo Kubelka-Munk simplificado para mezcla sustractiva
    // La contribución es proporcional a la concentración y fuerza tintórea
    const factor = weight * strength * (1 + concentration * 0.5);

    sumL += tinta.lab.L * factor;
    sumA += tinta.lab.a * factor;
    sumB += tinta.lab.b * factor;
  }

  if (totalWeight === 0) return { L: 0, a: 0, b: 0 };

  // Promedio ponderado
  let L = sumL / totalWeight;
  let a = sumA / totalWeight;
  let b = sumB / totalWeight;

  // Aplicar corrección por sustrato
  // El sustrato influye más cuando la tinta es más transparente
  const avgOpacity = insumos.reduce((sum, inp) => {
    const tinta = tintas.find(t => t.id === inp.tintaId);
    return sum + (tinta?.opacity || 0) * inp.gramos;
  }, 0) / totalWeight;

  // Factor de influencia del sustrato (menos opaco = más influencia del sustrato)
  const substrateInfluence = (1 - avgOpacity) * (1 - sustrato.opacity);

  // Mezcla con el punto blanco del sustrato
  const substrateWeight = substrateInfluence * 0.3;
  L = L * (1 - substrateWeight) + sustrato.whitePoint.L * substrateWeight;
  a = a * (1 - substrateWeight) + sustrato.whitePoint.a * substrateWeight;
  b = b * (1 - substrateWeight) + sustrato.whitePoint.b * substrateWeight;

  // Aplicar correcciones del sustrato
  L += sustrato.correctionFactors.dL * substrateInfluence;
  a += sustrato.correctionFactors.da * substrateInfluence;
  b += sustrato.correctionFactors.db * substrateInfluence;

  // Factor de absorción de tinta del sustrato
  const absorptionFactor = 1 - (sustrato.inkAbsorption * 0.15);
  L *= absorptionFactor;

  return { L, a, b };
}

// ============================================
// ALGORITMO DE FORMULACIÓN AUTOMÁTICA
// ============================================

export function formularColor(
  targetL: number, targetA: number, targetB: number,
  tintas: TintaBase[],
  sustrato: Sustrato,
  totalGramos: number = 100
): Formulacion {
  // Algoritmo iterativo de búsqueda de formulación
  // Basado en optimización por gradiente descendente simplificado

  // Seleccionar tintas relevantes basado en el color objetivo
  const tintasRelevantes = seleccionarTintasRelevantes(targetL, targetA, targetB, tintas);

  // Inicializar proporciones
  let insumos: FormulacionInsumo[] = tintasRelevantes.map(t => ({
    tintaId: t.id,
    tintaName: t.name,
    gramos: totalGramos / tintasRelevantes.length,
    porcentaje: 100 / tintasRelevantes.length
  }));

  // Iterar para optimizar
  const learningRate = 0.02;
  const maxIterations = 500;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentLAB = calcularLABMezcla(insumos, tintas, sustrato);
    const currentDeltaE = deltaE2000(currentLAB.L, currentLAB.a, currentLAB.b, targetL, targetA, targetB);

    if (currentDeltaE < 0.3) break; // Suficientemente cerca

    // Calcular gradientes aproximados
    for (let i = 0; i < insumos.length; i++) {
      const delta = totalGramos * 0.01; // 1% de variación

      // Probar variación positiva
      const testInsumos = [...insumos];
      testInsumos[i] = { ...testInsumos[i], gramos: testInsumos[i].gramos + delta };
      const testLAB = calcularLABMezcla(testInsumos, tintas, sustrato);
      const testDeltaE = deltaE2000(testLAB.L, testLAB.a, testLAB.b, targetL, targetA, targetB);

      // Probar variación negativa
      const testInsumos2 = [...insumos];
      testInsumos2[i] = { ...testInsumos2[i], gramos: Math.max(0.1, testInsumos2[i].gramos - delta) };
      const testLAB2 = calcularLABMezcla(testInsumos2, tintas, sustrato);
      const testDeltaE2 = deltaE2000(testLAB2.L, testLAB2.a, testLAB2.b, targetL, targetA, targetB);

      // Actualizar basado en el mejor resultado
      if (testDeltaE < currentDeltaE) {
        insumos[i] = { ...insumos[i], gramos: insumos[i].gramos + delta * learningRate * 10 };
      } else if (testDeltaE2 < currentDeltaE) {
        insumos[i] = { ...insumos[i], gramos: Math.max(0.1, insumos[i].gramos - delta * learningRate * 10) };
      }
    }

    // Normalizar a totalGramos
    const total = insumos.reduce((s, inp) => s + inp.gramos, 0);
    insumos = insumos.map(inp => ({
      ...inp,
      gramos: (inp.gramos / total) * totalGramos
    }));
  }

  // Calcular porcentajes finales
  const total = insumos.reduce((s, inp) => s + inp.gramos, 0);
  insumos = insumos.map(inp => ({
    ...inp,
    gramos: Math.round(inp.gramos * 100) / 100,
    porcentaje: Math.round((inp.gramos / total) * 10000) / 100
  }));

  // Eliminar tintas con porcentaje insignificante
  insumos = insumos.filter(inp => inp.porcentaje >= 0.5);

  // Recalcular porcentajes
  const finalTotal = insumos.reduce((s, inp) => s + inp.gramos, 0);
  insumos = insumos.map(inp => ({
    ...inp,
    porcentaje: Math.round((inp.gramos / finalTotal) * 10000) / 100
  }));

  const labEstimado = calcularLABMezcla(insumos, tintas, sustrato);
  const deltaE = deltaE2000(labEstimado.L, labEstimado.a, labEstimado.b, targetL, targetA, targetB);

  return {
    insumos,
    totalGramos: Math.round(finalTotal * 100) / 100,
    labEstimado,
    deltaE: Math.round(deltaE * 100) / 100,
    sustratoId: sustrato.id
  };
}

// Selecciona las tintas más relevantes para un color objetivo
function seleccionarTintasRelevantes(L: number, a: number, b: number, tintas: TintaBase[]): TintaBase[] {
  const relevantes: TintaBase[] = [];

  // Siempre incluir base transparente o blanco según luminosidad
  if (L > 70) {
    relevantes.push(tintas.find(t => t.id === "blanco")!);
  } else {
    relevantes.push(tintas.find(t => t.id === "transparente")!);
  }

  // Seleccionar tintas cromáticas basadas en el eje a-b
  const angle = Math.atan2(b, a) * 180 / Math.PI;
  const chroma = Math.sqrt(a * a + b * b);

  if (chroma < 15) {
    // Color muy neutro - usar negro + blanco
    relevantes.push(tintas.find(t => t.id === "negro")!);
    if (L > 50) relevantes.push(tintas.find(t => t.id === "blanco")!);
  } else {
    // Seleccionar por posición en el círculo cromático
    if (angle >= -30 && angle < 30) {
      relevantes.push(tintas.find(t => t.id === "rojo-amarillento")!);
      if (b > 30) relevantes.push(tintas.find(t => t.id === "amarillo")!);
      if (b > 50) relevantes.push(tintas.find(t => t.id === "naranja")!);
    } else if (angle >= 30 && angle < 80) {
      relevantes.push(tintas.find(t => t.id === "naranja")!);
      relevantes.push(tintas.find(t => t.id === "amarillo")!);
    } else if (angle >= 80 && angle < 120) {
      relevantes.push(tintas.find(t => t.id === "amarillo")!);
      if (a < -5) relevantes.push(tintas.find(t => t.id === "amarillo-verdoso")!);
    } else if (angle >= 120 && angle < 170) {
      relevantes.push(tintas.find(t => t.id === "verde")!);
      relevantes.push(tintas.find(t => t.id === "amarillo-verdoso")!);
    } else if (angle >= 170 || angle < -170) {
      relevantes.push(tintas.find(t => t.id === "verde")!);
      relevantes.push(tintas.find(t => t.id === "azul-verdoso")!);
    } else if (angle >= -170 && angle < -120) {
      relevantes.push(tintas.find(t => t.id === "azul-verdoso")!);
      relevantes.push(tintas.find(t => t.id === "azul")!);
    } else if (angle >= -120 && angle < -60) {
      relevantes.push(tintas.find(t => t.id === "azul")!);
      if (b < -40) relevantes.push(tintas.find(t => t.id === "violeta")!);
    } else if (angle >= -60 && angle < -30) {
      relevantes.push(tintas.find(t => t.id === "violeta")!);
      relevantes.push(tintas.find(t => t.id === "magenta")!);
    } else {
      relevantes.push(tintas.find(t => t.id === "rojo")!);
      relevantes.push(tintas.find(t => t.id === "magenta")!);
    }

    // Añadir negro si la luminosidad es baja
    if (L < 40) {
      relevantes.push(tintas.find(t => t.id === "negro")!);
    }
  }

  // Asegurar que no hay duplicados y que todas existen
  const uniqueIds = [...new Set(relevantes.map(t => t.id))];
  return uniqueIds.map(id => tintas.find(t => t.id === id)!).filter(Boolean);
}

// ============================================
// ESCALADO DE PRODUCCIÓN
// ============================================

export function escalarFormulacion(
  formulacion: Formulacion,
  gramosObjetivo: number
): Formulacion {
  const factor = gramosObjetivo / formulacion.totalGramos;

  const insumos = formulacion.insumos.map(inp => ({
    ...inp,
    gramos: Math.round(inp.gramos * factor * 100) / 100
  }));

  return {
    ...formulacion,
    insumos,
    totalGramos: Math.round(gramosObjetivo * 100) / 100
  };
}

// ============================================
// AJUSTE MANUAL DE FORMULACIÓN
// ============================================

export function ajustarFormulacion(
  formulacion: Formulacion,
  ajustes: { [tintaId: string]: number }, // gramos de ajuste (+/-)
  tintas: TintaBase[],
  sustrato: Sustrato
): Formulacion {
  const insumos = formulacion.insumos.map(inp => {
    const ajuste = ajustes[inp.tintaId] || 0;
    return {
      ...inp,
      gramos: Math.max(0, Math.round((inp.gramos + ajuste) * 100) / 100)
    };
  }).filter(inp => inp.gramos > 0);

  const total = insumos.reduce((s, inp) => s + inp.gramos, 0);
  const insumosFinal = insumos.map(inp => ({
    ...inp,
    porcentaje: Math.round((inp.gramos / total) * 10000) / 100
  }));

  const labEstimado = calcularLABMezcla(insumosFinal, tintas, sustrato);
  const deltaE = deltaE2000(labEstimado.L, labEstimado.a, labEstimado.b,
    formulacion.labEstimado.L, formulacion.labEstimado.a, formulacion.labEstimado.b);

  return {
    ...formulacion,
    insumos: insumosFinal,
    totalGramos: Math.round(total * 100) / 100,
    labEstimado,
    deltaE: Math.round(deltaE * 100) / 100
  };
}

// ============================================
// CONVERSIÓN LAB A RGB (para visualización)
// ============================================

export function labToRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  // LAB -> XYZ (D50)
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const delta = 6 / 29;
  const x = fx > delta ? fx * fx * fx : 3 * delta * delta * (fx - 4 / 29);
  const y = fy > delta ? fy * fy * fy : 3 * delta * delta * (fy - 4 / 29);
  const z = fz > delta ? fz * fz * fz : 3 * delta * delta * (fz - 4 / 29);

  // XYZ D50 -> XYZ D65
  const X = x * 0.9642;
  const Y = y * 1.0000;
  const Z = z * 0.8251;

  // XYZ -> RGB (sRGB)
  let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
  let bVal = X * 0.0557 + Y * -0.2040 + Z * 1.0570;

  // Gamma correction
  const gamma = (c: number) => c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;

  r = Math.max(0, Math.min(255, Math.round(gamma(r) * 255)));
  g = Math.max(0, Math.min(255, Math.round(gamma(g) * 255)));
  bVal = Math.max(0, Math.min(255, Math.round(gamma(bVal) * 255)));

  return { r, g, b: bVal };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function labToHex(L: number, a: number, b: number): string {
  const rgb = labToRgb(L, a, b);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
