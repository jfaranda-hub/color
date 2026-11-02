import { useState } from "react";
import { useTintasBase } from "../hooks/useTintasBase";
import { TintaBase, FamiliaTinta } from "../data/tintasBase";
import { v4 as uuidv4 } from "uuid";
import { Plus, Edit3, Trash2, RotateCcw, Palette, Ruler } from "lucide-react";

type ModalMode = 'closed' | 'add' | 'edit' | 'measure';

interface FormData {
  codigoFlint: string;
  name: string;
  familia: FamiliaTinta;
  color: string;
  lab: { L: number; a: number; b: number };
  tintingStrength: number;
  opacity: number;
  maxConcentration: number;
  costPerKg: number;
  lightFastness: number;
  solventResistance: boolean;
  soapResistance: boolean;
  greaseResistance: boolean;
  alkalineResistance: boolean;
  aniloxRecomendado?: {
    linesCm: [number, number];
    volumeCm3: [number, number];
  };
}

const familias: { value: FamiliaTinta; label: string }[] = [
  { value: 'standard-process', label: 'Standard Process' },
  { value: 'hs-process', label: 'HS Process' },
  { value: 'standard-pantone', label: 'Standard Pantone' },
  { value: 'hs-pantone', label: 'HS Pantone' },
  { value: 'hr-pantone', label: 'HR Pantone' },
  { value: 'otros', label: 'Otros' },
];

const initialFormData: FormData = {
  codigoFlint: '',
  name: '',
  familia: 'standard-pantone',
  color: '#FF0000',
  lab: { L: 50, a: 0, b: 0 },
  tintingStrength: 1.0,
  opacity: 0.5,
  maxConcentration: 50,
  costPerKg: 25,
  lightFastness: 5,
  solventResistance: true,
  soapResistance: true,
  greaseResistance: true,
  alkalineResistance: false,
};

