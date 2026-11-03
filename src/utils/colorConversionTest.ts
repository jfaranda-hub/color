/**
 * Test de validación de conversiones RGB ↔ LAB
 * Basado en las especificaciones técnicas del documento
 * 
 * Criterios de aceptación:
 * - Error de conversión < 1 Delta E (CIE76)
 * - Conversiones reversibles con mínima pérdida
 * - Valores dentro de rangos válidos (L: 0-100, a/b: -128 a 127)
 */

import { labToRgb, rgbToLab, labToHex, hexToLab, getDeltaE76 } from "./colorCalculations";

interface TestCase {
  name: string;
  rgb: { r: number; g: number; b: number };
  lab: { L: number; a: number; b: number };
  hex: string;
}

// Casos de prueba con valores de referencia conocidos
const testCases: TestCase[] = [
  {
    name: "Rojo puro",
    rgb: { r: 255, g: 0, b: 0 },
    lab: { L: 53.24, a: 80.09, b: 67.20 },
    hex: "#FF0000"
  },
  {
    name: "Verde puro",
    rgb: { r: 0, g: 255, b: 0 },
    lab: { L: 87.73, a: -86.18, b: 83.18 },
    hex: "#00FF00"
  },
  {
    name: "Azul puro",
    rgb: { r: 0, g: 0, b: 255 },
    lab: { L: 32.30, a: 79.19, b: -107.86 },
    hex: "#0000FF"
  },
  {
    name: "Blanco",
    rgb: { r: 255, g: 255, b: 255 },
    lab: { L: 100, a: 0, b: 0 },
    hex: "#FFFFFF"
  },
  {
    name: "Negro",
    rgb: { r: 0, g: 0, b: 0 },
    lab: { L: 0, a: 0, b: 0 },
    hex: "#000000"
  },
  {
    name: "Gris medio",
    rgb: { r: 128, g: 128, b: 128 },
    lab: { L: 53.39, a: 0, b: 0 },
    hex: "#808080"
  },
  {
    name: "Pantone 185 C (aproximado)",
    rgb: { r: 200, g: 16, b: 46 },
    lab: { L: 42.54, a: 65.89, b: 35.71 },
    hex: "#C8102E"
  }
];

export function runColorConversionTests(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: Array<{
    testName: string;
    passed: boolean;
    error: number;
    details: string;
  }>;
} {
  const results: Array<{
    testName: string;
    passed: boolean;
    error: number;
    details: string;
  }> = [];

  let passedTests = 0;
  let failedTests = 0;

  console.log("🧪 Iniciando tests de conversión RGB ↔ LAB\n");

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    
    // Test 1: RGB → LAB
    const labFromRgb = rgbToLab(testCase.rgb.r, testCase.rgb.g, testCase.rgb.b);
    const labError = getDeltaE76(labFromRgb, testCase.lab);
    
    console.log(`  RGB → LAB:`);
    console.log(`    Esperado: L=${testCase.lab.L.toFixed(2)}, a=${testCase.lab.a.toFixed(2)}, b=${testCase.lab.b.toFixed(2)}`);
    console.log(`    Obtenido: L=${labFromRgb.L.toFixed(2)}, a=${labFromRgb.a.toFixed(2)}, b=${labFromRgb.b.toFixed(2)}`);
    console.log(`    Error ΔE: ${labError.toFixed(2)}`);
    
    // Test 2: LAB → RGB (reversibilidad)
    const rgbFromLab = labToRgb(labFromRgb.L, labFromRgb.a, labFromRgb.b);
    const rgbError = Math.sqrt(
      Math.pow(rgbFromLab.r - testCase.rgb.r, 2) +
      Math.pow(rgbFromLab.g - testCase.rgb.g, 2) +
      Math.pow(rgbFromLab.b - testCase.rgb.b, 2)
    );
    
    console.log(`  LAB → RGB (reversibilidad):`);
    console.log(`    Esperado: R=${testCase.rgb.r}, G=${testCase.rgb.g}, B=${testCase.rgb.b}`);
    console.log(`    Obtenido: R=${rgbFromLab.r.toFixed(0)}, G=${rgbFromLab.g.toFixed(0)}, B=${rgbFromLab.b.toFixed(0)}`);
    console.log(`    Error RGB: ${rgbError.toFixed(2)}`);
    
    // Test 3: LAB → HEX
    const hexFromLab = labToHex(labFromRgb.L, labFromRgb.a, labFromRgb.b);
    console.log(`  LAB → HEX:`);
    console.log(`    Esperado: ${testCase.hex}`);
    console.log(`    Obtenido: ${hexFromLab}`);
    
    // Test 4: HEX → LAB
    const labFromHex = hexToLab(testCase.hex);
    const hexError = getDeltaE76(labFromHex, testCase.lab);
    console.log(`  HEX → LAB:`);
    console.log(`    Error ΔE: ${hexError.toFixed(2)}`);
    
    // Validar rangos
    const labInRange = labFromRgb.L >= 0 && labFromRgb.L <= 100 &&
                       labFromRgb.a >= -128 && labFromRgb.a <= 127 &&
                       labFromRgb.b >= -128 && labFromRgb.b <= 127;
    
    // Criterio de aceptación: error < 1 Delta E
    const passed = labError < 1.0 && rgbError < 5 && labInRange;
    
    if (passed) {
      console.log(`  ✅ PASSED`);
      passedTests++;
    } else {
      console.log(`  ❌ FAILED`);
      failedTests++;
    }
    
    results.push({
      testName: testCase.name,
      passed,
      error: labError,
      details: `ΔE=${labError.toFixed(2)}, RGB Error=${rgbError.toFixed(2)}, In Range=${labInRange}`
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 RESUMEN DE TESTS`);
  console.log(`  Total: ${testCases.length}`);
  console.log(`  ✅ Passed: ${passedTests}`);
  console.log(`  ❌ Failed: ${failedTests}`);
  console.log(`  Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
  console.log("\n" + "=".repeat(60));

  return {
    totalTests: testCases.length,
    passedTests,
    failedTests,
    results
  };
}

// Ejecutar tests al importar el módulo
if (typeof window !== "undefined") {
  // Solo ejecutar en el navegador
  setTimeout(() => {
    console.log("\n🔬 EJECUTANDO TESTS DE CONVERSIÓN DE COLOR\n");
    const testResults = runColorConversionTests();
    
    if (testResults.failedTests > 0) {
      console.warn("\n⚠️  ALGUNOS TESTS FALLARON. Revisar las conversiones.");
    } else {
      console.log("\n✅ TODOS LOS TESTS PASARON. Conversiones validadas.");
    }
  }, 100);
}
