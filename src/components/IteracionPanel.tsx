import { useState, useRef } from "react";
import Papa from "papaparse";
import {
  Formulacion,
  getDeltaE00,
  calcularLABMezcla,
  labToHex,
  escalarFormulacion,
  evaluateDeltaE,
  calcularAjusteAutomatico,
  LABColor
} from "../utils/colorCalculations";
import { tintasBase } from "../data/tintasBase";
import { Sustrato } from "../data/sustratos";
import { Gauge, Plus, Minus, RotateCcw, ArrowUpCircle, CheckCircle2, AlertTriangle, FileText, Keyboard, Save } from "lucide-react";

interface Props {
  formulacion: Formulacion;
  sustrato: Sustrato;
  targetLAB: LABColor;
  toleranciaDeltaE: number;
  onUpdate: (f: Formulacion) => void;
}

type MetodoEntrada = 'manual' | 'csv';

export default function IteracionPanel({ formulacion, sustrato, targetLAB, toleranciaDeltaE, onUpdate }: Props) {
  const [metodoEntrada, setMetodoEntrada] = useState<MetodoEntrada>('manual');
  const [medicionLAB, setMedicionLAB] = useState<LABColor>({ L: 0, a: 0, b: 0 });
  const [historialMedidas, setHistorialMedidas] = useState<Array<{
    iteracion: number;
    labMedido: LABColor;
    deltaE: number;
    timestamp: string;
  }>>([]);
  const [iteracionActual, setIteracionActual] = useState(0);
  const MAX_ITERACIONES = 5;
  const [ajusteRecomendado, setAjusteRecomendado] = useState<ReturnType<typeof calcularAjusteAutomatico> | null>(null);
  const [aprobado, setAprobado] = useState(false);
  const [escalaGramos, setEscalaGramos] = useState(1000);
  const [showManualAdjust, setShowManualAdjust] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        console.log("📄 Datos CSV crudos:", results.data);
        const data = results.data as string[][];
        
        if (data.length === 0) {
          alert("El archivo CSV está vacío.");
          return;
        }

        // ESTRATEGIA 1: Buscar cabeceras L, a, b en la primera fila
        const headerRow = data[0];
        let lIndex = -1, aIndex = -1, bIndex = -1;
        
        if (headerRow && headerRow.length > 0) {
          headerRow.forEach((header, idx) => {
            const h = header.trim().toLowerCase();
            if (h === 'l' || h === 'l*' || h.includes('luminosidad')) lIndex = idx;
            if (h === 'a' || h === 'a*' || h.includes('rojo')) aIndex = idx;
            if (h === 'b' || h === 'b*' || h.includes('amarillo')) bIndex = idx;
          });
        }

        let lastValidRow: LABColor | null = null;

        if (lIndex >= 0 && aIndex >= 0 && bIndex >= 0) {
          console.log(`✅ Cabeceras encontradas: L=${lIndex}, a=${aIndex}, b=${bIndex}`);
          // Buscar la última fila con datos numéricos válidos
          for (let i = data.length - 1; i >= 1; i--) { // Empezar desde 1 para saltar cabecera
            const row = data[i];
            if (row && row.length > Math.max(lIndex, aIndex, bIndex)) {
              const L = parseFloat(row[lIndex]);
              const a = parseFloat(row[aIndex]);
              const b = parseFloat(row[bIndex]);
              
              if (!isNaN(L) && !isNaN(a) && !isNaN(b) && L > 0 && L <= 100) {
                lastValidRow = { L, a, b };
                console.log(`✅ Datos válidos encontrados en fila ${i}:`, lastValidRow);
                break;
              }
            }
          }
        } else {
          console.log("⚠️ No se encontraron cabeceras claras, usando fallback...");
          // ESTRATEGIA 2: Fallback - buscar última fila con 3 valores numéricos
          for (let i = data.length - 1; i >= 0; i--) {
            const row = data[i];
            if (row && row.length >= 3) {
              const L = parseFloat(row[0]);
              const a = parseFloat(row[1]);
              const b = parseFloat(row[2]);
              
              if (!isNaN(L) && !isNaN(a) && !isNaN(b) && L > 0 && L <= 100) {
                lastValidRow = { L, a, b };
                console.log(`✅ Fallback: datos válidos en fila ${i}:`, lastValidRow);
                break;
              }
            }
          }
        }

        if (lastValidRow) {
          setMedicionLAB(lastValidRow);
        } else {
          alert("No se encontraron datos LAB válidos en el CSV. Asegúrate de que el archivo tenga columnas L, a, b.");
        }
      },
      error: (error) => {
        console.error("❌ Error al leer CSV:", error);
        alert(`Error al leer el CSV: ${error.message}`);
      }
    });
  };

  const handleRegistrarMedida = () => {
    if (medicionLAB.L === 0 && medicionLAB.a === 0 && medicionLAB.b === 0) {
      alert("Por favor, introduce o carga los valores LAB antes de registrar.");
      return;
    }

    const deltaE = getDeltaE00(medicionLAB, targetLAB);
    console.log("📏 DeltaE calculado:", deltaE, "Tolerancia:", toleranciaDeltaE);
    
    // Añadir al historial
    const nuevaMedida = {
      iteracion: iteracionActual + 1,
      labMedido: { ...medicionLAB },
      deltaE: Math.round(deltaE * 100) / 100,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setHistorialMedidas([...historialMedidas, nuevaMedida]);
    setIteracionActual(iteracionActual + 1);

    // Verificar si está dentro de tolerancia
    if (deltaE <= toleranciaDeltaE) {
      console.log("✅ APROBADO - DeltaE dentro de tolerancia");
      setAprobado(true);
      setAjusteRecomendado(null);
      setShowManualAdjust(false);
    } else {
      console.log("⚠️ RECHAZADO - Calculando ajuste automático...");
      // Calcular ajuste automático recomendado
      const ajuste = calcularAjusteAutomatico(
        medicionLAB,
        targetLAB,
        formulacion.insumos,
        tintasBase,
        sustrato
      );
      console.log("🔧 Resultado de calcularAjusteAutomatico:", ajuste);
      setAjusteRecomendado(ajuste);
      setAprobado(false);
    }

    // Resetear input
    setMedicionLAB({ L: 0, a: 0, b: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAplicarAjuste = () => {
    if (!ajusteRecomendado) return;

    console.log("🔧 Aplicando ajuste recomendado:", ajusteRecomendado);

    // Actualizar formulación añadiendo los gramos recomendados
    const insumosActualizados = formulacion.insumos.map(inp => {
      if (inp.tintaId === ajusteRecomendado.tintaId) {
        return {
          ...inp,
          gramos: Math.round((inp.gramos + ajusteRecomendado.gramosAñadir) * 100) / 100
        };
      }
      return inp;
    });

    // Verificar si la tinta ya existía, si no, añadirla
    const tintaExiste = insumosActualizados.some(inp => inp.tintaId === ajusteRecomendado.tintaId);
    if (!tintaExiste) {
      insumosActualizados.push({
        tintaId: ajusteRecomendado.tintaId,
        tintaName: ajusteRecomendado.tintaName,
        gramos: ajusteRecomendado.gramosAñadir,
        porcentaje: 0
      });
    }

    // Recalcular porcentajes
    const totalGramos = insumosActualizados.reduce((sum, inp) => sum + inp.gramos, 0);
    const insumosFinales = insumosActualizados.map(inp => ({
      ...inp,
      porcentaje: Math.round((inp.gramos / totalGramos) * 10000) / 100
    }));

    console.log("✅ Ajuste aplicado. Nuevos insumos:", insumosFinales);

    // Recalcular LAB estimado
    const labEstimado = calcularLABMezcla(insumosFinales, tintasBase, sustrato);
    const deltaE = getDeltaE00(labEstimado, targetLAB);

    // Actualizar formulación
    onUpdate({
      ...formulacion,
      insumos: insumosFinales,
      totalGramos: Math.round(totalGramos * 100) / 100,
      labEstimado,
      deltaE: Math.round(deltaE * 100) / 100
    });

    // Limpiar ajuste recomendado y medición para que el operador mida de nuevo
    setAjusteRecomendado(null);
    setShowManualAdjust(false);
    setMedicionLAB({ L: 0, a: 0, b: 0 });
    console.log("🧹 Limpieza completada. Listo para nueva medición.");
  };

  const handleAjusteManual = (tintaId: string, delta: number) => {
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

  const handleGuardarReceta = () => {
    const costeTotal = formulacion.insumos.reduce((total, inp) => {
      const tinta = tintasBase.find(t => t && t.id === inp.tintaId);
      if (!tinta) return total;
      const factorEscala = escalaGramos / formulacion.totalGramos;
      const gramosEscalados = inp.gramos * factorEscala;
      const coste = (gramosEscalados / 1000) * tinta.costPerKg;
      return total + coste;
    }, 0);

    const recetaMaestra = {
      color: targetLAB,
      sustrato: sustrato.name,
      recetaFinal: formulacion,
      historialIteraciones: historialMedidas,
      costeTotal: Math.round(costeTotal * 100) / 100,
      fecha: new Date().toISOString()
    };

    console.log("💾 Receta Maestra Guardada:", recetaMaestra);
    alert(`✅ Receta Maestra guardada en consola.\n\nCoste estimado: ${costeTotal.toFixed(2)} €\n\nRevisa la consola del navegador (F12) para ver todos los detalles.`);
  };

  const limiteAlcanzado = iteracionActual >= MAX_ITERACIONES && !aprobado;

  // Calcular coste total
  const costeTotal = formulacion.insumos.reduce((total, inp) => {
    const tinta = tintasBase.find(t => t && t.id === inp.tintaId);
    if (!tinta) return total;
    const factorEscala = escalaGramos / formulacion.totalGramos;
    const gramosEscalados = inp.gramos * factorEscala;
    const coste = (gramosEscalados / 1000) * tinta.costPerKg;
    return total + coste;
  }, 0);

  return (
    <div className="space-y-4">
      {/* 1. Sección de Historial */}
      {historialMedidas.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>📊</span> Historial de Mediciones
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-2 text-gray-400">#</th>
                  <th className="text-left py-2 px-2 text-gray-400">L*</th>
                  <th className="text-left py-2 px-2 text-gray-400">a*</th>
                  <th className="text-left py-2 px-2 text-gray-400">b*</th>
                  <th className="text-left py-2 px-2 text-gray-400">ΔE*00</th>
                  <th className="text-left py-2 px-2 text-gray-400">Hora</th>
                </tr>
              </thead>
              <tbody>
                {historialMedidas.map((medida, idx) => (
                  <tr key={idx} className="border-b border-gray-700/50">
                    <td className="py-2 px-2 text-white font-bold">{medida.iteracion}</td>
                    <td className="py-2 px-2 text-white">{medida.labMedido.L.toFixed(1)}</td>
                    <td className="py-2 px-2 text-white">{medida.labMedido.a.toFixed(1)}</td>
                    <td className="py-2 px-2 text-white">{medida.labMedido.b.toFixed(1)}</td>
                    <td className="py-2 px-2">
                      <span className={`font-bold ${medida.deltaE <= toleranciaDeltaE ? 'text-green-400' : 'text-orange-400'}`}>
                        {medida.deltaE.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-400">{medida.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerta de límite de iteraciones */}
      {limiteAlcanzado && (
        <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-2">
                ⚠️ Se alcanzó el límite de 5 iteraciones sin aprobar
              </h3>
              <p className="text-sm text-red-300">
                Por favor, revise la tinta base, el sustrato o el estado del anilox.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sección de Captura de Medida */}
      {!aprobado && !limiteAlcanzado && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">
              Medición Colorímetro - Iteración {iteracionActual + 1}
            </h3>
          </div>

          {/* Selector de método de entrada */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMetodoEntrada('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                metodoEntrada === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Manual
            </button>
            <button
              onClick={() => setMetodoEntrada('csv')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                metodoEntrada === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              Importar CSV Linshang
            </button>
          </div>

          {/* Input manual */}
          {metodoEntrada === 'manual' && (
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
          )}

          {/* Input CSV */}
          {metodoEntrada === 'csv' && (
            <div className="mb-3">
              <label className="text-xs text-gray-400 block mb-2">
                Selecciona el archivo CSV exportado del colorímetro Linshang
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer cursor-pointer"
              />
              {(medicionLAB.L > 0 || medicionLAB.a !== 0 || medicionLAB.b !== 0) && (
                <div className="mt-2 p-2 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <div className="text-xs text-green-400 font-bold mb-1">✓ Datos cargados desde CSV:</div>
                  <div className="text-xs text-gray-300 font-mono">
                    L: {medicionLAB.L.toFixed(2)} | a: {medicionLAB.a.toFixed(2)} | b: {medicionLAB.b.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botón registrar medida */}
          <button
            onClick={handleRegistrarMedida}
            disabled={metodoEntrada === 'manual' && medicionLAB.L === 0 && medicionLAB.a === 0 && medicionLAB.b === 0}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-sm transition-colors"
          >
            📏 Registrar Medida de la Iteración {iteracionActual + 1}
          </button>
        </div>
      )}

      {/* 3. Sección de Resultado y Corrección */}
      {ajusteRecomendado && !aprobado && !limiteAlcanzado && (
        <div className="bg-orange-900/20 border-2 border-orange-500 rounded-xl p-4">
          <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
            🔧 Ajuste Automático Recomendado
          </h3>
          
          <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-200 leading-relaxed">
              {ajusteRecomendado.explicacion}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAplicarAjuste}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              ✅ Aplicar este Ajuste a la Mezcla
            </button>
            <button
              onClick={() => setShowManualAdjust(!showManualAdjust)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              🛠️ Ajuste Manual
            </button>
          </div>
        </div>
      )}

      {/* Ajuste manual (opcional) */}
      {showManualAdjust && !aprobado && !limiteAlcanzado && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>🛠️</span> Ajuste Manual (±0.1g por clic)
          </h3>

          <div className="space-y-2">
            {formulacion.insumos.map(inp => (
              <div key={inp.tintaId} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{inp.tintaName}</div>
                  <div className="text-[10px] text-gray-400">{inp.gramos.toFixed(2)}g</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAjusteManual(inp.tintaId, -0.1)}
                    className="w-7 h-7 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-red-400" />
                  </button>
                  <button
                    onClick={() => handleAjusteManual(inp.tintaId, -0.05)}
                    className="w-6 h-6 bg-red-900/30 hover:bg-red-800/50 border border-red-800 rounded text-[10px] text-red-400 font-bold transition-colors"
                  >
                    -05
                  </button>
                  <button
                    onClick={() => handleAjusteManual(inp.tintaId, 0.05)}
                    className="w-6 h-6 bg-green-900/30 hover:bg-green-800/50 border border-green-800 rounded text-[10px] text-green-400 font-bold transition-colors"
                  >
                    +05
                  </button>
                  <button
                    onClick={() => handleAjusteManual(inp.tintaId, 0.1)}
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

      {/* Panel de APROBADO */}
      {aprobado && (
        <div className="bg-green-900/30 border-2 border-green-500 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-green-400">✅ ¡APROBADO!</h3>
              <p className="text-sm text-green-300">
                Delta E*00 dentro de tolerancia (≤ {toleranciaDeltaE.toFixed(1)})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sección de Escalado a Producción */}
      {aprobado && (
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-bold text-white">Escalar a Producción</h3>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Gramos objetivo (100-1000g)</label>
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

          {/* Coste estimado */}
          <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-400 mb-1">Coste estimado de la mezcla:</div>
            <div className="text-2xl font-bold text-green-400">
              {costeTotal.toFixed(2)} €
            </div>
            <div className="text-[10px] text-gray-500">
              Para {escalaGramos}g de mezcla final
            </div>
          </div>

          {/* Botón guardar receta */}
          <button
            onClick={handleGuardarReceta}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            💾 Guardar Receta Maestra
          </button>
        </div>
      )}

      {/* Visualización del color medido vs objetivo */}
      {historialMedidas.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <div className="text-[10px] text-gray-400">Última Medición</div>
            <div
              className="w-full h-10 rounded-lg border border-gray-600"
              style={{ backgroundColor: labToHex(
                historialMedidas[historialMedidas.length - 1].labMedido.L,
                historialMedidas[historialMedidas.length - 1].labMedido.a,
                historialMedidas[historialMedidas.length - 1].labMedido.b
              ) }}
            />
            <div className="text-[9px] text-gray-500 font-mono mt-1">
              {historialMedidas[historialMedidas.length - 1].labMedido.L.toFixed(1)}/
              {historialMedidas[historialMedidas.length - 1].labMedido.a.toFixed(1)}/
              {historialMedidas[historialMedidas.length - 1].labMedido.b.toFixed(1)}
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
