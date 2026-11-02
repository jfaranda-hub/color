import { useState, useMemo, useEffect } from "react";
import { 
  pantoneDatabaseExpanded, 
  searchPantone, 
  getPantoneCategories,
  PantoneColorExpanded 
} from "../data/pantoneLabExpanded";
import { createColorKDTree, ColorKDTree } from "../utils/ColorKDTree";
import { Search, Palette, Filter } from "lucide-react";

export default function PantoneDatabaseViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [showSearchMode, setShowSearchMode] = useState(false);
  const [searchLAB, setSearchLAB] = useState({ L: 50, a: 0, b: 0 });
  const [closestResults, setClosestResults] = useState<Array<PantoneColorExpanded & { deltaE: number }>>([]);
  const [kdTree, setKdTree] = useState<ColorKDTree | null>(null);

  const categories = useMemo(() => ["Todas", ...getPantoneCategories()], []);

  // Construir el KD-Tree al cargar el componente
  useEffect(() => {
    const tree = createColorKDTree(pantoneDatabaseExpanded);
    setKdTree(tree);
    console.log("✅ KD-Tree construido para búsqueda optimizada");
  }, []);

  const filteredPantones = useMemo(() => {
    let results = pantoneDatabaseExpanded;
    
    if (selectedCategory !== "Todas") {
      results = results.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      results = searchPantone(searchQuery);
    }
    
    return results;
  }, [searchQuery, selectedCategory]);

  const handleFindClosest = () => {
    if (!kdTree) return;
    
    const startTime = performance.now();
    const results = kdTree.findKNearest(searchLAB, 10);
    const endTime = performance.now();
    
    console.log(`🔍 Búsqueda KD-Tree: ${results.length} resultados en ${(endTime - startTime).toFixed(2)}ms`);
    setClosestResults(results);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Base de Datos Pantone Expandida</h3>
          </div>
          <div className="text-sm text-gray-400">
            {pantoneDatabaseExpanded.length} colores disponibles
          </div>
        </div>

        {/* Modo de búsqueda */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowSearchMode(false)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              !showSearchMode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Buscar por nombre/código
          </button>
          <button
            onClick={() => setShowSearchMode(true)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              showSearchMode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Buscar por color (LAB)
          </button>
        </div>

        {/* Búsqueda por nombre/código */}
        {!showSearchMode && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código (PMS 185 C) o nombre..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Búsqueda por color LAB */}
        {showSearchMode && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">L* (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={searchLAB.L}
                  onChange={(e) => setSearchLAB({ ...searchLAB, L: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">a* (-128 a 127)</label>
                <input
                  type="number"
                  min="-128"
                  max="127"
                  value={searchLAB.a}
                  onChange={(e) => setSearchLAB({ ...searchLAB, a: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">b* (-128 a 127)</label>
                <input
                  type="number"
                  min="-128"
                  max="127"
                  value={searchLAB.b}
                  onChange={(e) => setSearchLAB({ ...searchLAB, b: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleFindClosest}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔍 Buscar colores más cercanos
            </button>
          </div>
        )}
      </div>

      {/* Resultados de búsqueda por color */}
      {showSearchMode && closestResults.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h4 className="text-sm font-bold text-white mb-3">
            Colores más cercanos (ΔE CIE76)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {closestResults.map((p, idx) => (
              <div key={p.code} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div
                  className="w-full h-16 rounded-lg mb-2 border border-gray-600"
                  style={{ backgroundColor: p.hex }}
                />
                <div className="text-xs font-bold text-white">{p.code}</div>
                <div className="text-[10px] text-gray-400">{p.name}</div>
                <div className="text-[10px] text-blue-400 font-mono mt-1">
                  ΔE: {p.deltaE.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {p.L.toFixed(1)}/{p.a.toFixed(1)}/{p.b.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de colores */}
      {!showSearchMode && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h4 className="text-sm font-bold text-white mb-3">
            {filteredPantones.length} colores encontrados
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
            {filteredPantones.map(p => (
              <div key={p.code} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group">
                <div
                  className="w-full h-16 rounded-lg mb-2 border border-gray-600"
                  style={{ backgroundColor: p.hex }}
                />
                <div className="text-xs font-bold text-white truncate">{p.code}</div>
                <div className="text-[10px] text-gray-400 truncate">{p.name}</div>
                
                {/* Información expandible al hacer hover */}
                <div className="hidden group-hover:block mt-2 space-y-1 text-[9px] font-mono text-gray-500">
                  <div>LAB: {p.L.toFixed(1)}/{p.a.toFixed(1)}/{p.b.toFixed(1)}</div>
                  <div>RGB: {p.rgb.r}/{p.rgb.g}/{p.rgb.b}</div>
                  <div>CMYK: {p.cmyk.c}/{p.cmyk.m}/{p.cmyk.y}/{p.cmyk.k}</div>
                  <div>HSL: {p.hsl.h}°/{p.hsl.s}%/{p.hsl.l}%</div>
                  <div>HEX: {p.hex}</div>
                </div>
                
                {/* Información básica visible siempre */}
                <div className="group-hover:hidden text-[10px] text-gray-500 font-mono mt-1">
                  {p.L.toFixed(1)}/{p.a.toFixed(1)}/{p.b.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descargo de responsabilidad */}
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <div className="text-amber-400 text-lg">⚠️</div>
          <div className="text-xs text-amber-300">
            <strong>Descargo de responsabilidad:</strong> Los valores de color Pantone son aproximaciones 
            no oficiales basadas en datasets de código abierto. Para uso profesional de alta precisión, 
            consulte las guías físicas oficiales de Pantone o utilice la API oficial de Pantone Connect.
          </div>
        </div>
      </div>
    </div>
  );
}
