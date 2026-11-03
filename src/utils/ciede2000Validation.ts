/**
 * Validación de CIEDE2000 contra datos de referencia Sharma et al. (2005)
 * 
 * Este módulo ejecuta los 34 pares de prueba publicados y verifica que
 * la implementación produzca resultados dentro de la tolerancia aceptable.
 */

import { getDeltaE00 } from './colorCalculations';
import { sharmaReferenceData } from './sharmaReferenceData';

export interface ValidationResult {
  index: number;
  calculated: number;
  expected: number;
  difference: number;
  passed: boolean;
}

export interface ValidationReport {
  totalTests: number;
  passed: number;
  failed: number;
  maxDifference: number;
  avgDifference: number;
  results: ValidationResult[];
  timestamp: string;
}

/**
 * Tolerancia aceptable según Sharma et al.
 * Los valores deben coincidir con 4 decimales de precisión.
 */
const TOLERANCE = 0.001;

/**
 * Ejecuta la validación completa contra los 34 pares de referencia
 */
export function validateCIEDE2000(): ValidationReport {
  const results: ValidationResult[] = [];
  let passed = 0;
  let failed = 0;
  let maxDifference = 0;
  let totalDifference = 0;

  console.log('🔬 Iniciando validación CIEDE2000 contra referencia Sharma et al. (2005)');
  console.log(`📊 Total de pares de prueba: ${sharmaReferenceData.length}`);
  console.log(`🎯 Tolerancia aceptable: ±${TOLERANCE}`);
  console.log('');

  for (const pair of sharmaReferenceData) {
    const calculated = getDeltaE00(pair.lab1, pair.lab2);
    const difference = Math.abs(calculated - pair.deltaE00);
    const testPassed = difference <= TOLERANCE;

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }

    if (difference > maxDifference) {
      maxDifference = difference;
    }
    totalDifference += difference;

    results.push({
      index: pair.index,
      calculated,
      expected: pair.deltaE00,
      difference,
      passed: testPassed
    });

    // Log detallado para tests fallidos
    if (!testPassed) {
      console.log(`❌ Par ${pair.index}:`);
      console.log(`   Lab1: L=${pair.lab1.L}, a=${pair.lab1.a}, b=${pair.lab1.b}`);
      console.log(`   Lab2: L=${pair.lab2.L}, a=${pair.lab2.a}, b=${pair.lab2.b}`);
      console.log(`   Esperado: ${pair.deltaE00}`);
      console.log(`   Calculado: ${calculated.toFixed(4)}`);
      console.log(`   Diferencia: ${difference.toFixed(4)}`);
      console.log('');
    }
  }

  const avgDifference = totalDifference / results.length;

  const report: ValidationReport = {
    totalTests: sharmaReferenceData.length,
    passed,
    failed,
    maxDifference,
    avgDifference,
    results,
    timestamp: new Date().toISOString()
  };

  // Resumen
  console.log('═══════════════════════════════════════════════════════');
  console.log('📈 RESUMEN DE VALIDACIÓN CIEDE2000');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total de tests: ${report.totalTests}`);
  console.log(`✅ Aprobados: ${report.passed}`);
  console.log(`❌ Fallidos: ${report.failed}`);
  console.log(`📊 Tasa de éxito: ${((report.passed / report.totalTests) * 100).toFixed(1)}%`);
  console.log(`📏 Diferencia máxima: ${report.maxDifference.toFixed(4)}`);
  console.log(`📐 Diferencia promedio: ${report.avgDifference.toFixed(4)}`);
  console.log('═══════════════════════════════════════════════════════');

  if (report.failed === 0) {
    console.log('✅ VALIDACIÓN EXITOSA: Todos los pares pasan dentro de tolerancia');
  } else {
    console.log(`⚠️ VALIDACIÓN FALLIDA: ${report.failed} pares fuera de tolerancia`);
  }

  return report;
}

/**
 * Verifica casos extremos y valores límite
 */
export function validateEdgeCases(): { passed: number; failed: number; details: string[] } {
  const details: string[] = [];
  let passed = 0;
  let failed = 0;

  console.log('');
  console.log('🔍 Validando casos extremos...');
  console.log('');

  // Test 1: Colores idénticos deben dar ΔE = 0
  const identical = getDeltaE00({ L: 50, a: 25, b: -30 }, { L: 50, a: 25, b: -30 });
  if (identical === 0) {
    console.log('✅ Colores idénticos: ΔE = 0');
    passed++;
  } else {
    console.log(`❌ Colores idénticos: ΔE = ${identical} (debería ser 0)`);
    details.push(`Colores idénticos: ${identical}`);
    failed++;
  }

  // Test 2: Negro absoluto (L=0, a=0, b=0)
  try {
    const black = getDeltaE00({ L: 0, a: 0, b: 0 }, { L: 0, a: 0, b: 0 });
    if (!isNaN(black) && black === 0) {
      console.log('✅ Negro absoluto: ΔE = 0');
      passed++;
    } else {
      console.log(`❌ Negro absoluto: ΔE = ${black}`);
      details.push(`Negro absoluto: ${black}`);
      failed++;
    }
  } catch (e) {
    console.log(`❌ Negro absoluto lanzó excepción: ${e}`);
    details.push(`Negro absoluto: excepción`);
    failed++;
  }

  // Test 3: Blanco absoluto (L=100, a=0, b=0)
  try {
    const white = getDeltaE00({ L: 100, a: 0, b: 0 }, { L: 100, a: 0, b: 0 });
    if (!isNaN(white) && white === 0) {
      console.log('✅ Blanco absoluto: ΔE = 0');
      passed++;
    } else {
      console.log(`❌ Blanco absoluto: ΔE = ${white}`);
      details.push(`Blanco absoluto: ${white}`);
      failed++;
    }
  } catch (e) {
    console.log(`❌ Blanco absoluto lanzó excepción: ${e}`);
    details.push(`Blanco absoluto: excepción`);
    failed++;
  }

  // Test 4: Simetría (ΔE(a,b) debe ser igual a ΔE(b,a))
  const lab1 = { L: 50, a: 25, b: -30 };
  const lab2 = { L: 60, a: -15, b: 40 };
  const deltaE_ab = getDeltaE00(lab1, lab2);
  const deltaE_ba = getDeltaE00(lab2, lab1);
  
  if (Math.abs(deltaE_ab - deltaE_ba) < 0.0001) {
    console.log(`✅ Simetría: ΔE(a,b) = ΔE(b,a) = ${deltaE_ab.toFixed(4)}`);
    passed++;
  } else {
    console.log(`❌ Simetría: ΔE(a,b) = ${deltaE_ab.toFixed(4)}, ΔE(b,a) = ${deltaE_ba.toFixed(4)}`);
    details.push(`Simetría violada: ${deltaE_ab} vs ${deltaE_ba}`);
    failed++;
  }

  // Test 5: Valores muy grandes
  try {
    const large = getDeltaE00({ L: 0, a: -128, b: -128 }, { L: 100, a: 127, b: 127 });
    if (!isNaN(large) && isFinite(large) && large > 0) {
      console.log(`✅ Valores extremos: ΔE = ${large.toFixed(4)} (válido)`);
      passed++;
    } else {
      console.log(`❌ Valores extremos: ΔE = ${large} (inválido)`);
      details.push(`Valores extremos: ${large}`);
      failed++;
    }
  } catch (e) {
    console.log(`❌ Valores extremos lanzaron excepción: ${e}`);
    details.push(`Valores extremos: excepción`);
    failed++;
  }

  console.log('');
  console.log(`Casos extremos: ${passed} aprobados, ${failed} fallidos`);

  return { passed, failed, details };
}

/**
 * Ejecuta todas las validaciones y genera informe completo
 */
export function runFullValidation(): {
  sharmaReport: ValidationReport;
  edgeCases: { passed: number; failed: number; details: string[] };
  overall: 'PASS' | 'FAIL';
} {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   VALIDACIÓN COMPLETA DE CIEDE2000                   ║');
  console.log('║   FlexColor Pro - Auditoría Técnica                  ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  const sharmaReport = validateCIEDE2000();
  const edgeCases = validateEdgeCases();

  const overall = (sharmaReport.failed === 0 && edgeCases.failed === 0) ? 'PASS' : 'FAIL';

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏁 RESULTADO FINAL');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Estado: ${overall === 'PASS' ? '✅ APROBADO' : '❌ FALLIDO'}`);
  console.log(`Sharma: ${sharmaReport.passed}/${sharmaReport.totalTests} pares`);
  console.log(`Casos extremos: ${edgeCases.passed} aprobados, ${edgeCases.failed} fallidos`);
  console.log('═══════════════════════════════════════════════════════');

  return { sharmaReport, edgeCases, overall };
}
