import { Sustrato, sustratos } from "../data/sustratos";

interface Props {
  selected: Sustrato | null;
  onSelect: (sustrato: Sustrato) => void;
}

export default function SustratoSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        📋 Sustrato de Impresión
      </label>
      <div className="grid grid-cols-2 gap-2">
        {sustratos.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
              selected?.id === s.id
                ? "border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/10"
                : "border-gray-700 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div
              className="w-8 h-8 rounded-lg border border-gray-500 flex-shrink-0 shadow-inner"
              style={{ backgroundColor: s.color }}
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{s.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{s.description}</div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-xs font-semibold text-gray-400 mb-2">Propiedades del Sustrato:</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-bold text-blue-400">{(selected.opacity * 100).toFixed(0)}%</div>
              <div className="text-[10px] text-gray-400">Opacidad</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-bold text-green-400">{(selected.inkAbsorption * 100).toFixed(0)}%</div>
              <div className="text-[10px] text-gray-400">Absorción</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-bold text-purple-400">
                L:{selected.whitePoint.L.toFixed(0)}
              </div>
              <div className="text-[10px] text-gray-400">Punto Blanco</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
