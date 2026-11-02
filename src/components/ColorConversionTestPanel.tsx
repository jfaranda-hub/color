import { useState, useEffect } from "react";
import { runColorConversionTests } from "../utils/colorConversionTest";
import { CheckCircle2, XCircle, TestTube } from "lucide-react";

export default function ColorConversionTestPanel() {
  const [testResults, setTestResults] = useState<ReturnType<typeof runColorConversionTests> | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const results = runColorConversionTests();
    setTestResults(results);
  }, []);

  if (!testResults) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Ejecutando tests de conversión...</span>
        </div>
      </div>
    );
  }

  const successRate = (testResults.passedTests / testResults.totalTests) * 100;
  const allPassed = testResults.failedTests === 0;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Tests de Conversión RGB ↔ LAB</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {showDetails ? "Ocultar detalles" : "Ver detalles"}
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{testResults.totalTests}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{testResults.passedTests}</div>
          <div className="text-xs text-gray-400">Pasados</div>
        </div>
        <div className={`rounded-lg p-3 text-center ${
          testResults.failedTests > 0 
            ? "bg-red-900/20 border border-red-700/50" 
            : "bg-gray-900/50"
        }`}>
          <div className={`text-2xl font-bold ${
            testResults.failedTests > 0 ? "text-red-400" : "text-gray-400"
          }`}>
            {testResults.failedTests}
          </div>
          <div className="text-xs text-gray-400">Fallados</div>
        </div>
      </div>

      {/* Status */}
      <div className={`rounded-lg p-3 mb-3 ${
        allPassed 
          ? "bg-green-900/20 border border-green-700/50" 
          : "bg-red-900/20 border border-red-700/50"
      }`}>
        <div className="flex items-center gap-2">
          {allPassed ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm font-bold text-green-400">✅ Conversión validada</div>
                <div className="text-xs text-gray-400">
                  Todas las conversiones RGB ↔ LAB tienen error &lt; 1 ΔE
                </div>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm font-bold text-red-400">⚠️ Conversión con errores</div>
                <div className="text-xs text-gray-400">
                  Algunas conversiones superan el umbral de error aceptable
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Tasa de éxito</span>
          <span>{successRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              successRate === 100 ? "bg-green-500" : successRate >= 80 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Detalles */}
      {showDetails && (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-700">
          {testResults.results.map((result, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-2 ${
                result.passed ? "bg-green-900/10" : "bg-red-900/10"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs font-medium text-white">{result.testName}</span>
                </div>
                <span className={`text-xs font-mono ${
                  result.passed ? "text-green-400" : "text-red-400"
                }`}>
                  ΔE: {result.error.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 ml-6">{result.details}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
