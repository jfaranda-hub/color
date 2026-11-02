/**
 * Motor de cálculo de color para formulación flexográfica
 * 
 * Librerías utilizadas:
 * - delta-e: Implementación CIE oficial de Delta E (CIE76, CIE94, CIEDE2000)
 * - chroma-js: Conversiones entre espacios de color (LAB, RGB, XYZ, LCH)
 * 
 * Modelo de mezcla:
 * - Kubelka-Munk (single-constant): Modelo físico real para mezcla sustractiva
 *   K/S = (1-R)²/(2R) donde R es reflectancia
 *   Para mezclas: (K/S)mix = (K/S)sub + Σ ci * (K/S)i
 * 
 * Referencias:
 * - CIE Publication 15:2004 (Colorimetry)
 * - Kubelka, P. & Munk, F. (1931). "Ein Beitrag zur Optik der Farbanstriche"
 * - Shore, A.R. (1996). "The Kubelka-Munk Theory"
 */

import * as DeltaE from "delta-e";
import chroma from "chroma-js";
import { TintaBase } from "../data/tintasBase";
import { Sustrato } from "../data/sustratos";

// ============================================
// TIPOS
// ============================================

export interface LABColor {
  L: number;
  a: number;
  b: number;
}

export interface FormulacionInsumo {
  tintaId: string;
  tintaName: string;
  gramos: number;
  porcentaje: number;
}

export interface Formulacion {
  insumos: FormulacionInsumo[];
  totalGramos: number;
  labEstimado: LABColor;
  deltaE: number;
  sustratoId: string;
}

// ============================================
// DELTA E - Usando librería delta-e (implementación CIE oficial)
// ============================================

/**
 * Delta E CIE76 (1976) - Distancia euclidiana en espacio LAB
 * Simple pero no perceptualmente uniforme
 */
export function getDeltaE76(lab1: LABColor, lab2: LABColor): number {
  return DeltaE.getDeltaE76(
    { L: lab1.L, A: lab1.a, B: lab1.b },
    { L: lab2.L, A: lab2.a, B: lab2.b }
  );
}

/**
 * Delta E CIE94 (1994) - Mejora con factores de ponderación
 * Usado en industria textil
 */
export function getDeltaE94(lab1: LABColor, lab2: LABColor): number {
  return DeltaE.getDeltaE94(
    { L: lab1.L, A: lab1.a, B: lab1.b },
    { L: lab2.L, A: lab2.a, B: lab2.b }
  );
}

/**
 * Delta E CIEDE2000 (2000) - Estándar actual
 * Correcciones para no-uniformidad en azules y neutros
 * Usado en control de calidad de impresión
 */
export function getDeltaE00(lab1: LABColor, lab2: LABColor): number {
  return DeltaE.getDeltaE00(
    { L: lab1.L, A: lab1.a, B: lab1.b },
    { L: lab2.L, A: lab2.a, B: lab2.b }
  );
}

// ============================================
// EVALUACIÓN DE DELTA E (según estándares industria gráfica)
// ============================================

export function evaluateDeltaE(deltaE: number): {
  rating: string;
  color: string;
  description: string;
  tolerance: string;
} {
  if (deltaE <= 0.5) {
    return {
      rating: "Excelente",
      color: "#10B981",
      description: "Diferencia imperceptible incluso con instrumentación",
      tolerance: "Dentro de tolerancia premium (ΔE ≤ 0.5)"
    };
  } else if (deltaE <= 1.0) {
    return {
      rating: "Muy Bueno",
      color: "#22C55E",
      description: "Diferencia apenas perceptible bajo condiciones controladas",
      tolerance: "Dentro de tolerancia estricta (ΔE ≤ 1.0)"
    };
  } else if (deltaE <= 2.0) {
    return {
      rating: "Bueno",
      color: "#84CC16",
      description: "Match comercial aceptable - estándar de la industria",
      tolerance: "Dentro de tolerancia comercial (ΔE ≤ 2.0)"
    };
  } else if (deltaE <= 3.5) {
    return {
      rating: "Aceptable",
      color: "#EAB308",
      description: "Diferencia notable pero tolerable en trabajos estándar",
      tolerance: "Tolerancia amplia (ΔE ≤ 3.5)"
    };
  } else if (deltaE <= 5.0) {
    return {
      rating: "Marginal",
      color: "#F97316",
      description: "Requiere ajuste - diferencia visible",
      tolerance: "Fuera de tolerancia estándar"
    };
  } else {
    return {
      rating: "Rechazado",
      color: "#EF4444",
      description: "Diferencia excesiva - reformular obligatoriamente",
      tolerance: "Fuera de toda tolerancia aceptable"
    };
  }
}

