import React, { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import { pantoneDatabase, PantoneColor } from "../data/pantoneLab";
import { labToHex } from "../utils/colorCalculations";

interface Props {
  selected: PantoneColor | null;
  onSelect: (color: PantoneColor) => void;
}

export default function PantoneSelector({ selected, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Todos");

  const categories = useMemo(() => {
    const cats = [...new Set(pantoneDatabase.map(p => p.category))];
    return ["Todos", ...cats.sort()];
  }, []);

  const filtered = useMemo(() => {
    return pantoneDatabase.filter(p => {
      const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === "Todos" || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [search, filterCategory]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        🎨 Color Pantone Objetivo
      </label>
      <div
        className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-500 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected ? (
          <>
            <div
              className="w-8 h-8 rounded-lg border-2 border-gray-500 shadow-inner"
              style={{ backgroundColor: labToHex(selected.L, selected.a, selected.b) }}
            />
            <div className="flex-1">
              <div className="text-white font-bold">{selected.code}</div>
              <div className="text-xs text-gray-400">
                L:{selected.L.toFixed(1)} a:{selected.a.toFixed(1)} b:{selected.b.toFixed(1)}
              </div>
            </div>
          </>
        ) : (
          <span className="text-gray-400 flex-1">Seleccionar Pantone...</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar Pantone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-1 p-2 border-b border-gray-700 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.map(color => (
              <button
                key={color.code}
                onClick={() => { onSelect(color); setIsOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-700 transition-colors text-left ${
                  selected?.code === color.code ? "bg-blue-900/30" : ""
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md border border-gray-500 shadow-inner flex-shrink-0"
                  style={{ backgroundColor: labToHex(color.L, color.a, color.b) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{color.code}</div>
                  <div className="text-xs text-gray-400 truncate">{color.name}</div>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {color.L.toFixed(0)}/{color.a.toFixed(0)}/{color.b.toFixed(0)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
