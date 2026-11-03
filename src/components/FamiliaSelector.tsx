import { FamiliaTinta } from "../data/tintasBase";
import { Layers } from "lucide-react";

interface Props {
  selected: FamiliaTinta | 'todas';
  onSelect: (f: FamiliaTinta | 'todas') => void;
}

const opciones: { value: FamiliaTinta | 'todas'; label: string; description: string }[] = [
  { value: 'standard-pantone', label: 'Standard Pantone', description: 'Pantone estándar' },
  { value: 'hs-pantone', label: 'HS Pantone', description: 'High Strength Pantone' },
  { value: 'hr-pantone', label: 'HR Pantone', description: 'High Resistance Pantone' },
  { value: 'todas', label: 'Todas', description: 'Todas las familias' },
];

export default function FamiliaSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-400" />
        Familia de Tinta
      </label>
      <div className="grid grid-cols-2 gap-2">
        {opciones.map(op => (
          <button
            key={op.value}
            onClick={() => onSelect(op.value)}
            className={`p-3 rounded-xl border-2 transition-all text-left ${
              selected === op.value
                ? "border-indigo-500 bg-indigo-900/20 shadow-lg shadow-indigo-500/10"
                : "border-gray-700 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="text-xs font-bold text-white">{op.label}</div>
            <div className="text-[10px] text-gray-400">{op.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
