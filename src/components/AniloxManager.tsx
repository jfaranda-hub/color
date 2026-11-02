/**
 * Gestión de Anilox - CRUD con persistencia localStorage
 * Permite al usuario gestionar sus rodillos anilox reales
 */

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Wrench, Plus, Trash2, Edit3, Save, X, Printer } from "lucide-react";

export interface AniloxConfig {
  id: string;
  name: string;
  maquina: string;
  lineatura: number; // LPI
  bcm: number; // BCM - volumen de celda
  angle: number; // Ángulo de grabado
  estado: "activo" | "mantenimiento" | "retirado";
  notas: string;
  fechaCreacion: string;
}

const STORAGE_KEY = "flexcolor_anilox_configs";

// Configuraciones por defecto
const defaultAnilox: AniloxConfig[] = [
  {
    id: uuidv4(), name: "Anilox 360/4.0 - Máquina 1", maquina: "Máquina 1",
    lineatura: 360, bcm: 4.0, angle: 60, estado: "activo", notas: "Trabajos estándar", fechaCreacion: new Date().toISOString()
  },
  {
    id: uuidv4(), name: "Anilox 400/3.5 - Máquina 1", maquina: "Máquina 1",
    lineatura: 400, bcm: 3.5, angle: 60, estado: "activo", notas: "Trabajos de alta calidad", fechaCreacion: new Date().toISOString()
  },
  {
    id: uuidv4(), name: "Anilox 500/2.8 - Máquina 2", maquina: "Máquina 2",
    lineatura: 500, bcm: 2.8, angle: 60, estado: "activo", notas: "Procesos finos", fechaCreacion: new Date().toISOString()
  },
  {
    id: uuidv4(), name: "Anilox 600/2.2 - Máquina 2", maquina: "Máquina 2",
    lineatura: 600, bcm: 2.2, angle: 60, estado: "activo", notas: "Cuatricromía", fechaCreacion: new Date().toISOString()
  },
  {
    id: uuidv4(), name: "Anilox 360/6.0 - Máquina 3", maquina: "Máquina 3",
    lineatura: 360, bcm: 6.0, angle: 60, estado: "activo", notas: "Coberturas sólidas", fechaCreacion: new Date().toISOString()
  },
  {
    id: uuidv4(), name: "Anilox 250/10.0 - Máquina 3", maquina: "Máquina 3",
    lineatura: 250, bcm: 10.0, angle: 60, estado: "activo", notas: "Máximo aporte", fechaCreacion: new Date().toISOString()
  },
];

function loadAnilox(): AniloxConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Error loading anilox configs:", e);
  }
  return defaultAnilox;
}

function saveAnilox(configs: AniloxConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

interface Props {
  selected: AniloxConfig | null;
  onSelect: (config: AniloxConfig) => void;
}

export default function AniloxManager({ selected, onSelect }: Props) {
  const [aniloxList, setAniloxList] = useState<AniloxConfig[]>(loadAnilox);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AniloxConfig>>({
    name: "", maquina: "", lineatura: 360, bcm: 4.0, angle: 60, estado: "activo", notas: ""
  });
  const [filterMaquina, setFilterMaquina] = useState("Todas");

  useEffect(() => {
    saveAnilox(aniloxList);
  }, [aniloxList]);

  const maquinas = [...new Set(aniloxList.map(a => a.maquina))];

  const filtered = filterMaquina === "Todas"
    ? aniloxList
    : aniloxList.filter(a => a.maquina === filterMaquina);

  const handleAdd = () => {
    setFormData({ name: "", maquina: "", lineatura: 360, bcm: 4.0, angle: 60, estado: "activo", notas: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (config: AniloxConfig) => {
    setFormData({ ...config });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.maquina || !formData.lineatura || !formData.bcm) return;

    if (editingId) {
      setAniloxList(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } as AniloxConfig : a));
    } else {
      const newConfig: AniloxConfig = {
        id: uuidv4(),
        name: formData.name || `Anilox ${formData.lineatura}/${formData.bcm}`,
        maquina: formData.maquina || "",
        lineatura: formData.lineatura || 360,
        bcm: formData.bcm || 4.0,
        angle: formData.angle || 60,
        estado: formData.estado || "activo",
        notas: formData.notas || "",
        fechaCreacion: new Date().toISOString()
      };
      setAniloxList(prev => [...prev, newConfig]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este anilox?")) {
      setAniloxList(prev => prev.filter(a => a.id !== id));
      if (selected?.id === id) onSelect(aniloxList[0] || ({} as AniloxConfig));
    }
  };

  const estadoColors: Record<string, string> = {
    activo: "bg-green-500/20 text-green-400 border-green-500/50",
    mantenimiento: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    retirado: "bg-red-500/20 text-red-400 border-red-500/50"
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-purple-400" />
          Gestión de Anilox ({aniloxList.length})
        </label>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" /> Nuevo
        </button>
      </div>

      {/* Filtro por máquina */}
      <div className="flex gap-1 mb-3 flex-wrap">
        <button
          onClick={() => setFilterMaquina("Todas")}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            filterMaquina === "Todas" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Todas
        </button>
        {maquinas.map(m => (
          <button
            key={m}
            onClick={() => setFilterMaquina(m)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              filterMaquina === m ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Printer className="w-3 h-3" /> {m}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-800 border border-purple-500/50 rounded-xl p-4 mb-3 space-y-3">
          <h4 className="text-sm font-bold text-white">{editingId ? "Editar" : "Nuevo"} Anilox</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Nombre</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Anilox 360/4.0"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Máquina</label>
              <input
                type="text"
                value={formData.maquina || ""}
                onChange={(e) => setFormData({ ...formData, maquina: e.target.value })}
                placeholder="Ej: Máquina 1"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Lineatura (LPI)</label>
              <input
                type="number"
                value={formData.lineatura || ""}
                onChange={(e) => setFormData({ ...formData, lineatura: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Aporte (BCM)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bcm || ""}
                onChange={(e) => setFormData({ ...formData, bcm: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Ángulo (°)</label>
              <input
                type="number"
                value={formData.angle || ""}
                onChange={(e) => setFormData({ ...formData, angle: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Estado</label>
              <select
                value={formData.estado || "activo"}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="activo">Activo</option>
                <option value="mantenimiento">En mantenimiento</option>
                <option value="retirado">Retirado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Notas</label>
            <input
              type="text"
              value={formData.notas || ""}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
              <Save className="w-3 h-3" /> Guardar
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
              <X className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de anilox */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filtered.map(config => (
          <div
            key={config.id}
            onClick={() => onSelect(config)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
              selected?.id === config.id
                ? "border-purple-500 bg-purple-900/20"
                : "border-gray-700 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">{config.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${estadoColors[config.estado]}`}>
                  {config.estado}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-purple-400">{config.lineatura} LPI</span>
                <span className="text-[10px] text-blue-400">{config.bcm} BCM</span>
                <span className="text-[10px] text-gray-400">{config.angle}°</span>
                <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                  <Printer className="w-2.5 h-2.5" />{config.maquina}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(config); }}
                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Edit3 className="w-3 h-3 text-gray-300" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(config.id); }}
                className="p-1.5 bg-gray-700 hover:bg-red-900/50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3 h-3 text-gray-300" />
              </button>
            </div>
          </div>
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
            Aporte estimado: ~{(selected.bcm * 1.2).toFixed(1)} g/m² | {selected.maquina}
          </div>
        </div>
      )}
    </div>
  );
}
