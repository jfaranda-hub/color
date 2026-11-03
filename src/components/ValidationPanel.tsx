/**
 * Panel de validación de incidencias corregidas
 * Permite ejecutar pruebas manuales desde la interfaz
 */

import { useState } from 'react';
import { parsePantoneCSV } from '../services/parserCSV';
import { saveBibliotecas, getBibliotecas } from '../services/gestorBibliotecas';
import { savePantoneDatabase, clearPantoneDatabase } from '../services/PantoneDatabaseService';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export default function ValidationPanel() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = () => {
    setRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Valores cero válidos
    try {
      const csv = `PANTONENAME,UNIQUECODE,RED,GREEN,BLUE
PANTONE Black C,10001,0,0,0
PANTONE White C,10002,100,0,0`;

      const result = parsePantoneCSV(csv);
      
      if (result.success && result.totalValidos === 2) {
        testResults.push({
          name: 'Valores cero válidos',
          passed: true,
          details: 'Negro (L=0) y Blanco (L=100) aceptados correctamente'
        });
      } else {
        testResults.push({
          name: 'Valores cero válidos',
          passed: false,
          details: `Esperado 2 válidos, obtenido ${result.totalValidos}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Valores cero válidos',
        passed: false,
        details: `Excepción: ${error}`
      });
    }

    // Test 2: Rechazo de NaN e Infinity
    try {
      const csv = `PANTONENAME,UNIQUECODE,RED,GREEN,BLUE
PANTONE Test1,10001,NaN,50,50
PANTONE Test2,10002,50,Infinity,50
PANTONE Valid,10003,50,50,50`;

      const result = parsePantoneCSV(csv);
      
      if (result.totalValidos === 1 && result.errores.length > 0) {
        testResults.push({
          name: 'Rechazo NaN/Infinity',
          passed: true,
          details: `${result.errores.length} errores detectados correctamente`
        });
      } else {
        testResults.push({
          name: 'Rechazo NaN/Infinity',
          passed: false,
          details: `Esperado 1 válido y errores, obtenido ${result.totalValidos} válidos`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Rechazo NaN/Infinity',
        passed: false,
        details: `Excepción: ${error}`
      });
    }

    // Test 3: Números de fila en errores
    try {
      const csv = `PANTONENAME,UNIQUECODE,RED,GREEN,BLUE
PANTONE Valid,10001,50,50,50
,10002,50,50,50`;

      const result = parsePantoneCSV(csv);
      
      if (result.errores.some(e => e.includes('Fila') || e.includes('fila'))) {
        testResults.push({
          name: 'Números de fila en errores',
          passed: true,
          details: 'Errores incluyen número de fila'
        });
      } else {
        testResults.push({
          name: 'Números de fila en errores',
          passed: false,
          details: 'Errores no incluyen número de fila'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Números de fila en errores',
        passed: false,
        details: `Excepción: ${error}`
      });
    }

    // Test 4: Formato LAB del repositorio Pantone
    try {
      const csv = `PANTONENAME,UNIQUECODE,RED,GREEN,BLUE
PANTONE 185 C,10485,49,74,46`;

      const result = parsePantoneCSV(csv);
      
      if (result.success && result.totalValidos === 1 && 
          result.colores[0].lab.L === 49 && 
          result.colores[0].lab.a === 74 && 
          result.colores[0].lab.b === 46) {
        testResults.push({
          name: 'Formato LAB detectado',
          passed: true,
          details: 'LAB: L=49, a=74, b=46 correcto'
        });
      } else {
        testResults.push({
          name: 'Formato LAB detectado',
          passed: false,
          details: `LAB incorrecto: ${JSON.stringify(result.colores[0]?.lab)}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Formato LAB detectado',
        passed: false,
        details: `Excepción: ${error}`
      });
    }

    // Test 5: Almacenes unificados
    try {
      const testColor = {
        code: 'TEST-001',
        name: 'Test Color',
        L: 50,
        a: 25,
        b: -30,
        hex: '#80404d',
        rgb: { r: 128, g: 64, b: 77 },
        cmyk: { c: 0, m: 50, y: 40, k: 50 },
        hsl: { h: 350, s: 33, l: 38 },
        hsv: { h: 350, s: 50, v: 50 },
        category: 'Test'
      };
      
      const saveResult = savePantoneDatabase([testColor]);
      
      if (saveResult.success) {
        const bibliotecas = getBibliotecas();
        const pantoneBib = bibliotecas.find(b => b.id === 'pantone-database-principal');
        
        if (pantoneBib && pantoneBib.colores.length === 1) {
          testResults.push({
            name: 'Almacenes unificados',
            passed: true,
            details: 'PantoneDatabaseService usa gestorBibliotecas'
          });
        } else {
          testResults.push({
            name: 'Almacenes unificados',
            passed: false,
            details: 'No se encuentra en gestorBibliotecas'
          });
        }
        
        clearPantoneDatabase();
      } else {
        testResults.push({
          name: 'Almacenes unificados',
          passed: false,
          details: `Error al guardar: ${saveResult.error}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Almacenes unificados',
        passed: false,
        details: `Excepción: ${error}`
      });
    }

    // Test 6: Persistencia verificada
    try {
      const testBib = [{
        id: 'test-bib',
        nombre: 'Test',
        colores: [],
        activa: true,
        fechaCarga: new Date().toISOString(),
        formato: 'json' as const,
        totalColores: 0
      }];
      
      const result = saveBibliotecas(testBib);
      
      if (result.success) {
        const stored = getBibliotecas();
        const found = stored.find(b => b.id === 'test-bib');
        
        if (found) {
          testResults.push({
            name: 'Persistencia verificada',
            passed: true,
            details: 'saveBibliotecas verifica que los datos se guardaron'
          });
        } else {
          testResults.push({
            name: 'Persistencia verificada',
            passed: false,
            details: 'No se guardó realmente'
          });
        }
        
        const bibliotecas = getBibliotecas().filter(b => b.id !== 'test-bib');
        saveBibliotecas(bibliotecas);
      } else {
        testResults.push({
          name: 'Persistencia verificada',
          passed: false,
          details: `Error: ${result.error}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Persistencia verificada',
        passed: false,
        details: `Excepción: ${error}`
      });
    }

    setResults(testResults);
    setRunning(false);
  };

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          Validación de Incidencias Corregidas
        </h2>
        <button
          onClick={runTests}
          disabled={running}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {running ? 'Ejecutando...' : 'Ejecutar Pruebas'}
        </button>
      </div>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{results.length}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{passed}</div>
              <div className="text-xs text-gray-400">Aprobados</div>
            </div>
            <div className="bg-red-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{failed}</div>
              <div className="text-xs text-gray-400">Fallidos</div>
            </div>
          </div>

          <div className="space-y-2">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-3 border ${
                  result.passed
                    ? 'bg-green-900/20 border-green-700/50'
                    : 'bg-red-900/20 border-red-700/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{result.passed ? '✅' : '❌'}</span>
                  <span className="text-white font-medium">{result.name}</span>
                </div>
                <div className="text-xs text-gray-400 ml-7">{result.details}</div>
              </div>
            ))}
          </div>

          {failed === 0 && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-center">
              <span className="text-green-400 font-bold">✅ TODAS LAS PRUEBAS PASARON</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