// ============================================
// CONVERSIONES DE COLOR - Usando chroma-js
// ============================================

/**
 * Convertir LAB a RGB usando chroma-js
 * chroma-js usa internamente las matrices CIE estándar
 */
export function labToRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const color = chroma.lab(L, a, b);
  const rgb = color.rgb();
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

/**
 * Convertir LAB a HEX
 */
export function labToHex(L: number, a: number, b: number): string {
  return chroma.lab(L, a, b).hex();
}

/**
 * Convertir HEX a LAB
 */
export function hexToLab(hex: string): LABColor {
  const lab = chroma(hex).lab();
  return { L: lab[0], a: lab[1], b: lab[2] };
}

/**
 * Convertir RGB a LAB
 */
export function rgbToLab(r: number, g: number, b: number): LABColor {
  const lab = chroma(r, g, b, "rgb").lab();
  return { L: lab[0], a: lab[1], b: lab[2] };
}

/**
 * Convertir LAB a LCH (Cylindrical de LAB)
 * Útil para entender matiz y croma
 */
export function labToLch(L: number, a: number, b: number): { L: number; C: number; H: number } {
  const lch = chroma.lab(L, a, b).lch();
  return { L: lch[0], C: lch[1], H: isNaN(lch[2]) ? 0 : lch[2] };
}

// ============================================
// MODELO KUBELKA-MUNK (Single-Constant)
// ============================================

/**
 * Convertir reflectancia a K/S (Kubelka-Munk forward)
 * K/S = (1-R)² / (2R)
 * 
 * @param R - Reflectancia difusa (0-1)
 * @returns K/S ratio (absorption/scattering)
 */
export function ksFromReflectance(R: number): number {
  const Rc = Math.max(0.001, Math.min(1, R)); // Clamp para evitar división por cero
  return Math.pow(1 - Rc, 2) / (2 * Rc);
}

/**
 * Convertir K/S a reflectancia (Kubelka-Munk inverse)
 * R = 1 + (K/S) - √((K/S)² + 2(K/S))
 * 
 * @param KS - Ratio K/S
 * @returns Reflectancia difusa (0-1)
 */
export function reflectanceFromKs(KS: number): number {
  const ks = Math.max(0, KS);
  return 1 + ks - Math.sqrt(ks * ks + 2 * ks);
}

/**
 * Convertir LAB a reflectancia aproximada (para Kubelka-Munk)
 * Usa la relación entre L* y reflectancia Y (CIE)
 */
export function labToReflectance(L: number): number {
  // L* = 116 * f(Y/Yn) - 16
  // Para Y/Yn > 0.008856: f(t) = t^(1/3)
  // Para Y/Yn <= 0.008856: f(t) = 7.787 * t + 16/116
  const fy = (L + 16) / 116;
  let Y: number;
  if (fy > 0.2069) {
    Y = fy * fy * fy;
  } else {
    Y = (fy - 16 / 116) / 7.787;
  }
  return Math.max(0.001, Math.min(1, Y)); // Yn = 1 para iluminante D65
}

/**
 * Convertir reflectancia a L* aproximado
 */
export function reflectanceToLab(R: number): LABColor {
  // Simplificación: usar chroma-js para la conversión completa
  // La reflectancia Y se relaciona con L* directamente
  const Y = Math.max(0.001, Math.min(1, R));
  let L: number;
  if (Y > 0.008856) {
    L = 116 * Math.pow(Y, 1 / 3) - 16;
  } else {
    L = 903.3 * Y;
  }
  return { L, a: 0, b: 0 };
}

