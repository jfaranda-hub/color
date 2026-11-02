import { useState, useCallback } from "react";
import PantoneSelector from "./components/PantoneSelector";
import SustratoSelector from "./components/SustratoSelector";
import AniloxManager from "./components/AniloxManager";
import FormulacionPanel from "./components/FormulacionPanel";
import IteracionPanel from "./components/IteracionPanel";
import SustratoCalibration from "./components/SustratoCalibration";
import DeltaEToleranceSelector, { DeltaETolerance, toleranceLevels } from "./components/DeltaEToleranceSelector";
import { PantoneColor } from "./data/pantoneLab";
import { Sustrato } from "./data/sustratos";
import { AniloxConfig } from "./components/AniloxManager";
import { formularColor, buscarBaseCercana, Formulacion, labToHex, LABColor } from "./utils/colorCalculations";
import { TintaBase } from "./data/tintasBase";
import { tintasBase } from "./data/tintasBase";
import { Beaker, Sparkles, ChevronRight, ScanLine, Wrench, Target, AlertTriangle } from "lucide-react";

type Step = "config" | "formulacion" | "iteracion";
type Tab = "formulacion" | "anilox" | "calibracion";

export default function App() {
  const [step, setStep] = useState<Step>("config");
  const [activeTab, setActiveTab] = useState<Tab>("formulacion");
  const [pantone, setPantone] = useState<PantoneColor | null>(null);
  const [sustrato, setSustrato] = useState<Sustrato | null>(null);
  const [anilox, setAnilox] = useState<AniloxConfig | null>(null);
  const [formulacion, setFormulacion] = useState<Formulacion | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Tolerancia ΔE
  const [tolerancia, setTolerancia] = useState<DeltaETolerance>(toleranceLevels[1]); // Estándar ΔE ≤ 2.0
  const [customToleranceValue, setCustomToleranceValue] = useState(2.0);
  
  // Base cercana encontrada
  const [baseCercana, setBaseCercana] = useState<{ tinta: TintaBase; deltaE: number } | null>(null);

  const handleCalcular = useCallback(() => {
    if (!pantone || !sustrato) return;

    setIsCalculating(true);

    setTimeout(() => {
      const targetLAB: LABColor = { L: pantone.L, a: pantone.a, b: pantone.b };
      
      // Buscar base cercana (ΔE < 4.0)
      const baseEncontrada = buscarBaseCercana(targetLAB, tintasBase, 4.0);
      setBaseCercana(baseEncontrada);
      
      const result = formularColor(
        pantone.L, pantone.a, pantone.b,
        tintasBase,
        sustrato,
        100,
        baseEncontrada?.tinta || null
      );
      setFormulacion(result);
      setStep("formulacion");
      setIsCalculating(false);
    }, 800);
  }, [pantone, sustrato]);

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
              <h1 className="text-lg font-black tracking-tight">FlexColor Pro <span className="text-xs font-normal text-blue-400">v2.0</span></h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">
                Formulación Flexográfica • Delta E CIEDE2000 • Kubelka-Munk • chroma-js
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {(["config", "formulacion", "iteracion"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step === s ? "border-blue-500 bg-blue-500 text-white" :
                  (["config", "formulacion", "iteracion"].indexOf(step) > i) ? "border-green-500 bg-green-500/20 text-green-400" :
                  "border-gray-600 text-gray-500"
                }`}>
                  {i + 1}
                </div>
                {i < 2 && <ChevronRight className="w-4 h-4 text-gray-600 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Step 1: Configuration */}
        {step === "config" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black mb-2">Configuración de Trabajo</h2>
              <p className="text-gray-400 text-sm">Selecciona Pantone, sustrato y anilox para formular</p>
            </div>

            {/* Tabs para gestión */}
            <div className="flex gap-1 border-b border-gray-700 pb-2 mb-4">
              <button
                onClick={() => setActiveTab("formulacion")}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                  activeTab === "formulacion" ? "bg-blue-600/20 text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Beaker className="w-4 h-4" /> Formulación
              </button>
              <button
                onClick={() => setActiveTab("anilox")}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                  activeTab === "anilox" ? "bg-purple-600/20 text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Wrench className="w-4 h-4" /> Gestión Anilox
              </button>
              <button
                onClick={() => setActiveTab("calibracion")}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                  activeTab === "calibracion" ? "bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <ScanLine className="w-4 h-4" /> Calibración Sustratos
              </button>
            </div>

            {/* Tab: Formulación */}
            {activeTab === "formulacion" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <PantoneSelector selected={pantone} onSelect={setPantone} />
                  <SustratoSelector selected={sustrato} onSelect={setSustrato} />
                </div>
                <div className="space-y-6">
                  <AniloxManager selected={anilox} onSelect={setAnilox} />

                  {/* Tolerancia ΔE */}
                  <DeltaEToleranceSelector
                    tolerance={tolerancia}
                    customValue={customToleranceValue}
                    onToleranceChange={setTolerancia}
                    onCustomValueChange={setCustomToleranceValue}
                  />

                  {/* Resumen */}
                  {pantone && sustrato && (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                      <h3 className="text-sm font-bold text-white mb-3">📊 Resumen del Trabajo</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pantone:</span>
                          <span className="text-white font-medium">{pantone.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sustrato:</span>
                          <span className="text-white font-medium">{sustrato.name}</span>
                        </div>
                        {anilox && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Anilox:</span>
                            <span className="text-white font-medium">{anilox.name}</span>
                          </div>
                        )}
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

                      {/* Información sobre base cercana */}
                      {baseCercana && (
                        <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <div className="font-bold text-blue-400 mb-1">
                                Base cercana encontrada (ΔE {baseCercana.deltaE.toFixed(2)})
                              </div>
                              <div className="text-gray-300">
                                La tinta base <span className="font-bold text-white">{baseCercana.tinta.name}</span> está a ΔE {baseCercana.deltaE.toFixed(2)} del Pantone objetivo.
                              </div>
                              <div className="text-gray-400 mt-1">
                                Se usará como componente principal (60%) para facilitar la formulación.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Gestión Anilox */}
            {activeTab === "anilox" && (
              <div className="max-w-3xl mx-auto">
                <AniloxManager selected={anilox} onSelect={setAnilox} />
              </div>
            )}

            {/* Tab: Calibración Sustratos */}
            {activeTab === "calibracion" && (
              <div className="max-w-3xl mx-auto">
                <SustratoCalibration />
              </div>
            )}

            {/* Calculate Button */}
            {activeTab === "formulacion" && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleCalcular}
                  disabled={!pantone || !sustrato || isCalculating}
                  className={`flex items-center gap-3 py-4 px-8 rounded-2xl text-lg font-bold transition-all shadow-xl ${
                    pantone && sustrato && !isCalculating
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calculando formulación (Kubelka-Munk)...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Calcular Formulación (100g)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Formulation */}
        {step === "formulacion" && formulacion && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black mb-2">Formulación Inicial - 100g</h2>
              <p className="text-gray-400 text-sm">
                Pantone {pantone?.code} en {sustrato?.name} • Modelo Kubelka-Munk
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormulacionPanel
                formulacion={formulacion}
                targetLAB={targetLAB}
              />
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                  <h3 className="text-sm font-bold text-white mb-2">📋 Protocolo del Operador</h3>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">1.</span>
                      Preparar mezcla según proporciones (total 100g)
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">2.</span>
                      Aplicar prueba sobre sustrato con el anilox configurado
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">3.</span>
                      Medir con colorímetro (D65/2°) e introducir valores LAB
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">4.</span>
                      Si ΔE*00 ≤ {tolerancia.id === "personalizado" ? customToleranceValue.toFixed(1) : tolerancia.value.toFixed(1)} → Escalar a producción (max 1000g)
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">5.</span>
                      Si ΔE*00 &gt; {tolerancia.id === "personalizado" ? customToleranceValue.toFixed(1) : tolerancia.value.toFixed(1)} → Ajustar ±0.05-0.1g y volver a medir
                    </li>
                  </ol>
                </div>

                {/* Info técnica */}
                <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-3">
                  <h4 className="text-xs font-bold text-gray-400 mb-2">⚙️ Motor de Cálculo</h4>
                  <div className="space-y-1 text-[10px] text-gray-500">
                    <div>• Delta E: CIEDE2000 (librería delta-e)</div>
                    <div>• Mezcla: Kubelka-Munk single-constant</div>
                    <div>• Conversiones: chroma-js (CIE D65/2°)</div>
                    <div>• Datos Pantone: LAB desde sRGB certificado</div>
                  </div>
                </div>

                <button
                  onClick={() => setStep("iteracion")}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center justify-center gap-2"
                >
                  <span>📏</span> Ir a Medición (Tolerancia: ΔE ≤ {tolerancia.id === "personalizado" ? customToleranceValue.toFixed(1) : tolerancia.value.toFixed(1)})
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNuevaFormulacion}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  ← Nueva Formulación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Iteration */}
        {step === "iteracion" && formulacion && sustrato && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black mb-2">Medición y Ajuste</h2>
              <p className="text-gray-400 text-sm">
                Medir prueba 100g → ΔE*00 ≤ {tolerancia.id === "personalizado" ? customToleranceValue.toFixed(1) : tolerancia.value.toFixed(1)} → Escalar a 1000g
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <IteracionPanel
                formulacion={formulacion}
                sustrato={sustrato}
                targetLAB={targetLAB}
                toleranciaDeltaE={tolerancia.id === "personalizado" ? customToleranceValue : tolerancia.value}
                onUpdate={setFormulacion}
              />
              <div className="space-y-4">
                <FormulacionPanel
                  formulacion={formulacion}
                  targetLAB={targetLAB}
                />
                <button
                  onClick={handleNuevaFormulacion}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  ← Nueva Formulación
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          FlexColor Pro v2.0 — Formulación de color para impresión flexográfica
          <br />
          <span className="text-gray-600">
            Delta E CIEDE2000 (delta-e) • Kubelka-Munk • chroma-js (CIE D65/2°)
          </span>
        </div>
      </footer>
    </div>
  );
}
