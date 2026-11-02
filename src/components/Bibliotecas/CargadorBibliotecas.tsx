import { useState, useRef } from 'react';
import { BibliotecaColor, ColorPantone } from '../../types/color';
import { 
  getBibliotecas, 
  crearBiblioteca, 
  eliminarBiblioteca, 
  toggleBiblioteca,
  getEstadisticas 
} from '../../services/gestorBibliotecas';
import { Upload, Trash2, ToggleLeft, ToggleRight, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export default function CargadorBibliotecas() {
  const [bibliotecas, setBibliotecas] = useState<BibliotecaColor[]>(getBibliotecas());
  const [nombreBiblioteca, setNombreBiblioteca] = useState('');
  const [preview, setPreview] = useState<ColorPantone[] | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const estadisticas = getEstadisticas();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrores([]);
    setMensajeExito('');
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Importar temporalmente para preview
      const { parseColorFile } = require('../../services/parserCSV');
      const result = parseColorFile(content, file.name);
      
      if (result.success && result.colores.length > 0) {
        setPreview(result.colores.slice(0, 10)); // Mostrar primeros 10
        if (result.errores.length > 0) {
          setErrores(result.errores);
        }
      } else {
        setErrores(result.errores.length > 0 ? result.errores : ['No se encontraron colores válidos']);
      }
    };
    
    reader.readAsText(file);
  };

  const handleConfirmarImportacion = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !nombreBiblioteca.trim()) {
      setErrores(['Debe seleccionar un archivo y proporcionar un nombre']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = crearBiblioteca(nombreBiblioteca, content, file.name);
      
      if (result.success && result.biblioteca) {
        setBibliotecas(getBibliotecas());
        setMensajeExito(`Biblioteca "${nombreBiblioteca}" cargada con ${result.biblioteca.totalColores} colores`);
        setNombreBiblioteca('');
        setPreview(null);
        setErrores(result.errores);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setErrores(result.errores);
      }
    };
    
    reader.readAsText(file);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar biblioteca "${nombre}"?`)) {
      eliminarBiblioteca(id);
      setBibliotecas(getBibliotecas());
    }
  };

  const handleToggle = (id: string) => {
    toggleBiblioteca(id);
    setBibliotecas(getBibliotecas());
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Bibliotecas de Color</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{estadisticas.totalBibliotecas}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{estadisticas.bibliotecasActivas}</div>
            <div className="text-xs text-gray-400">Activas</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{estadisticas.totalColores}</div>
            <div className="text-xs text-gray-400">Colores</div>
          </div>
        </div>
      </div>

      {/* Cargar nueva biblioteca */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <h3 className="text-sm font-bold text-white mb-3">Cargar Nueva Biblioteca</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nombre de la biblioteca</label>
            <input
              type="text"
              value={nombreBiblioteca}
              onChange={(e) => setNombreBiblioteca(e.target.value)}
              placeholder="Ej: Pantone Solid Coated 2024"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Archivo de colores (CSV o JSON)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.txt"
              onChange={handleFileSelect}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer cursor-pointer"
            />
          </div>

          {/* Preview de colores */}
          {preview && preview.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-2">Vista previa (primeros 10 colores):</div>
              <div className="grid grid-cols-5 gap-2">
                {preview.map((color, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="w-full h-12 rounded border border-gray-600 mb-1"
                      style={{ backgroundColor: color.hex || '#000' }}
                    />
                    <div className="text-[9px] text-gray-400 truncate">{color.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensajes de error */}
          {errores.length > 0 && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-300">
                  <div className="font-bold mb-1">Errores:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {errores.slice(0, 5).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                    {errores.length > 5 && (
                      <li>... y {errores.length - 5} errores más</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de éxito */}
          {mensajeExito && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div className="text-xs text-green-300">{mensajeExito}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleConfirmarImportacion}
            disabled={!nombreBiblioteca.trim() || !preview}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Confirmar Importación
          </button>
        </div>
      </div>

      {/* Lista de bibliotecas */}
      {bibliotecas.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-bold text-white mb-3">Bibliotecas Cargadas</h3>
          
          <div className="space-y-2">
            {bibliotecas.map((bib) => (
              <div
                key={bib.id}
                className={`rounded-lg p-3 border ${
                  bib.activa
                    ? 'bg-blue-900/20 border-blue-700/50'
                    : 'bg-gray-900/50 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{bib.nombre}</div>
                    <div className="text-xs text-gray-400">
                      {bib.totalColores} colores • {bib.formato.toUpperCase()} • {new Date(bib.fechaCarga).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(bib.id)}
                      className="p-2 hover:bg-gray-700 rounded transition-colors"
                      title={bib.activa ? 'Desactivar' : 'Activar'}
                    >
                      {bib.activa ? (
                        <ToggleRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleEliminar(bib.id, bib.nombre)}
                      className="p-2 hover:bg-red-900/50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
