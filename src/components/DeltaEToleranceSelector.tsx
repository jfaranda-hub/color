import { useState } from "react";
import { Target, AlertCircle } from "lucide-react";

export interface DeltaETolerance {
  id: string;
  name: string;
  value: number;
  description: string;
  useCase: string;
}

export const toleranceLevels: DeltaETolerance[] = [
  {
    id: "premium",
    name: "Premium",
    value: 1.0,
    description: "ΔE ≤ 1.0",
    useCase: "Marcas de lujo, packaging farmacéutico"
  },
  {
    id: "estandar",
    name: "Estándar",
    value: 2.0,
    description: "ΔE ≤ 2.0",
    useCase: "Trabajos comerciales estándar"
  },
  {
    id: "amplio",
    name: "Amplio",
    value: 3.5,
    description: "ΔE ≤ 3.5",
    useCase: "Trabajos internos, no críticos"
  },
  {
    id: "personalizado",
    name: "Personalizado",
    value: 2.0,
    description: "ΔE ≤ 2.0",
    useCase: "Definir tolerancia específica"
  }
];

interface Props {
  tolerance: DeltaETolerance;
  customValue: number;
  onToleranceChange: (tolerance: DeltaETolerance) => void;
  onCustomValueChange: (value: number) => void;
}

export default function DeltaEToleranceSelector({
  tolerance,
  customValue,
  onToleranceChange,
  onCustomValueChange
}: Props) {
  const [showCustom, setShowCustom] = useState(tolerance.id === "personalizado");

  const handleSelect = (tol: DeltaETolerance) => {
    if (tol.id === "personalizado") {
      setShowCustom(true);
      onToleranceChange({ ...tol, value: customValue });
    } else {
      setShowCustom(false);
      onToleranceChange(tol);
    }
  };

  const effectiveValue = tolerance.id === "personalizado" ? customValue : tolerance.value;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-orange-400" />
        <h3 className="text-sm font-bold text-white">Tolerancia ΔE Permitida</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {toleranceLevels.filter(t => t.id !== "personalizado").map(tol => (
          <button
            key={tol.id}
            onClick={() => handleSelect(tol)}
            className={`p-3 rounded-xl border-2 transition-all text-left ${
              tolerance.id === tol.id
                ? "border-orange-500 bg-orange-900/20"
                : "border-gray-700 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{tol.name}</span>
              <span className="text-lg font-black text-orange-400">{tol.value}</span>
            </div>
            <div className="text-[10px] text-gray-400">{tol.useCase}</div>
          </button>
        ))}
      </div>

      {/* Opción personalizada */}
      <button
        onClick={() => handleSelect(toleranceLevels.find(t => t.id === "personalizado")!)}
        className={`w-full p-3 rounded-xl border-2 transition-all text-left mb-3 ${
          showCustom
            ? "border-orange-500 bg-orange-900/20"
            : "border-gray-700 bg-gray-800 hover:border-gray-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Personalizado</span>
          {showCustom && (
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="10"
              value={customValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 2.0;
                onCustomValueChange(val);
                onToleranceChange({ ...toleranceLevels[3], value: val });
              }}
              className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm text-right focus:outline-none focus:border-orange-500"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
        <div className="text-[10px] text-gray-400 mt-1">Definir tolerancia específica</div>
      </button>

      {/* Info de tolerancia actual */}
      <div className="bg-gray-900/50 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300">
          <span className="font-bold text-orange-400">Tolerancia actual: ΔE ≤ {effectiveValue.toFixed(1)}</span>
          <br />
          <span className="text-gray-400">
            {effectiveValue <= 1.0 && "Diferencia imperceptible. Aprobación garantizada."}
            {effectiveValue > 1.0 && effectiveValue <= 2.0 && "Match comercial aceptable. Estándar de la industria."}
            {effectiveValue > 2.0 && effectiveValue <= 3.5 && "Tolerancia amplia. Diferencia visible pero aceptable."}
            {effectiveValue > 3.5 && "Tolerancia muy amplia. Solo para trabajos no críticos."}
          </span>
        </div>
      </div>
    </div>
  );
}