/**
 * Estimar K/S espectral simplificado para una tinta a partir de su LAB
 * Modelo de 3 canales (RGB) para simplificar el cálculo
 */
function tintaToKs(tinta: TintaBase): { ksR: number; ksG: number; ksB: number } {
  // Convertir LAB de la tinta a reflectancia por canal
  const rgb = labToRgb(tinta.lab.L, tinta.lab.a, tinta.lab.b);
  const rReflect = rgb.r / 255;
  const gReflect = rgb.g / 255;
  const bReflect = rgb.b / 255;

  // K/S por canal (mayor absorción = mayor K/S)
  const ksR = ksFromReflectance(Math.max(0.01, rReflect)) * tinta.tintingStrength;
  const ksG = ksFromReflectance(Math.max(0.01, gReflect)) * tinta.tintingStrength;
  const ksB = ksFromReflectance(Math.max(0.01, bReflect)) * tinta.tintingStrength;

  return { ksR, ksG, ksB };
}

// ============================================
// FORMULACIÓN CON KUBELKA-MUNK
// ============================================

/**
 * Calcular LAB resultante de una mezcla usando Kubelka-Munk
 * 
 * Modelo:
 * 1. Convertir sustrato a K/S base (3 canales)
 * 2. Para cada tinta: calcular K/S por unidad de concentración
 * 3. Sumar: (K/S)mix = (K/S)sub + Σ ci * (K/S)tinta_i
 * 4. Convertir K/S resultante a reflectancia
 * 5. Aplicar corrección por sustrato (opacidad, absorción)
 * 6. Convertir reflectancia a LAB
 */
export function calcularLABMezcla(
  insumos: FormulacionInsumo[],
  tintas: TintaBase[],
  sustrato: Sustrato
): LABColor {
  // 1. K/S del sustrato (base)
  const substrateReflectance = labToReflectance(sustrato.whitePoint.L);
  const ksSubR = ksFromReflectance(Math.max(0.01, substrateReflectance * 0.95));
  const ksSubG = ksFromReflectance(Math.max(0.01, substrateReflectance * 0.98));
  const ksSubB = ksFromReflectance(Math.max(0.01, substrateReflectance * 0.92));

  // 2. Sumar contribución de cada tinta
  let totalKsR = ksSubR;
  let totalKsG = ksSubG;
  let totalKsB = ksSubB;

  const totalGramos = insumos.reduce((s, inp) => s + inp.gramos, 0);

  for (const insumo of insumos) {
    const tinta = tintas.find((t: TintaBase) => t.id === insumo.tintaId);
    if (!tinta || tinta.tintingStrength === 0) continue;

    // Concentración en fracción (0-1)
    const concentration = insumo.gramos / 100; // Porcentaje como fracción

    // K/S de la tinta por unidad de concentración
    const tintaKs = tintaToKs(tinta);

    // Contribución = concentración × K/S por unidad
    // Factor de corrección por opacidad de la tinta
    const opacityFactor = 0.5 + 0.5 * tinta.opacity;

    totalKsR += concentration * tintaKs.ksR * opacityFactor;
    totalKsG += concentration * tintaKs.ksG * opacityFactor;
    totalKsB += concentration * tintaKs.ksB * opacityFactor;
  }

  // 3. Aplicar factor de absorción del sustrato
  const absorptionFactor = 1 + sustrato.inkAbsorption * 0.3;
  totalKsR *= absorptionFactor;
  totalKsG *= absorptionFactor;
  totalKsB *= absorptionFactor;

  // 4. Convertir K/S a reflectancia
  const rReflect = reflectanceFromKs(totalKsR);
  const gReflect = reflectanceFromKs(totalKsG);
  const bReflect = reflectanceFromKs(totalKsB);

  // 5. Aplicar influencia del sustrato (mezcla con punto blanco)
  const avgOpacity = insumos.reduce((sum, inp) => {
    const tinta = tintas.find(t => t.id === inp.tintaId);
    return sum + (tinta?.opacity || 0) * inp.gramos;
  }, 0) / Math.max(1, totalGramos);

  const substrateInfluence = (1 - avgOpacity) * (1 - sustrato.opacity) * 0.4;

  // Mezcla con sustrato
  const finalR = rReflect * (1 - substrateInfluence) + substrateReflectance * substrateInfluence;
  const finalG = gReflect * (1 - substrateInfluence) + substrateReflectance * substrateInfluence * 0.98;
  const finalB = bReflect * (1 - substrateInfluence) + substrateReflectance * substrateInfluence * 0.92;

  // 6. Convertir reflectancia RGB a LAB usando chroma-js
  const r = Math.max(0, Math.min(255, Math.round(finalR * 255)));
  const g = Math.max(0, Math.min(255, Math.round(finalG * 255)));
  const b = Math.max(0, Math.min(255, Math.round(finalB * 255)));

  const lab = chroma(r, g, b, "rgb").lab();

  // 7. Aplicar correcciones del sustrato (desviaciones conocidas)
  const correctionFactor = Math.min(1, (1 - avgOpacity) + 0.3);

  return {
    L: lab[0] + sustrato.correctionFactors.dL * correctionFactor,
    a: lab[1] + sustrato.correctionFactors.da * correctionFactor,
    b: lab[2] + sustrato.correctionFactors.db * correctionFactor
  };
}

