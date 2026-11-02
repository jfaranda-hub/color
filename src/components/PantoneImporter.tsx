import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileText, Database, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { 
  importPantoneColors, 
  getPantoneDatabaseStats, 
  clearPantoneDatabase,
  ImportResult 
} from "../services/PantoneDatabaseService";
import { pantoneSampleData } from "../data/pantoneSampleData";

export default function PantoneImporter() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [stats, setStats] = useState(getPantoneDatabaseStats());
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteData, setPasteData] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("📄 Importando Pantone CSV:", results.data.length, "filas");
        
        // El repositorio aj90909 tiene columnas: PANTONENAME, UNIQUECODE, RED, GREEN, BLUE
        // Pero los valores son en realidad LAB (L*, a*, b*)
        const colors = results.data.map((row: any) => {
          // Intentar diferentes formatos de columnas
          const code = row.PANTONENAME || row.PANTONE || row.code || row.Codigo || "";
          const L = parseFloat(row.RED || row.L || row.l || 0);
          const a = parseFloat(row.GREEN || row.A || row.a || 0);
          const b = parseFloat(row.BLUE || row.B || row.b || 0);
          const name = row.NAME || row.Nombre || code;
          const category = row.CATEGORY || row.Categoria || "Sin categoría";

          return {
            code: code.trim(),
            name: name.trim(),
            L,
            a,
            b,
            category: category.trim()
          };
        });

        const result = importPantoneColors(colors);
        setImportResult(result);
        setStats(getPantoneDatabaseStats());
        
        // Guardar timestamp de última importación
        localStorage.setItem("flexcolor_pantone_last_import", new Date().toISOString());
        
        console.log("✅ Importación completada:", result);
      },
      error: (error) => {
        console.error("❌ Error al leer CSV:", error);
        setImportResult({
          success: false,
          totalImported: 0,
          errors: [error.message],
          duplicates: 0
        });
      }
    });
  };

  const handlePasteImport = () => {
    if (!pasteData.trim()) return;

    try {
      // Intentar parsear como JSON
      let colors;
      if (pasteData.trim().startsWith("[")) {
        colors = JSON.parse(pasteData);
      } else {
        // Parsear como CSV pegado
        const lines = pasteData.trim().split("\n");
        const headers = lines[0].split(",").map(h => h.trim());
        
        colors = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx];
          });
          return obj;
        });
      }

      const result = importPantoneColors(colors);
      setImportResult(result);
      setStats(getPantoneDatabaseStats());
      localStorage.setItem("flexcolor_pantone_last_import", new Date().toISOString());
      setPasteData("");
      
      console.log("✅ Importación desde pegado completada:", result);
    } catch (error) {
      console.error("❌ Error al parsear datos:", error);
      setImportResult({
        success: false,
        totalImported: 0,
        errors: ["Error al parsear los datos. Verifica el formato."],
        duplicates: 0
      });
    }
  };

  const handleClearDatabase = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar toda la base de datos Pantone? Esta acción no se puede deshacer.")) {
      if (window.confirm("Esta acción eliminará TODOS los colores Pantone importados. ¿Confirmar?")) {
        clearPantoneDatabase();
        setStats(getPantoneDatabaseStats());
        setImportResult(null);
        console.log("🗑️ Base de datos Pantone limpiada");
      }
    }
  };

  const handleImportSampleData = () => {
    console.log("📦 Importando datos de ejemplo:", pantoneSampleData.length, "colores");
    const result = importPantoneColors(pantoneSampleData);
    setImportResult(result);
    setStats(getPantoneDatabaseStats());
    localStorage.setItem("flexcolor_pantone_last_import", new Date().toISOString());
    console.log("✅ Datos de ejemplo importados:", result);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Base de Datos Pantone</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalColors}</div>
            <div className="text-xs text-gray-400">Colores totales</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.categories.length}</div>
            <div className="text-xs text-gray-400">Categorías</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-green-400">
              {stats.lastImport ? new Date(stats.lastImport).toLocaleDateString() : "N/A"}
            </div>
            <div className="text-xs text-gray-400">Última importación</div>
          </div>
        </div>
      </div>

      {/* Modo de importación */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <h3 className="text-sm font-bold text-white mb-3">Importar Colores Pantone</h3>
        
        {/* Botón de datos de ejemplo */}
        <button
          onClick={handleImportSampleData}
          className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Importar 50 colores Pantone de ejemplo
        </button>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPasteMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              !pasteMode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Upload className="w-4 h-4" />
            Subir CSV
          </button>
          <button
            onClick={() => setPasteMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              pasteMode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FileText className="w-4 h-4" />
            Pegar datos
          </button>
        </div>

        {/* Upload CSV */}
        {!pasteMode && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Sube un archivo CSV con colores Pantone (formato del repositorio aj90909)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:cursor-pointer cursor-pointer"
            />
            <div className="mt-3 text-xs text-gray-500">
              <strong>Formato esperado:</strong> PANTONENAME, UNIQUECODE, RED, GREEN, BLUE
              <br />
              <strong>Nota:</strong> Las columnas RED/GREEN/BLUE contienen valores LAB (L*, a*, b*)
            </div>
          </div>
        )}

        {/* Paste data */}
        {pasteMode && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Pega datos en formato JSON o CSV
            </label>
            <textarea
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder='[{"code": "PMS 185 C", "name": "Warm Red", "L": 52.89, "a": 68.56, "b": 46.83}]'
              className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={handlePasteImport}
              disabled={!pasteData.trim()}
              className="mt-2 w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Importar datos
            </button>
          </div>
        )}
      </div>

      {/* Resultado de importación */}
      {importResult && (
        <div className={`rounded-xl border-2 p-4 ${
          importResult.success 
            ? "bg-green-900/20 border-green-700/50" 
            : "bg-red-900/20 border-red-700/50"
        }`}>
          <div className="flex items-start gap-3">
            {importResult.success ? (
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className={`text-sm font-bold mb-2 ${
                importResult.success ? "text-green-400" : "text-red-400"
              }`}>
                {importResult.success ? "✅ Importación exitosa" : "⚠️ Importación con errores"}
              </h4>
              
              <div className="space-y-1 text-xs">
                <div className="text-gray-300">
                  <strong>Colores importados:</strong> {importResult.totalImported}
                </div>
                {importResult.duplicates > 0 && (
                  <div className="text-yellow-400">
                    <strong>Duplicados omitidos:</strong> {importResult.duplicates}
                  </div>
                )}
                {importResult.errors.length > 0 && (
                  <div className="text-red-400">
                    <strong>Errores:</strong> {importResult.errors.length}
                    <div className="mt-1 max-h-32 overflow-y-auto text-[10px]">
                      {importResult.errors.slice(0, 10).map((error, idx) => (
                        <div key={idx}>• {error}</div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <div>... y {importResult.errors.length - 10} errores más</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón limpiar */}
      {stats.totalColors > 0 && (
        <button
          onClick={handleClearDatabase}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          🗑️ Limpiar base de datos Pantone
        </button>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <h4 className="text-sm font-bold text-blue-400 mb-2">📋 Instrucciones</h4>
        <div className="text-xs text-gray-300 space-y-2">
          <p>
            <strong>1. Descargar datos:</strong> Ve a{" "}
            <a 
              href="https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              github.com/aj90909/unofficial-pantone-solid-coated-2024-v5
            </a>
          </p>
          <p>
            <strong>2. Descargar colors.csv:</strong> Haz clic en "Code" → "Download ZIP" y extrae el archivo colors.csv
          </p>
          <p>
            <strong>3. Importar en la app:</strong> Sube el archivo colors.csv usando el botón "Subir CSV"
          </p>
          <p>
            <strong>4. Usar los colores:</strong> Los colores importados estarán disponibles en el selector de Pantone
          </p>
        </div>
      </div>
    </div>
  );
}
