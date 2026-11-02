import { Shield } from "lucide-react";

export interface Resistencias {
  luz: boolean;
  solvente: boolean;
  jabon: boolean;
  grasa: boolean;
  alcalino: boolean;
}

interface Props {
  resistencias: Resistencias;
  onChange: (resistencias: Resistencias) => void;
}

const opciones: { key: keyof Resistencias; label: string; icon: string }[] = [
  { key: 'luz', label: 'Luz (≥7)', icon: '☀️' },
  { key: 'solvente', label: 'Solventes', icon: '🧪' },
  { key: 'jabon', label: 'Jabón', icon: '🧼' },
  { key: 'grasa', label: 'Grasa', icon: '🛢️' },
  { key: 'alcalino', label: 'Álcalis', icon: '⚗️' },
];

export default function ResistenciasSelector({ resistencias, onChange }: Props) {
  const toggle = (key: keyof Resistencias) => {
    onChange({ ...resistencias, [key]: !resistencias[key] });
  };

  const activas = Object.values(resistencias).filter(Boolean).length;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
        <Shield className="w-4 h-4 text-amber-400" />
        Resistencias Requeridas
        {activas > 0 && (
          <span className="text-[10px] bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full">
            {activas} activa{activas !== 1 ? 's' : ''}
          </span>
        )}
      </label>
      <div className="grid grid-cols-5 gap-2">
        {opciones.map(op => (
          <button
            key={op.key}
            onClick={() => toggle(op.key)}
            className={`p-2 rounded-xl border-2 transition-all text-center ${
              resistencias[op.key]
                ? "border-amber-500 bg-amber-900/20"
                : "border-gray-700 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="text-lg mb-0.5">{op.icon}</div>
            <div className="text-[9px] font-medium text-gray-300">{op.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