// ============================================
// ALGORITMO DE FORMULACIÓN AUTOMÁTICA
// ============================================

/**
 * Seleccionar tintas relevantes basado en el color objetivo
 * Usa análisis del espacio LCH para determinar qué tintas usar
 */
function seleccionarTintasRelevantes(L: number, a: number, b: number, tintas: TintaBase[]): TintaBase[] {
  const relevantes: TintaBase[] = [];
  const chromaVal = Math.sqrt(a * a + b * b);
  const hue = Math.atan2(b, a) * 180 / Math.PI;

  // Base: transparente o blanco según luminosidad
  if (L > 65) {
    relevantes.push(tintas.find(t => t.id === "blanco")!);
  } else {
    relevantes.push(tintas.find(t => t.id === "transparente")!);
  }

  if (chromaVal < 10) {
    // Color neutro
    relevantes.push(tintas.find(t => t.id === "negro")!);
    if (L > 50) relevantes.push(tintas.find(t => t.id === "blanco")!);
  } else {
    // Seleccionar por hue (ángulo en espacio a-b)
    if (hue >= -20 && hue < 30) {
      relevantes.push(tintas.find(t => t.id === "rojo-amarillento")!);
      if (b > 40) relevantes.push(tintas.find(t => t.id === "amarillo")!);
      if (b > 50) relevantes.push(tintas.find(t => t.id === "naranja")!);
    } else if (hue >= 30 && hue < 70) {
      relevantes.push(tintas.find(t => t.id === "naranja")!);
      relevantes.push(tintas.find(t => t.id === "amarillo")!);
    } else if (hue >= 70 && hue < 110) {
      relevantes.push(tintas.find(t => t.id === "amarillo")!);
      if (a < 0) relevantes.push(tintas.find(t => t.id === "amarillo-verdoso")!);
    } else if (hue >= 110 && hue < 160) {
      relevantes.push(tintas.find(t => t.id === "verde")!);
      relevantes.push(tintas.find(t => t.id === "amarillo-verdoso")!);
    } else if (hue >= 160 || hue < -160) {
      relevantes.push(tintas.find(t => t.id === "verde")!);
      relevantes.push(tintas.find(t => t.id === "azul-verdoso")!);
    } else if (hue >= -160 && hue < -110) {
      relevantes.push(tintas.find(t => t.id === "azul-verdoso")!);
      relevantes.push(tintas.find(t => t.id === "azul")!);
    } else if (hue >= -110 && hue < -60) {
      relevantes.push(tintas.find(t => t.id === "azul")!);
      if (b < -30) relevantes.push(tintas.find(t => t.id === "violeta")!);
    } else if (hue >= -60 && hue < -20) {
      relevantes.push(tintas.find(t => t.id === "magenta")!);
      relevantes.push(tintas.find(t => t.id === "violeta")!);
    } else {
      relevantes.push(tintas.find(t => t.id === "rojo")!);
      relevantes.push(tintas.find(t => t.id === "magenta")!);
    }

    // Añadir negro si luminosidad baja
    if (L < 40) {
      relevantes.push(tintas.find(t => t.id === "negro")!);
    }
  }

  // Eliminar duplicados y nulos
  const uniqueIds = [...new Set(relevantes.map(t => t.id))];
  return uniqueIds.map(id => tintas.find(t => t.id === id)!).filter(Boolean);
}

