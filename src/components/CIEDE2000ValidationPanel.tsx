import { useState, useEffect } from 'react';
import { runFullValidation } from '../utils/ciede2000Validation';
import type { ValidationReport } from '../utils/ciede2000Validation';

export default function CIEDE2000ValidationPanel() {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [edgeCases, setEdgeCases] = useState<{ passed: number; failed: number; details: string[] } | null>(null);
  const [overall, setOverall] = useState<'PASS' | 'FAIL' | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runValidation = () => {
    setIsRunning(true);
    
    // Ejecutar en next tick para no bloquear UI
    setTimeout(() => {
      const result = runFullValidation();
      setReport(result.sharmaReport);
      setEdgeCases(result.edgeCases);
      setOverall(result.overall);
      setIsRunning(false);
    }, 100);
  };

  useEffect(() => {
    // Ejecutar validación automáticamente al montar
    runValidation();
  }, []);

  if (!report || !edgeCases || !overall) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">Ejecutando validación CIEDE2000...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Validación CIEDE2000 - Referencia Sharma et al. (2005)
        </h2>
        <button
          onClick={runValidation}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {isRunning ? 'Ejecutando...' : 'Re-ejecutar'}
        </button>
      </div>

      {/* Resultado General */}
      <div className={`p-4 rounded-lg border-2 ${
        overall === 'PASS' 
          ? 'bg-green-900/20 border-green-500' 
          : 'bg-red-900/20 border-red-500'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`text-4xl ${overall === 'PASS' ? 'text-green-400' : 'text-red-400'}`}>
            {overall === 'PASS' ? '✅' : '❌'}
          </div>
          <div>
            <div className={`text-2xl font-bold ${overall === 'PASS' ? 'text-green-400' : 'text-red-400'}`}>
              {overall === 'PASS' ? 'VALIDACIÓN APROBADA' : 'VALIDACIÓN FALLIDA'}
            </div>
            <div className="text-sm text-gray-400">
              {overall === 'PASS' 
                ? 'La implementación CIEDE2000 es correcta según referencia Sharma et al.'
                : 'Se detectaron desviaciones en la implementación CIEDE2000'}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Sharma */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Tests</div>
          <div className="text-2xl font-bold text-white">{report.totalTests}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400">Aprobados</div>
          <div className="text-2xl font-bold text-green-400">{report.passed}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400">Fallidos</div>
          <div className="text-2xl font-bold text-red-400">{report.failed}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400">Tasa de Éxito</div>
          <div className="text-2xl font-bold text-blue-400">
            {((report.passed / report.totalTests) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Diferencias */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400">Diferencia Máxima</div>
          <div className="text-xl font-bold text-yellow-400">
            {report.maxDifference.toFixed(4)}
          </div>
          <div className="text-xs text-gray-500">Tolerancia: ±0.001</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400">Diferencia Promedio</div>
          <div className="text-xl font-bold text-blue-400">
            {report.avgDifference.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Casos Extremos */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Casos Extremos</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="text-sm text-gray-400">Aprobados: </span>
            <span className="text-green-400 font-bold">{edgeCases.passed}</span>
          </div>
          <div>
            <span className="text-sm text-gray-400">Fallidos: </span>
            <span className="text-red-400 font-bold">{edgeCases.failed}</span>
          </div>
        </div>
        {edgeCases.details.length > 0 && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded">
            <div className="text-sm text-red-400 font-semibold mb-2">Detalles de fallos:</div>
            <ul className="text-xs text-red-300 space-y-1">
              {edgeCases.details.map((detail, idx) => (
                <li key={idx}>• {detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detalles de Tests Fallidos */}
      {report.failed > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            Tests Fallidos ({report.failed})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {report.results
              .filter(r => !r.passed)
              .map((result) => (
                <div key={result.index} className="bg-red-900/20 border border-red-700 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-semibold">Par {result.index}</span>
                    <span className="text-red-400 text-sm">
                      Δ: {result.difference.toFixed(4)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Esperado: </span>
                      <span className="text-white">{result.expected}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Calculado: </span>
                      <span className="text-white">{result.calculated.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-right">
        Validación ejecutada: {new Date(report.timestamp).toLocaleString('es-ES')}
      </div>
    </div>
  );
}