export default function TintasBaseManager() {
  const { tintas, añadirTinta, editarTinta, eliminarTinta, resetear } = useTintasBase();
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const openAddModal = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setModalMode('add');
  };

  const openEditModal = (tinta: TintaBase) => {
    setFormData({
      codigoFlint: tinta.codigoFlint || '',
      name: tinta.name,
      familia: tinta.familia,
      color: tinta.color,
      lab: { ...tinta.lab },
      tintingStrength: tinta.tintingStrength,
      opacity: tinta.opacity,
      maxConcentration: tinta.maxConcentration,
      costPerKg: tinta.costPerKg,
      lightFastness: tinta.lightFastness || 5,
      solventResistance: tinta.solventResistance || false,
      soapResistance: tinta.soapResistance || false,
      greaseResistance: tinta.greaseResistance || false,
      alkalineResistance: tinta.alkalineResistance || false,
      aniloxRecomendado: tinta.aniloxRecomendado,
    });
    setEditingId(tinta.id);
    setModalMode('edit');
  };

  const openMeasureModal = () => {
    setFormData({ ...initialFormData, lab: { L: 0, a: 0, b: 0 } });
    setEditingId(null);
    setModalMode('measure');
  };

  const closeModal = () => {
    setModalMode('closed');
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    const tintaData: TintaBase = {
      id: editingId || uuidv4(),
      codigoFlint: formData.codigoFlint || undefined,
      name: formData.name,
      familia: formData.familia,
      color: formData.color,
      lab: formData.lab,
      tintingStrength: formData.tintingStrength,
      opacity: formData.opacity,
      maxConcentration: formData.maxConcentration,
      costPerKg: formData.costPerKg,
      lightFastness: formData.lightFastness,
      solventResistance: formData.solventResistance,
      soapResistance: formData.soapResistance,
      greaseResistance: formData.greaseResistance,
      alkalineResistance: formData.alkalineResistance,
      aniloxRecomendado: formData.aniloxRecomendado,
    };

    if (modalMode === 'edit' && editingId) {
      editarTinta(editingId, tintaData);
    } else {
      añadirTinta(tintaData);
    }

    closeModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar la tinta "${name}"?`)) {
      eliminarTinta(id);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Resetear todas las tintas a los valores de fábrica?')) {
      if (window.confirm('Esta acción no se puede deshacer. ¿Confirmar?')) {
        resetear();
      }
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, color: e.target.value });
  };

  return (
    <div className="space-y-4">
      {/* Header con botones */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          Gestión de Tintas Base ({tintas.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={openMeasureModal}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Ruler className="w-4 h-4" />
            Medir Tinta
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir Nueva
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Resetear
          </button>
        </div>
      </div>

      {/* Tabla de tintas */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Código Flint</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Nombre</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Familia</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Color</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">L</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">a</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">b</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Opacidad</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Fuerza</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Coste/kg</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tintas.map(tinta => (
                <tr key={tinta.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-gray-300 font-mono text-xs">{tinta.codigoFlint || '-'}</td>
                  <td className="py-3 px-4 text-white font-medium">{tinta.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {tinta.familia}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: tinta.color }}
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-mono">{tinta.lab.L.toFixed(1)}</td>
                  <td className="py-3 px-4 text-gray-300 font-mono">{tinta.lab.a.toFixed(1)}</td>
                  <td className="py-3 px-4 text-gray-300 font-mono">{tinta.lab.b.toFixed(1)}</td>
                  <td className="py-3 px-4 text-gray-300">{(tinta.opacity * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-gray-300">{tinta.tintingStrength.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-300">{tinta.costPerKg.toFixed(2)} €</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(tinta)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(tinta.id, tinta.name)}
                        className="p-1.5 bg-red-600 hover:bg-red-500 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'add' && 'Añadir Nueva Tinta'}
                {modalMode === 'edit' && 'Editar Tinta'}
                {modalMode === 'measure' && 'Medir Tinta con Colorímetro'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Modo medición: inputs LAB primero */}
              {modalMode === 'measure' && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-green-400 mb-3">🎯 Valores Medidos con Colorímetro</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">L* (Luminosidad)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lab.L}
                        onChange={(e) => setFormData({ ...formData, lab: { ...formData.lab, L: parseFloat(e.target.value) || 0 } })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">a* (Rojo/Verde)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lab.a}
                        onChange={(e) => setFormData({ ...formData, lab: { ...formData.lab, a: parseFloat(e.target.value) || 0 } })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">b* (Amarillo/Azul)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lab.b}
                        onChange={(e) => setFormData({ ...formData, lab: { ...formData.lab, b: parseFloat(e.target.value) || 0 } })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos básicos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Código Flint</label>
                  <input
                    type="text"
                    value={formData.codigoFlint}
                    onChange={(e) => setFormData({ ...formData, codigoFlint: e.target.value })}
                    placeholder="Ej: ANCORA-F2-Y012"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Yellow 012"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Familia</label>
                  <select
                    value={formData.familia}
                    onChange={(e) => setFormData({ ...formData, familia: e.target.value as FamiliaTinta })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {familias.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={handleColorChange}
                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* LAB */}
              {modalMode !== 'measure' && (
                <div>
                  <h4 className="text-sm font-bold text-gray-300 mb-2">Valores LAB</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">L*</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lab.L}
                        onChange={(e) => setFormData({ ...formData, lab: { ...formData.lab, L: parseFloat(e.target.value) || 0 } })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">a*</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lab.a}
                        onChange={(e) => setFormData({ ...formData, lab: { ...formData.lab, a: parseFloat(e.target.value) || 0 } })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">b*</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lab.b}
                        onChange={(e) => setFormData({ ...formData, lab: { ...formData.lab, b: parseFloat(e.target.value) || 0 } })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Propiedades */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Fuerza Tintórea</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tintingStrength}
                    onChange={(e) => setFormData({ ...formData, tintingStrength: parseFloat(e.target.value) || 1.0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Opacidad (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.opacity}
                    onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) || 0.5 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Concentración Máx (%)</label>
                  <input
                    type="number"
                    value={formData.maxConcentration}
                    onChange={(e) => setFormData({ ...formData, maxConcentration: parseInt(e.target.value) || 50 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Coste/kg (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPerKg}
                    onChange={(e) => setFormData({ ...formData, costPerKg: parseFloat(e.target.value) || 25 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Resistencias */}
              <div>
                <h4 className="text-sm font-bold text-gray-300 mb-2">Resistencias</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.lightFastness >= 7}
                      onChange={(e) => setFormData({ ...formData, lightFastness: e.target.checked ? 7 : 5 })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Luz (≥7)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.solventResistance}
                      onChange={(e) => setFormData({ ...formData, solventResistance: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Solventes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.soapResistance}
                      onChange={(e) => setFormData({ ...formData, soapResistance: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Jabón</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.greaseResistance}
                      onChange={(e) => setFormData({ ...formData, greaseResistance: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Grasa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.alkalineResistance}
                      onChange={(e) => setFormData({ ...formData, alkalineResistance: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Álcalis</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
