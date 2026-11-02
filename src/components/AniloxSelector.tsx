import { AniloxConfig, aniloxConfigs } from "../data/tintasBase";
import { Settings2 } from "lucide-react";

interface Props {
  selected: AniloxConfig | null;
  onSelect: (config: AniloxConfig) => void;
}

export default function AniloxSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        <span className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-purple-400" />
          Configuración Anilox / Lineatura
        </span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {aniloxConfigs.map(config => (
          <button
            key={config.id}
            onClick={() => onSelect(config)}
            className={`p-2.5 rounded-xl border-2 transition-all text-center ${
              selected?.id === config.id
                ? "border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/10"
                : "border-gray-700 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="text-xs font-bold text-white">{config.lineatura} LPI</div>
            <div className="text-[10px] text-gray-400">{config.bcm} BCM</div>
            <div className="text-[10px] text-purple-400">{config.angle}°</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-purple-400">{selected.lineatura}</div>
              <div className="text-[10px] text-gray-400">LPI</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">{selected.bcm}</div>
              <div className="text-[10px] text-gray-400">BCM</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{selected.angle}°</div>
              <div className="text-[10px] text-gray-400">Ángulo</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 text-center">
            Aporte de tinta estimado: ~{(selected.bcm * 1.2).toFixed(1)} g/m²
          </div>
        </div>
      )}
    </div>
  );
}
