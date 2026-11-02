import { useState, useMemo, useCallback } from "react";
import PantoneSelector from "./components/PantoneSelector";
import SustratoSelector from "./components/SustratoSelector";
import FamiliaSelector from "./components/FamiliaSelector";
import ResistenciasSelector, { Resistencias } from "./components/ResistenciasSelector";
import { PantoneColor } from "./data/pantoneLab";
import { Sustrato } from "./data/sustratos";
import { FamiliaTinta, TintaBase, tintasBase } from "./data/tintasBase";
import { formularColor, Formulacion, labToHex } from "./utils/colorCalculations";
import { Beaker, Sparkles, ChevronRight, AlertCircle } from "lucide-react";

type Step = "config" | "formulacion";

export default function App() {
  const [step, setStep] = useState<Step>("config");
  const [pantone, setPantone] = useState<PantoneColor | null>(null);
  const [sustrato, setSustrato] = useState<Sustrato | null>(null);
  const [formulacion, setFormulacion] = useState<Formulacion | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // TAREA 4: Nuevos estados
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState<FamiliaTinta | 'todas'>('standard-pantone');
  const [resistenciasRequeridas, setResistenciasRequeridas] = useState<Resistencias>({
    luz: false,
    solvente: false,
    jabon: false,
    grasa: false,
    alcalino: false
  });

  // Filtrar tintas por familia y resistencias
  const tintasFiltradas = useMemo(() => {
    return tintasBase.filter(tinta => {
      // Filtrar por familia
      if (familiaSeleccionada !== 'todas' && tinta.familia !== familiaSeleccionada) {
        return false;
      }
      
      // Filtrar por resistencias
      const resistenciasActivas = Object.entries(resistenciasRequeridas).filter(([, activo]) => activo);
      
      for (const [key] of resistenciasActivas) {
        if (key === 'luz') {
          if (!tinta.lightFastness || tinta.lightFastness < 7) return false;
        } else if (key === 'solvente') {
          if (!tinta.solventResistance) return false;
        } else if (key === 'jabon') {
          if (!tinta.soapResistance) return false;
        } else if (key === 'grasa') {
          if (!tinta.greaseResistance) return false;
        } else if (key === 'alcalino') {
          if (!tinta.alkalineResistance) return false;
        }
      }
      
      return true;
    });
  }, [familiaSeleccionada, resistenciasRequeridas]);

  const tintasDescartadas = tintasBase.length - tintasFiltradas.length;

  const handleCalcular = useCallback(() => {
    if (!pantone || !sustrato) return;

    setIsCalculating(true);

    setTimeout(() => {
      const result = formularColor(
        pantone.L, pantone.a, pantone.b,
        tintasFiltradas,
        sustrato,
        100
      );
      setFormulacion(result);
      setStep("formulacion");
      setIsCalculating(false);
    }, 800);
  }, [pantone, sustrato, tintasFiltradas]);

  const handleNuevaFormulacion = () => {
    setStep("config");
    setFormulacion(null);
  };

  const targetLAB = pantone ? { L: pantone.L, a: pantone.a, b: pantone.b } : { L: 0, a: 0, b: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">FlexColor Pro <span className="text-xs font-normal text-blue-400">v3.0</span></h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">
                Flint Group EkoCure ANCORA F2 YEP
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {(["config", "formulacion"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step === s ? "border-blue-500 bg-blue-500 text-white" :
                  (["config", "formulacion"].indexOf(step) > i) ? "border-green-500 bg-green-500/20 text-green-400" :
                  "border-gray-600 text-gray-500"
                }`}>
                  {i + 1}
                </div>
                {i < 1 && <ChevronRight className="w-4 h-4 text-gray-600 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {step === "config" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black mb-2">Configuración de Trabajo</h2>
              <p className="text-gray-400 text-sm">Selecciona familia, resistencias, Pantone y sustrato</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* TAREA 4: FamiliaSelector y ResistenciasSelector ANTES del PantoneSelector */}
                <FamiliaSelector selected={familiaSeleccionada} onSelect={setFamiliaSeleccionada} />
                <ResistenciasSelector resistencias={resistenciasRequeridas} onChange={setResistenciasRequeridas} />
                
                {/* Aviso de tintas descartadas */}
                {tintasDescartadas > 0 && (
                  <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-300">
                      <span className="font-bold">{tintasDescartadas} tinta{tintasDescartadas !== 1 ? 's' : ''} descartada{tintasDescartadas !== 1 ? 's' : ''}</span> por criterios de familia o resistencias.
                      <br />
                      <span className="text-amber-400">{tintasFiltradas.length} tinta{tintasFiltradas.length !== 1 ? 's' : ''} disponible{tintasFiltradas.length !== 1 ? 's' : ''} para formulación.</span>
                    </div>
                  </div>
                )}

                <PantoneSelector selected={pantone} onSelect={setPantone} />
              </div>
              
              <div className="space-y-6">
                <SustratoSelector selected={sustrato} onSelect={setSustrato} />

                {/* Resumen */}
                {pantone && sustrato && (
                  <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                    <h3 className="text-sm font-bold text-white mb-3">📊 Resumen del Trabajo</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Familia:</span>
                        <span className="text-white font-medium">{familiaSeleccionada === 'todas' ? 'Todas' : familiaSeleccionada}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pantone:</span>
                        <span className="text-white font-medium">{pantone.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sustrato:</span>
                        <span className="text-white font-medium">{sustrato.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">LAB Objetivo (D65/2°):</span>
                        <span className="text-white font-mono text-xs">
                          {pantone.L.toFixed(1)} / {pantone.a.toFixed(1)} / {pantone.b.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl border-2 border-gray-600 shadow-lg"
                        style={{ backgroundColor: labToHex(pantone.L, pantone.a, pantone.b) }}
                      />
                      <div>
                        <div className="text-xs text-gray-400">Color objetivo</div>
                        <div className="text-sm font-bold text-white">{pantone.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{pantone.hex}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleCalcular}
                disabled={!pantone || !sustrato || isCalculating || tintasFiltradas.length === 0}
                className={`flex items-center gap-3 py-4 px-8 rounded-2xl text-lg font-bold transition-all shadow-xl ${
                  pantone && sustrato && !isCalculating && tintasFiltradas.length > 0
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculando formulación...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Calcular Formulación (100g)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === "formulacion" && formulacion && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black mb-2">Formulación - 100g</h2>
              <p className="text-gray-400 text-sm">
                Pantone {pantone?.code} en {sustrato?.name}
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h3 className="text-sm font-bold text-white mb-4">📋 Receta de Mezcla</h3>
              
              <div className="space-y-3">
                {formulacion.insumos.map(inp => (
                  <div key={inp.tintaId} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{inp.tintaName}</div>
                      <div className="text-xs text-gray-400">{inp.porcentaje.toFixed(1)}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">{inp.gramos.toFixed(1)}g</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total:</span>
                  <span className="text-xl font-bold text-white">{formulacion.totalGramos.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">ΔE*00 estimado:</span>
                  <span className={`text-xl font-bold ${formulacion.deltaE <= 2.0 ? 'text-green-400' : 'text-orange-400'}`}>
                    {formulacion.deltaE.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleNuevaFormulacion}
                className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded-xl transition-colors"
              >
                ← Nueva Formulación
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          FlexColor Pro v3.0 — Flint Group EkoCure ANCORA F2 YEP
          <br />
          <span className="text-gray-600">
            Delta E CIEDE2000 • Kubelka-Munk • chroma-js (CIE D65/2°)
          </span>
        </div>
      </footer>
    </div>
  );
}