/**
 * Buscar tintas base cercanas al color objetivo
 * Si una tinta base tiene ΔE < 4 con el objetivo, es más eficiente
 * partir de esa base y ajustarla que formular desde cero.
 * 
 * @param targetLAB - Color objetivo (Pantone)
 * @param tintas - Tintas base disponibles
 * @param umbral - ΔE máximo para considerar una base como "cercana" (default: 4.0)
 * @returns Tinta base más cercana si está dentro del umbral, o null
 */
export function buscarBaseCercana(
  targetLAB: LABColor,
  tintas: TintaBase[],
  umbral: number = 4.0
): { tinta: TintaBase; deltaE: number } | null {
  // Filtrar solo tintas cromáticas (no base transparente/blanco)
  const tintasCromaticas = tintas.filter(t => 
    t.tintingStrength > 0 && t.id !== "transparente" && t.id !== "blanco"
  );

  let mejorBase: TintaBase | null = null;
  let mejorDeltaE = Infinity;

  for (const tinta of tintasCromaticas) {
    const tintaLAB: LABColor = { L: tinta.lab.L, a: tinta.lab.a, b: tinta.lab.b };
    const dE = getDeltaE00(tintaLAB, targetLAB);
    
    if (dE < mejorDeltaE) {
      mejorDeltaE = dE;
      mejorBase = tinta;
    }
  }

  // Solo devolver si está dentro del umbral
  if (mejorBase && mejorDeltaE < umbral) {
    return { tinta: mejorBase, deltaE: Math.round(mejorDeltaE * 100) / 100 };
  }

  return null;
}

/**
 * Formular color automáticamente usando optimización iterativa
 * con modelo Kubelka-Munk real
 * 
 * @param targetL - L* objetivo
 * @param targetA - a* objetivo
 * @param targetB - b* objetivo
 * @param tintas - Tintas base disponibles
 * @param sustrato - Sustrato de impresión
 * @param totalGramos - Cantidad total de mezcla (default: 100g)
 * @param baseCercana - Si se proporciona, usa esta base como punto de partida
 */
