/**
 * Calibración de Sustratos con Colorímetro
 * 
 * Permite al operador medir el punto blanco real de cada sustrato/lote
 * con el colorímetro y guardar los valores LAB para usar en formulaciones.
 * 
 * Esto es crítico porque:
 * - Cada lote de sustrato puede variar
 * - El punto blanco afecta directamente el resultado final
 * - Las correcciones teóricas se ajustan con datos reales medidos
 */

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Sustrato, sustratos } from "../data/sustratos";
import { getDeltaE00, labToHex, evaluateDeltaE, LABColor } from "../utils/colorCalculations";
import { ScanLine, Plus, Trash2, Droplets, Save, AlertCircle } from "lucide-react";

export interface SustratoCalibrado {
  id: string;
  sustratoId: string;
  sustratoName: string;
  lote: string;
  fechaMedicion: string;
  medicionLAB: LABColor;
  notas: string;
  esReferencia: boolean; // Si es true, se usa como punto blanco por defecto
}

const STORAGE_KEY = "flexcolor_sustratos_calibrados";

// Calibraciones por defecto (valores teóricos como referencia)
const defaultCalibraciones: SustratoCalibrado[] = sustratos.map(s => ({
  id: uuidv4(),
  sustratoId: s.id,
  sustratoName: s.name,
  lote: "Referencia teórica",
  fechaMedicion: new Date().toISOString(),
  medicionLAB: { ...s.whitePoint },
  notas: "Valores teóricos - Medir con colorímetro para calibrar",
  esReferencia: true
}));

function loadCalibraciones(): SustratoCalibrado[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Error loading calibrations:", e);
  }
  return defaultCalibraciones;
}

function saveCalibraciones(calibraciones: SustratoCalibrado[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calibraciones));
}

interface Props {
  onCalibrationUpdate?: () => void;
}

