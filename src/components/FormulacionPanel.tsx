import { Formulacion } from "../utils/colorCalculations";
import { tintasBase } from "../data/tintasBase";
import { labToHex, evaluateDeltaE } from "../utils/colorCalculations";
import { Scale, FlaskConical, Droplets } from "lucide-react";

interface Props {
  formulacion: Formulacion;
  targetLAB: { L: number; a: number; b: number };
  targetColor?: string;
}

export default function FormulacionPanel({ formulacion, targetLAB, targetColor }: Props) {
  const evaluation = evaluateDeltaE(formulacion.deltaE);
  const targetHex = targetColor || labToHex(targetLAB.L, targetLAB.a, targetLAB.b);
  const resultHex = labToHex(formulacion.labEstimado.L, formulacion.labEstimado.a, formulacion.labEstimado.b);

  return (
    <div className="space-y-4">
      {/* Header con colores comparados */}
      <div className="flex items-center gap-4">
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-400 mb-1">Objetivo</div>
          <div
            className="w-full h-16 rounded-xl border-2 border-gray-600 shadow-lg"
            style={{ backgroundColor: targetHex }}
          />
          <div className="text-xs text-gray-400 mt-1 font-mono">
            L:{targetLAB.L.toFixed(1)} a:{targetLAB.a.toFixed(1)} b:{targetLAB.b.toFixed(1)}
          </div>
        </div>
        <div className="text-2xl">→</div>
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-400 mb-1">Resultado</div>
          <div
            className="w-full h-16 rounded-xl border-2 border-gray-600 shadow-lg"
            style={{ backgroundColor: resultHex }}
          />
          <div className="text-xs text-gray-400 mt-1 font-mono">
            L:{formulacion.labEstimado.L.toFixed(1)} a:{formulacion.labEstimado.a.toFixed(1)} b:{formulacion.labEstimado.b.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Delta E Badge */}
      <div className="flex items-center justify-center gap-3">
        <div className="text-center">
          <div className="text-xs text-gray-400">ΔE CIEDE2000</div>
          <div className="text-3xl font-black" style={{ color: evaluation.color }}>
            {formulacion.deltaE.toFixed(2)}
          </div>
        </div>
        <div
          className="px-4 py-2 rounded-full text-sm font-bold"
          style={{ backgroundColor: evaluation.color + "20", color: evaluation.color, border: `2px solid ${evaluation.color}` }}
        >
          {evaluation.rating}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400">{evaluation.description}</p>

      {/* Formulación */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Formulación ({formulacion.totalGramos.toFixed(1)}g)</h3>
        </div>

        <div className="space-y-2">
          {formulacion.insumos.map(inp => {
            const tinta = tintasBase.find(t => t && t.id === inp.tintaId);
            return (
              <div key={inp.tintaId} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded border border-gray-500 flex-shrink-0"
                  style={{ backgroundColor: tinta?.color || "#888" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{inp.tintaName}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, inp.porcentaje * 2)}%`,
                        backgroundColor: tinta?.color || "#888"
                      }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-white">{inp.gramos.toFixed(1)}g</div>
                  <div className="text-[10px] text-gray-400">{inp.porcentaje.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info adicional */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 text-center">
          <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{formulacion.totalGramos.toFixed(1)}g</div>
          <div className="text-[10px] text-gray-400">Total mezcla</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 text-center">
          <Scale className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{formulacion.insumos.length}</div>
          <div className="text-[10px] text-gray-400">Componentes</div>
        </div>
      </div>
    </div>
  );
}