export function formularColor(
  targetL: number, targetA: number, targetB: number,
  tintas: TintaBase[],
  sustrato: Sustrato,
  totalGramos: number = 100,
  baseCercana: TintaBase | null = null
): Formulacion {
  const target: LABColor = { L: targetL, a: targetA, b: targetB };
  let tintasRelevantes: TintaBase[];

  // Si hay una base cercana, usarla como componente principal
  if (baseCercana) {
    tintasRelevantes = seleccionarTintasRelevantes(targetL, targetA, targetB, tintas);
    // Asegurar que la base cercana está en la lista
    if (!tintasRelevantes.find(t => t.id === baseCercana.id)) {
      tintasRelevantes.unshift(baseCercana);
    }
  } else {
    tintasRelevantes = seleccionarTintasRelevantes(targetL, targetA, targetB, tintas);
  }

  // Inicializar proporciones
  let insumos: FormulacionInsumo[];
  
  if (baseCercana) {
    // Dar mayor proporción a la base cercana (60%) y dividir el resto
    const baseGramos = totalGramos * 0.6;
    const restoGramos = totalGramos * 0.4;
    const otrasTintas = tintasRelevantes.filter(t => t.id !== baseCercana.id);
    
    insumos = tintasRelevantes.map(t => {
      if (t.id === baseCercana.id) {
        return {
          tintaId: t.id,
          tintaName: t.name,
          gramos: baseGramos,
          porcentaje: 60
        };
      } else {
        return {
          tintaId: t.id,
          tintaName: t.name,
          gramos: restoGramos / otrasTintas.length,
          porcentaje: 40 / otrasTintas.length
        };
      }
    });
  } else {
    // Proporciones iguales
    insumos = tintasRelevantes.map(t => ({
      tintaId: t.id,
      tintaName: t.name,
      gramos: totalGramos / tintasRelevantes.length,
      porcentaje: 100 / tintasRelevantes.length
    }));
  }

  // Optimización por descenso de gradiente numérico
  const stepSize = totalGramos * 0.02;
  const maxIterations = 300;
  let bestDeltaE = Infinity;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentLAB = calcularLABMezcla(insumos, tintas, sustrato);
    const currentDeltaE = getDeltaE00(currentLAB, target);

    if (currentDeltaE < bestDeltaE) {
      bestDeltaE = currentDeltaE;
    }

    if (currentDeltaE < 0.3) break; // Suficientemente cerca

    // Para cada tinta, probar variación y quedarse con la mejor
    for (let i = 0; i < insumos.length; i++) {
      // Probar +step
      const testPlus = [...insumos];
      testPlus[i] = { ...testPlus[i], gramos: testPlus[i].gramos + stepSize };
      const labPlus = calcularLABMezcla(testPlus, tintas, sustrato);
      const dEPlus = getDeltaE00(labPlus, target);

      // Probar -step
      const testMinus = [...insumos];
      testMinus[i] = { ...testMinus[i], gramos: Math.max(0.01, testMinus[i].gramos - stepSize) };
      const labMinus = calcularLABMezcla(testMinus, tintas, sustrato);
      const dEMinus = getDeltaE00(labMinus, target);

      // Actualizar si mejora
      if (dEPlus < currentDeltaE && dEPlus <= dEMinus) {
        insumos[i] = { ...insumos[i], gramos: insumos[i].gramos + stepSize * 0.5 };
      } else if (dEMinus < currentDeltaE) {
        insumos[i] = { ...insumos[i], gramos: Math.max(0.01, insumos[i].gramos - stepSize * 0.5) };
      }
    }

    // Normalizar al total de gramos
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

  // Eliminar tintas insignificantes
  insumos = insumos.filter(inp => inp.porcentaje >= 0.5);

  // Recalcular porcentajes
  const finalTotal = insumos.reduce((s, inp) => s + inp.gramos, 0);
  insumos = insumos.map(inp => ({
    ...inp,
    porcentaje: Math.round((inp.gramos / finalTotal) * 10000) / 100
  }));

  const labEstimado = calcularLABMezcla(insumos, tintas, sustrato);
  const deltaE = getDeltaE00(labEstimado, target);

  return {
    insumos,
    totalGramos: Math.round(finalTotal * 100) / 100,
    labEstimado,
    deltaE: Math.round(deltaE * 100) / 100,
    sustratoId: sustrato.id
  };
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
// AJUSTE AUTOMÁTICO DE FORMULACIÓN
// ============================================

/**
 * Calcula el ajuste óptimo para mejorar el Delta E de una formulación
 * Simula añadir pequeñas cantidades de cada tinta y recomienda la mejor opción
 * 
 * @param labMedido - LAB medido con colorímetro de la mezcla actual
 * @param labObjetivo - LAB objetivo (Pantone)
 * @param insumosActuales - Array de insumos de la formulación actual
 * @param tintas - Array de todas las tintas base disponibles
 * @param sustrato - Sustrato de impresión
 * @returns Objeto con la recomendación de ajuste o null si no hay mejora posible
 */
export function calcularAjusteAutomatico(
  labMedido: LABColor,
  labObjetivo: LABColor,
  insumosActuales: FormulacionInsumo[],
  tintas: TintaBase[],
  sustrato: Sustrato
): {
  tintaId: string;
  tintaName: string;
  gramosAñadir: number;
  deltaEAntes: number;
  deltaEDespues: number;
  mejora: number;
  explicacion: string;
} | null {
  // 1. Calcular Delta E actual
  const deltaEActual = getDeltaE00(labMedido, labObjetivo);
  
  // 2. Inicializar variables para guardar la mejor opción
  let mejorTinta: TintaBase | null = null;
  let mejoresGramos: number = 0;
  let menorDeltaE = deltaEActual;
  let mejorLabSimulado: LABColor | null = null;
  
  // 3. Cantidades a simular
  const cantidadesSimulacion = [0.5, 1.0];
  
  // 4. Iterar sobre cada tinta
  for (const tinta of tintas) {
    // Excluir 'transparente' si ya está en la mezcla (no aporta color)
    const yaEnMezcla = insumosActuales.some(inp => inp.tintaId === tinta.id);
    if (tinta.id === "transparente" && yaEnMezcla) continue;
    
    // Para cada cantidad de simulación
    for (const gramosAñadir of cantidadesSimulacion) {
      // Crear copia de insumos y añadir la tinta
      const insumosSimulados = [...insumosActuales];
      const tintaExistente = insumosSimulados.find(inp => inp.tintaId === tinta.id);
      
      if (tintaExistente) {
        // Si la tinta ya existe, aumentar su cantidad
        tintaExistente.gramos += gramosAñadir;
      } else {
        // Si no existe, añadirla como nueva
        insumosSimulados.push({
          tintaId: tinta.id,
          tintaName: tinta.name,
          gramos: gramosAñadir,
          porcentaje: 0 // Se recalculará después
        });
      }
      
      // Recalcular porcentajes
      const totalGramos = insumosSimulados.reduce((sum, inp) => sum + inp.gramos, 0);
      insumosSimulados.forEach(inp => {
        inp.porcentaje = (inp.gramos / totalGramos) * 100;
      });
      
      // Calcular LAB simulado
      const labSimulado = calcularLABMezcla(insumosSimulados, tintas, sustrato);
      
      // Calcular Delta E simulado
      const deltaESimulado = getDeltaE00(labSimulado, labObjetivo);
      
      // Si es mejor que la mejor opción actual, guardarla
      if (deltaESimulado < menorDeltaE) {
        menorDeltaE = deltaESimulado;
        mejorTinta = tinta;
        mejoresGramos = gramosAñadir;
        mejorLabSimulado = labSimulado;
      }
    }
  }
  
  // 5. Si no se encontró mejora, devolver null
  if (!mejorTinta || !mejorLabSimulado) {
    return null;
  }
  
  // 6. Generar explicación en lenguaje natural
  const mejora = deltaEActual - menorDeltaE;
  const dL = mejorLabSimulado.L - labMedido.L;
  const da = mejorLabSimulado.a - labMedido.a;
  const db = mejorLabSimulado.b - labMedido.b;
  
  // Determinar qué desviación corrige
  let correccion = "";
  if (Math.abs(da) > Math.abs(db)) {
    // Corrección principal en eje a*
    if (da > 0) {
      correccion = "corregir la desviación hacia el verde (a*)";
    } else {
      correccion = "corregir la desviación hacia el rojo (a*)";
    }
  } else {
    // Corrección principal en eje b*
    if (db > 0) {
      correccion = "corregir la desviación hacia el azul (b*)";
    } else {
      correccion = "corregir la desviación hacia el amarillo (b*)";
    }
  }
  
  // Añadir información de luminosidad si es relevante
  if (Math.abs(dL) > 2) {
    if (dL > 0) {
      correccion += " y aumentar la luminosidad";
    } else {
      correccion += " y reducir la luminosidad";
    }
  }
  
  const explicacion = `Añadir ${mejoresGramos.toFixed(1)}g de ${mejorTinta.name} para ${correccion}. Esto reducirá el ΔE*00 de ${deltaEActual.toFixed(2)} a ${menorDeltaE.toFixed(2)} (mejora de ${mejora.toFixed(2)}).`;
  
  // 7. Devolver la recomendación
  return {
    tintaId: mejorTinta.id,
    tintaName: mejorTinta.name,
    gramosAñadir: mejoresGramos,
    deltaEAntes: Math.round(deltaEActual * 100) / 100,
    deltaEDespues: Math.round(menorDeltaE * 100) / 100,
    mejora: Math.round(mejora * 100) / 100,
    explicacion
  };
}