export default function SustratoCalibration({ onCalibrationUpdate }: Props) {
  const [calibraciones, setCalibraciones] = useState<SustratoCalibrado[]>(loadCalibraciones);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sustratoId: sustratos[0]?.id || "",
    lote: "",
    L: 0,
    a: 0,
    b: 0,
    notas: "",
    esReferencia: false
  });
  const [filterSustrato, setFilterSustrato] = useState("Todos");

  useEffect(() => {
    saveCalibraciones(calibraciones);
    onCalibrationUpdate?.();
  }, [calibraciones]);

  const filtered = filterSustrato === "Todos"
    ? calibraciones
    : calibraciones.filter(c => c.sustratoId === filterSustrato);

  const handleAdd = () => {
    setFormData({
      sustratoId: sustratos[0]?.id || "",
      lote: "",
      L: 0, a: 0, b: 0,
      notas: "",
      esReferencia: false
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.L && !formData.a && !formData.b) return;
    if (!formData.lote) return;

    const sustrato = sustratos.find(s => s.id === formData.sustratoId);
    if (!sustrato) return;

    const newCal: SustratoCalibrado = {
      id: uuidv4(),
      sustratoId: formData.sustratoId,
      sustratoName: sustrato.name,
      lote: formData.lote,
      fechaMedicion: new Date().toISOString(),
      medicionLAB: { L: formData.L, a: formData.a, b: formData.b },
      notas: formData.notas,
      esReferencia: formData.esReferencia
    };

    // Si es referencia, desactivar otras referencias del mismo sustrato
    let updated = [...calibraciones];
    if (formData.esReferencia) {
      updated = updated.map(c =>
        c.sustratoId === formData.sustratoId ? { ...c, esReferencia: false } : c
      );
    }

    setCalibraciones([...updated, newCal]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar esta calibración?")) {
      setCalibraciones(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSetReferencia = (id: string) => {
    const cal = calibraciones.find(c => c.id === id);
    if (!cal) return;

    const updated = calibraciones.map(c =>
      c.sustratoId === cal.sustratoId ? { ...c, esReferencia: c.id === id } : c
    );
    setCalibraciones(updated);
  };

  // Obtener la calibración de referencia para un sustrato
  const getReferencia = (sustratoId: string): SustratoCalibrado | undefined => {
    return calibraciones.find(c => c.sustratoId === sustratoId && c.esReferencia);
  };

  // Calcular desviación entre calibraciones del mismo sustrato
  const getDesviacion = (cal: SustratoCalibrado): number | null => {
    const ref = calibraciones.find(c => c.sustratoId === cal.sustratoId && c.esReferencia && c.id !== cal.id);
    if (!ref) return null;
    return getDeltaE00(cal.medicionLAB, ref.medicionLAB);
  };

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Calibración de Sustratos</h3>
          <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded-full">
            {calibraciones.length} registros
          </span>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" /> Nueva Medición
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Mide el punto blanco de cada lote de sustrato con el colorímetro para calibrar las formulaciones.
        Los valores medidos reemplazan las estimaciones teóricas.
      </p>

      {/* Filtro */}
      <div className="flex gap-1 mb-3 flex-wrap">
        <button
          onClick={() => setFilterSustrato("Todos")}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            filterSustrato === "Todos" ? "bg-cyan-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Todos
        </button>
        {sustratos.map(s => (
          <button
            key={s.id}
            onClick={() => setFilterSustrato(s.id)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
              filterSustrato === s.id ? "bg-cyan-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {s.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-800 border border-cyan-500/50 rounded-xl p-4 mb-3 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Nueva Medición de Sustrato
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Sustrato</label>
              <select
                value={formData.sustratoId}
                onChange={(e) => setFormData({ ...formData, sustratoId: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {sustratos.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Nº de Lote</label>
              <input
                type="text"
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                placeholder="Ej: Lote 2024-001"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 mb-2 font-semibold">
              📏 Valores del Colorímetro (medir zona blanca del sustrato)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">L* (Luminosidad)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.L || ""}
                  onChange={(e) => setFormData({ ...formData, L: parseFloat(e.target.value) || 0 })}
                  placeholder="90-100"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">a* (Rojo/Verde)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.a || ""}
                  onChange={(e) => setFormData({ ...formData, a: parseFloat(e.target.value) || 0 })}
                  placeholder="-5 a +5"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">b* (Amarillo/Azul)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.b || ""}
                  onChange={(e) => setFormData({ ...formData, b: parseFloat(e.target.value) || 0 })}
                  placeholder="-5 a +15"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            {(formData.L > 0 || formData.a !== 0 || formData.b !== 0) && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-500"
                  style={{ backgroundColor: labToHex(formData.L, formData.a, formData.b) }}
                />
                <span className="text-xs text-gray-400">
                  Color medido del sustrato
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Notas</label>
            <input
              type="text"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Condiciones de medición, observaciones..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.esReferencia}
              onChange={(e) => setFormData({ ...formData, esReferencia: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-xs text-gray-300">Establecer como referencia para este sustrato</span>
          </label>

          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
              <Save className="w-3 h-3" /> Guardar Medición
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de calibraciones */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map(cal => {
          const desviacion = getDesviacion(cal);
          const evalDesv = desviacion !== null ? evaluateDeltaE(desviacion) : null;

          return (
            <div key={cal.id} className="flex items-center gap-3 p-2.5 bg-gray-800/50 rounded-lg border border-gray-700">
              <div
                className="w-8 h-8 rounded border border-gray-500 flex-shrink-0"
                style={{ backgroundColor: labToHex(cal.medicionLAB.L, cal.medicionLAB.a, cal.medicionLAB.b) }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">{cal.sustratoName}</span>
                  {cal.esReferencia && (
                    <span className="text-[9px] bg-cyan-900/50 text-cyan-400 px-1.5 py-0.5 rounded">REF</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">Lote: {cal.lote}</span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {cal.medicionLAB.L.toFixed(1)}/{cal.medicionLAB.a.toFixed(1)}/{cal.medicionLAB.b.toFixed(1)}
                  </span>
                </div>
                {desviacion !== null && evalDesv && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" style={{ color: evalDesv.color }} />
                    <span className="text-[9px]" style={{ color: evalDesv.color }}>
                      ΔE {desviacion.toFixed(2)} vs ref: {evalDesv.rating}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!cal.esReferencia && (
                  <button
                    onClick={() => handleSetReferencia(cal.id)}
                    className="p-1.5 bg-gray-700 hover:bg-cyan-900/50 rounded text-[9px] text-cyan-400 font-bold"
                    title="Establecer como referencia"
                  >
                    REF
                  </button>
                )}
                <button
                  onClick={() => handleDelete(cal.id)}
                  className="p-1.5 bg-gray-700 hover:bg-red-900/50 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-500">
          No hay calibraciones para este sustrato. Añade una medición con el colorímetro.
        </div>
      )}
    </div>
  );
}

// Exportar función para obtener calibración de referencia
export function getCalibracionReferencia(sustratoId: string): SustratoCalibrado | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const calibraciones: SustratoCalibrado[] = JSON.parse(stored);
      return calibraciones.find(c => c.sustratoId === sustratoId && c.esReferencia) || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
}
