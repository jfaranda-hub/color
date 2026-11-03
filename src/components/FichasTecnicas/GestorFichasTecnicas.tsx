import { useState, useRef } from 'react';
import { FichaTecnica } from '../../types/color';
import { 
  getFichasTecnicas, 
  addFichaTecnica, 
  deleteFichaTecnica,
  searchFichas,
  getEstadisticasFichas,
  importFichasFromJSON
} from '../../services/gestorFichasTecnicas';
import { FileText, Plus, Trash2, Search, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function GestorFichasTecnicas() {
  const [fichas, setFichas] = useState<FichaTecnica[]>(getFichasTecnicas());
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nuevaFicha, setNuevaFicha] = useState<Partial<FichaTecnica>>({
    nombre: '',
    proveedor: '',
    tipoTinta: '',
    pantoneRef: '',
    sustrato: '',
    condicionesImpresion: {
      anilox: '',
      velocidad: '',
      temperatura: ''
    },
    observaciones: ''
  });

  const estadisticas = getEstadisticasFichas();

  const fichasFiltradas = busqueda ? searchFichas(busqueda) : fichas;

  const handleCrearFicha = () => {
    if (!nuevaFicha.nombre) {
      setErrores(['El nombre es obligatorio']);
      return;
    }

    const ficha: FichaTecnica = {
      id: `ficha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nombre: nuevaFicha.nombre || '',
      proveedor: nuevaFicha.proveedor,
      tipoTinta: nuevaFicha.tipoTinta,
      pantoneRef: nuevaFicha.pantoneRef,
      sustrato: nuevaFicha.sustrato,
      condicionesImpresion: nuevaFicha.condicionesImpresion,
      observaciones: nuevaFicha.observaciones
    };

    if (addFichaTecnica(ficha)) {
      setFichas(getFichasTecnicas());
      setMostrarFormulario(false);
      setNuevaFicha({
        nombre: '',
        proveedor: '',
        tipoTinta: '',
        pantoneRef: '',
        sustrato: '',
        condicionesImpresion: { anilox: '', velocidad: '', temperatura: '' },
        observaciones: ''
      });
      setMensajeExito('Ficha técnica creada correctamente');
      setErrores([]);
    } else {
      setErrores(['Error al crear la ficha técnica']);
    }
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar ficha "${nombre}"?`)) {
      deleteFichaTecnica(id);
      setFichas(getFichasTecnicas());
    }
  };

  const handleImportarJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrores([]);
    setMensajeExito('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importFichasFromJSON(content);
      
      if (result.success) {
        setFichas(getFichasTecnicas());
        setMensajeExito(`${result.totalImportadas} fichas importadas correctamente`);
        if (result.errores.length > 0) {
          setErrores(result.errores);
        }
      } else {
        setErrores(result.errores);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-bold text-white">Fichas Técnicas</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{estadisticas.totalFichas}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{estadisticas.fichasConPantone}</div>
            <div className="text-xs text-gray-400">Con Pantone</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{estadisticas.fichasGenerales}</div>
            <div className="text-xs text-gray-400">Generales</div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Gestión de Fichas</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Ficha
            </button>
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Importar JSON
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportarJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, proveedor, Pantone..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Mensajes */}
        {errores.length > 0 && (
          <div className="mt-3 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">
                <ul className="list-disc list-inside space-y-1">
                  {errores.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {mensajeExito && (
          <div className="mt-3 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div className="text-xs text-green-300">{mensajeExito}</div>
            </div>
          </div>
        )}
      </div>

      {/* Formulario de nueva ficha */}
      {mostrarFormulario && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-bold text-white mb-3">Nueva Ficha Técnica</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nombre *</label>
              <input
                type="text"
                value={nuevaFicha.nombre}
                onChange={(e) => setNuevaFicha({ ...nuevaFicha, nombre: e.target.value })}
                placeholder="Ej: Tinta Flexocure LEAP - Pantone 185 C"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Proveedor</label>
                <input
                  type="text"
                  value={nuevaFicha.proveedor}
                  onChange={(e) => setNuevaFicha({ ...nuevaFicha, proveedor: e.target.value })}
                  placeholder="Ej: Flint Group"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tipo de Tinta</label>
                <input
                  type="text"
                  value={nuevaFicha.tipoTinta}
                  onChange={(e) => setNuevaFicha({ ...nuevaFicha, tipoTinta: e.target.value })}
                  placeholder="Ej: UV Flexo"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Referencia Pantone</label>
                <input
                  type="text"
                  value={nuevaFicha.pantoneRef}
                  onChange={(e) => setNuevaFicha({ ...nuevaFicha, pantoneRef: e.target.value })}
                  placeholder="Ej: 185 C"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Sustrato</label>
                <input
                  type="text"
                  value={nuevaFicha.sustrato}
                  onChange={(e) => setNuevaFicha({ ...nuevaFicha, sustrato: e.target.value })}
                  placeholder="Ej: Film BOPP"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Anilox</label>
                <input
                  type="text"
                  value={nuevaFicha.condicionesImpresion?.anilox}
                  onChange={(e) => setNuevaFicha({
                    ...nuevaFicha,
                    condicionesImpresion: { ...nuevaFicha.condicionesImpresion, anilox: e.target.value }
                  })}
                  placeholder="Ej: 360 lpi"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Velocidad</label>
                <input
                  type="text"
                  value={nuevaFicha.condicionesImpresion?.velocidad}
                  onChange={(e) => setNuevaFicha({
                    ...nuevaFicha,
                    condicionesImpresion: { ...nuevaFicha.condicionesImpresion, velocidad: e.target.value }
                  })}
                  placeholder="Ej: 150 m/min"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Temperatura</label>
                <input
                  type="text"
                  value={nuevaFicha.condicionesImpresion?.temperatura}
                  onChange={(e) => setNuevaFicha({
                    ...nuevaFicha,
                    condicionesImpresion: { ...nuevaFicha.condicionesImpresion, temperatura: e.target.value }
                  })}
                  placeholder="Ej: 60°C"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Observaciones</label>
              <textarea
                value={nuevaFicha.observaciones}
                onChange={(e) => setNuevaFicha({ ...nuevaFicha, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCrearFicha}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Crear Ficha
              </button>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de fichas */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <h3 className="text-sm font-bold text-white mb-3">
          {fichasFiltradas.length} Ficha{fichasFiltradas.length !== 1 ? 's' : ''} Técnica{fichasFiltradas.length !== 1 ? 's' : ''}
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {fichasFiltradas.map((ficha) => (
            <div
              key={ficha.id}
              className="bg-gray-900/50 rounded-lg p-3 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{ficha.nombre}</div>
                  <div className="text-xs text-gray-400 space-x-2">
                    {ficha.proveedor && <span>• {ficha.proveedor}</span>}
                    {ficha.tipoTinta && <span>• {ficha.tipoTinta}</span>}
                    {ficha.pantoneRef && <span className="text-blue-400">• Pantone {ficha.pantoneRef}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleEliminar(ficha.id, ficha.nombre)}
                  className="p-1.5 hover:bg-red-900/50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {ficha.sustrato && (
                <div className="text-xs text-gray-400 mb-1">
                  <span className="text-gray-500">Sustrato:</span> {ficha.sustrato}
                </div>
              )}

              {ficha.condicionesImpresion && (
                <div className="text-xs text-gray-400 space-x-3">
                  {ficha.condicionesImpresion.anilox && (
                    <span><span className="text-gray-500">Anilox:</span> {ficha.condicionesImpresion.anilox}</span>
                  )}
                  {ficha.condicionesImpresion.velocidad && (
                    <span><span className="text-gray-500">Vel:</span> {ficha.condicionesImpresion.velocidad}</span>
                  )}
                  {ficha.condicionesImpresion.temperatura && (
                    <span><span className="text-gray-500">Temp:</span> {ficha.condicionesImpresion.temperatura}</span>
                  )}
                </div>
              )}

              {ficha.observaciones && (
                <div className="text-xs text-gray-400 mt-2 italic">
                  {ficha.observaciones}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
