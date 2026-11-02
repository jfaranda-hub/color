import { useState } from "react";
import {
  Formulacion,
  getDeltaE00,
  calcularLABMezcla,
  labToHex,
  escalarFormulacion,
  evaluateDeltaE,
  LABColor
} from "../utils/colorCalculations";
import { tintasBase } from "../data/tintasBase";
import { Sustrato } from "../data/sustratos";
import { Gauge, Plus, Minus, RotateCcw, ArrowUpCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  formulacion: Formulacion;
  sustrato: Sustrato;
  targetLAB: LABColor;
  toleranciaDeltaE: number;
  onUpdate: (f: Formulacion) => void;
}

export default function IteracionPanel({ formulacion, sustrato, targetLAB, toleranciaDeltaE, onUpdate }: Props) {
  const [medicionLAB, setMedicionLAB] = useState<LABColor>({ L: 0, a: 0, b: 0 });
  const [hasMedicion, setHasMedicion] = useState(false);
  const [escalaGramos, setEscalaGramos] = useState(1000);

  const medicionDeltaE = hasMedicion
    ? getDeltaE00(medicionLAB, targetLAB)
    : 0;

  const evaluation = evaluateDeltaE(medicionDeltaE);

  const handleMedir = () => {
    if (medicionLAB.L > 0 || medicionLAB.a !== 0 || medicionLAB.b !== 0) {
      setHasMedicion(true);
    }
  };

  const handleReset = () => {
    setMedicionLAB({ L: 0, a: 0, b: 0 });
    setHasMedicion(false);
  };

  const handleAjuste = (tintaId: string, delta: number) => {
    const insumos = formulacion.insumos.map(inp => {
      if (inp.tintaId === tintaId) {
        return { ...inp, gramos: Math.max(0, Math.round((inp.gramos + delta) * 100) / 100) };
      }
      return inp;
    }).filter(inp => inp.gramos > 0);

    const total = insumos.reduce((s, inp) => s + inp.gramos, 0);
    const insumosFinal = insumos.map(inp => ({
      ...inp,
      porcentaje: Math.round((inp.gramos / total) * 10000) / 100
    }));

    const labEstimado = calcularLABMezcla(insumosFinal, tintasBase, sustrato);
    const dE = getDeltaE00(labEstimado, targetLAB);

    onUpdate({
      ...formulacion,
      insumos: insumosFinal,
      totalGramos: Math.round(total * 100) / 100,
      labEstimado,
      deltaE: Math.round(dE * 100) / 100
    });
  };

  const handleEscalar = () => {
    const escalada = escalarFormulacion(formulacion, escalaGramos);
    onUpdate(escalada);
  };

  const isDeltaAcceptable = medicionDeltaE <= toleranciaDeltaE;

  return (
    <div className="space-y-4">
      {/* Medición del colorímetro */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-bold text-white">Medición Colorímetro (Prueba 100g)</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">L* (Luminosidad)</label>
            <input
              type="number"
              step="0.1"
              value={medicionLAB.L || ""}
              onChange={(e) => setMedicionLAB({ ...medicionLAB, L: parseFloat(e.target.value) || 0 })}
              placeholder="0-100"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">a* (Rojo/Verde)</label>
            <input
              type="number"
              step="0.1"
              value={medicionLAB.a || ""}
              onChange={(e) => setMedicionLAB({ ...medicionLAB, a: parseFloat(e.target.value) || 0 })}
              placeholder="-128 a +127"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">b* (Amarillo/Azul)</label>
            <input
              type="number"
              step="0.1"
              value={medicionLAB.b || ""}
              onChange={(e) => setMedicionLAB({ ...medicionLAB, b: parseFloat(e.target.value) || 0 })}
              placeholder="-128 a +127"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleMedir}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            📏 Medir Delta E (CIEDE2000)
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {hasMedicion && (
          <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: evaluation.color + "15", border: `1px solid ${evaluation.color}40` }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">ΔE*00 vs Objetivo</div>
                <div className="text-2xl font-black" style={{ color: evaluation.color }}>
                  {medicionDeltaE.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: evaluation.color }}>
                  {isDeltaAcceptable ? <CheckCircle2 className="w-6 h-6 inline mr-1" /> : <AlertTriangle className="w-6 h-6 inline mr-1" />}
                  {evaluation.rating}
                </div>
                <div className="text-[10px] text-gray-400">{evaluation.tolerance}</div>
              </div>
            </div>

            {/* Desglose de diferencias */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center bg-gray-800/50 rounded-lg p-2">
                <div className="text-xs text-gray-400">ΔL*</div>
                <div className={`text-sm font-bold ${(medicionLAB.L - targetLAB.L) > 0 ? "text-orange-400" : "text-blue-400"}`}>
                  {(medicionLAB.L - targetLAB.L) > 0 ? "+" : ""}{(medicionLAB.L - targetLAB.L).toFixed(2)}
                </div>
                <div className="text-[9px] text-gray-500">
                  {(medicionLAB.L - targetLAB.L) > 0 ? "Más claro" : "Más oscuro"}
                </div>
              </div>
              <div className="text-center bg-gray-800/50 rounded-lg p-2">
                <div className="text-xs text-gray-400">Δa*</div>
                <div className={`text-sm font-bold ${(medicionLAB.a - targetLAB.a) > 0 ? "text-red-400" : "text-green-400"}`}>
                  {(medicionLAB.a - targetLAB.a) > 0 ? "+" : ""}{(medicionLAB.a - targetLAB.a).toFixed(2)}
                </div>
                <div className="text-[9px] text-gray-500">
                  {(medicionLAB.a - targetLAB.a) > 0 ? "Más rojo" : "Más verde"}
                </div>
              </div>
              <div className="text-center bg-gray-800/50 rounded-lg p-2">
                <div className="text-xs text-gray-400">Δb*</div>
                <div className={`text-sm font-bold ${(medicionLAB.b - targetLAB.b) > 0 ? "text-yellow-400" : "text-blue-400"}`}>
                  {(medicionLAB.b - targetLAB.b) > 0 ? "+" : ""}{(medicionLAB.b - targetLAB.b).toFixed(2)}
                </div>
                <div className="text-[9px] text-gray-500">
                  {(medicionLAB.b - targetLAB.b) > 0 ? "Más amarillo" : "Más azul"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ajuste fino de la mezcla */}
      {hasMedicion && !isDeltaAcceptable && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔧</span>
            <h3 className="text-sm font-bold text-white">Ajuste Fino (±0.1g por clic)</h3>
          </div>

          <div className="space-y-2">
            {formulacion.insumos.map(inp => (
              <div key={inp.tintaId} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{inp.tintaName}</div>
                  <div className="text-[10px] text-gray-400">{inp.gramos.toFixed(2)}g</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAjuste(inp.tintaId, -0.1)}
                    className="w-7 h-7 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-red-400" />
                  </button>
                  <button
                    onClick={() => handleAjuste(inp.tintaId, -0.05)}
                    className="w-6 h-6 bg-red-900/30 hover:bg-red-800/50 border border-red-800 rounded text-[10px] text-red-400 font-bold transition-colors"
                  >
                    -05
                  </button>
                  <button
                    onClick={() => handleAjuste(inp.tintaId, 0.05)}
                    className="w-6 h-6 bg-green-900/30 hover:bg-green-800/50 border border-green-800 rounded text-[10px] text-green-400 font-bold transition-colors"
                  >
                    +05
                  </button>
                  <button
                    onClick={() => handleAjuste(inp.tintaId, 0.1)}
                    className="w-7 h-7 bg-green-900/50 hover:bg-green-800 border border-green-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-green-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalado a producción */}
      {hasMedicion && isDeltaAcceptable && (
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-bold text-white">¡ΔE*00 ≤ {toleranciaDeltaE.toFixed(1)} Aceptable! Escalar a Producción</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Gramos objetivo (max 1000g)</label>
              <input
                type="number"
                value={escalaGramos}
                onChange={(e) => setEscalaGramos(Math.min(1000, Math.max(100, parseInt(e.target.value) || 100)))}
                min={100}
                max={1000}
                step={50}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              onClick={handleEscalar}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-green-500/20"
            >
              ⚗️ Escalar
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-400 text-center">
            Factor de escala: {(escalaGramos / formulacion.totalGramos).toFixed(1)}x
          </div>
        </div>
      )}

      {/* Visualización del color medido vs objetivo */}
      {hasMedicion && (
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <div className="text-[10px] text-gray-400">Medido (Colorímetro)</div>
            <div
              className="w-full h-10 rounded-lg border border-gray-600"
              style={{ backgroundColor: labToHex(medicionLAB.L, medicionLAB.a, medicionLAB.b) }}
            />
            <div className="text-[9px] text-gray-500 font-mono mt-1">
              {medicionLAB.L.toFixed(1)}/{medicionLAB.a.toFixed(1)}/{medicionLAB.b.toFixed(1)}
            </div>
          </div>
          <div className="text-gray-500 text-xs">vs</div>
          <div className="flex-1 text-center">
            <div className="text-[10px] text-gray-400">Objetivo (Pantone)</div>
            <div
              className="w-full h-10 rounded-lg border border-gray-600"
              style={{ backgroundColor: labToHex(targetLAB.L, targetLAB.a, targetLAB.b) }}
            />
            <div className="text-[9px] text-gray-500 font-mono mt-1">
              {targetLAB.L.toFixed(1)}/{targetLAB.a.toFixed(1)}/{targetLAB.b.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
