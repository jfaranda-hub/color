import { useState, useEffect } from 'react';
import { 
  getTodasLasFormulas, 
  crearFormula, 
  crearNuevaVersion, 
  getVersionesDeFormula,
  compararVersiones,
  cambiarEstadoVersion,
  getEstadisticasFormulas,
  buscarFormulas
} from '../services/formulasMaestrasService';
import { FormulaMaestra, VersionFormula, ComponenteFormula } from '../types/industrial';
import { FileText, Plus, GitCompare, CheckCircle, XCircle, Edit } from 'lucide-react';

export default function FormulasMaestrasPanel() {
  const [formulas, setFormulas] = useState<FormulaMaestra[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [busqueda, setBusqueda] = useState('');
  const [formulaSeleccionada, setFormulaSeleccionada] = useState<string | null>(null);
  const [versiones, setVersiones] = useState<VersionFormula[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoComparacion, setModoComparacion] = useState(false);
  const [version1, setVersion1] = useState<number>(1);
  const [version2, setVersion2] = useState<number>(2);
  const [diferencias, setDiferencias] = useState<any[]>([]);

  // Usuario simulado (en producción vendría del contexto de autenticación)
  const usuarioId = 'usuario-demo';

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (busqueda) {
      setFormulas(buscarFormulas(busqueda));
    } else {
      setFormulas(getTodasLasFormulas());
    }
  }, [busqueda]);

  useEffect(() => {
    if (formulaSeleccionada) {
      setVersiones(getVersionesDeFormula(formulaSeleccionada));
    }
  }, [formulaSeleccionada]);

  const cargarDatos = () => {
    setFormulas(getTodasLasFormulas());
    setEstadisticas(getEstadisticasFormulas());
  };

  const handleCrearFormula = (datos: {
    codigo: string;
    nombre: string;
    descripcion: string;
    pantoneReferencia: string;
    sustratoObjetivo: string;
    componentes: Omit<ComponenteFormula, 'id' | 'versionId'>[];
  }) => {
    const resultado = crearFormula(
      datos.codigo,
      datos.nombre,
      datos.descripcion,
      datos.pantoneReferencia,
      datos.sustratoObjetivo,
      datos.componentes,
      usuarioId
    );

    if (resultado.success) {
      alert('✅ Fórmula creada exitosamente');
      cargarDatos();
      setMostrarFormulario(false);
    } else {
      alert(`❌ Error: ${resultado.error}`);
    }
  };

  const handleCrearVersion = (formulaId: string, motivo: string, componentes: Omit<ComponenteFormula, 'id' | 'versionId'>[]) => {
    const resultado = crearNuevaVersion(formulaId, motivo, componentes, usuarioId);

    if (resultado.success) {
      alert('✅ Nueva versión creada exitosamente');
      cargarDatos();
      if (formulaSeleccionada === formulaId) {
        setVersiones(getVersionesDeFormula(formulaId));
      }
    } else {
      alert(`❌ Error: ${resultado.error}`);
    }
  };

  const handleCambiarEstado = (versionId: string, nuevoEstado: any) => {
    const resultado = cambiarEstadoVersion(versionId, nuevoEstado, usuarioId);

    if (resultado.success) {
      alert(`✅ Estado cambiado a: ${nuevoEstado}`);
      cargarDatos();
    } else {
      alert(`❌ Error: ${resultado.error}`);
    }
  };

  const handleCompararVersiones = () => {
    if (!formulaSeleccionada) return;

    const resultado = compararVersiones(formulaSeleccionada, version1, version2);

    if (resultado.success && resultado.diferencias) {
      setDiferencias(resultado.diferencias);
      setModoComparacion(true);
    } else {
      alert(`❌ Error: ${resultado.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="text-sm text-gray-400">Total</div>
            <div className="text-2xl font-bold text-white">{estadisticas.total}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="text-sm text-gray-400">Borrador</div>
            <div className="text-2xl font-bold text-yellow-400">{estadisticas.borrador}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="text-sm text-gray-400">Validada</div>
            <div className="text-2xl font-bold text-blue-400">{estadisticas.validada}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="text-sm text-gray-400">Aprobadas</div>
            <div className="text-2xl font-bold text-green-400">{estadisticas.aprobadas}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="text-sm text-gray-400">Obsoletas</div>
            <div className="text-2xl font-bold text-red-400">{estadisticas.obsoletas}</div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Fórmulas Maestras Versionadas
          </h2>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Fórmula
          </button>
        </div>

        {/* Búsqueda */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por código, nombre, Pantone..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Lista de fórmulas */}
      <div className="grid md:grid-cols-2 gap-4">
        {formulas.map(formula => (
          <div
            key={formula.id}
            onClick={() => setFormulaSeleccionada(formula.id)}
            className={`bg-gray-800/50 rounded-xl border-2 p-4 cursor-pointer transition-all ${
              formulaSeleccionada === formula.id
                ? 'border-blue-500'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-lg font-bold text-white">{formula.nombre}</div>
                <div className="text-sm text-gray-400">{formula.codigo}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                formula.estado === 'aprobada' ? 'bg-green-900/50 text-green-400' :
                formula.estado === 'validada' ? 'bg-blue-900/50 text-blue-400' :
                formula.estado === 'obsoleta' ? 'bg-red-900/50 text-red-400' :
                'bg-yellow-900/50 text-yellow-400'
              }`}>
                {formula.estado}
              </span>
            </div>

            {formula.pantoneReferencia && (
              <div className="text-xs text-gray-400 mb-1">
                Pantone: {formula.pantoneReferencia}
              </div>
            )}

            {formula.sustratoObjetivo && (
              <div className="text-xs text-gray-400 mb-2">
                Sustrato: {formula.sustratoObjetivo}
              </div>
            )}

            <div className="text-xs text-gray-500">
              Versión actual: {formula.versionActual} | Modificada: {new Date(formula.fechaModificacion).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Detalle de fórmula seleccionada */}
      {formulaSeleccionada && versiones.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Historial de Versiones
          </h3>

          {/* Controles de comparación */}
          <div className="flex items-center gap-4 mb-4">
            <select
              value={version1}
              onChange={(e) => setVersion1(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              {versiones.map(v => (
                <option key={v.id} value={v.numeroVersion}>
                  v{v.numeroVersion}
                </option>
              ))}
            </select>
            <GitCompare className="w-5 h-5 text-gray-400" />
            <select
              value={version2}
              onChange={(e) => setVersion2(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              {versiones.map(v => (
                <option key={v.id} value={v.numeroVersion}>
                  v{v.numeroVersion}
                </option>
              ))}
            </select>
            <button
              onClick={handleCompararVersiones}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              Comparar
            </button>
          </div>

          {/* Lista de versiones */}
          <div className="space-y-3">
            {versiones.map(version => (
              <div key={version.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-bold">Versión {version.numeroVersion}</div>
                    <div className="text-xs text-gray-400">
                      Creada: {new Date(version.fechaCreacion).toLocaleString()}
                    </div>
                    {version.motivoCambio && (
                      <div className="text-xs text-gray-400 mt-1">
                        Motivo: {version.motivoCambio}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      version.estado === 'aprobada' ? 'bg-green-900/50 text-green-400' :
                      version.estado === 'validada' ? 'bg-blue-900/50 text-blue-400' :
                      version.estado === 'obsoleta' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {version.estado}
                    </span>
                    {version.estado === 'borrador' && (
                      <button
                        onClick={() => handleCambiarEstado(version.id, 'validada')}
                        className="p-1 bg-blue-600 hover:bg-blue-500 rounded"
                        title="Validar"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {version.estado === 'validada' && (
                      <button
                        onClick={() => handleCambiarEstado(version.id, 'aprobada')}
                        className="p-1 bg-green-600 hover:bg-green-500 rounded"
                        title="Aprobar"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Componentes: {version.componentes.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de comparación */}
      {modoComparacion && diferencias.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-purple-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Diferencias entre v{version1} y v{version2}
          </h3>

          <div className="space-y-2">
            {diferencias.map((diff, idx) => (
              <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  {diff.cambio === 'añadido' && <Plus className="w-4 h-4 text-green-400" />}
                  {diff.cambio === 'eliminado' && <XCircle className="w-4 h-4 text-red-400" />}
                  {diff.cambio === 'modificado' && <Edit className="w-4 h-4 text-yellow-400" />}
                  <span className="text-white font-medium">
                    {diff.cambio === 'añadido' && 'Componente añadido'}
                    {diff.cambio === 'eliminado' && 'Componente eliminado'}
                    {diff.cambio === 'modificado' && 'Componente modificado'}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  Tinta ID: {diff.componente}
                </div>

                {diff.version1 && (
                  <div className="text-xs text-gray-400 mt-1">
                    v{version1}: {diff.version1.porcentaje}%
                  </div>
                )}

                {diff.version2 && (
                  <div className="text-xs text-gray-400 mt-1">
                    v{version2}: {diff.version2.porcentaje}%
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setModoComparacion(false)}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cerrar comparación
          </button>
        </div>
      )}

      {/* Formulario de nueva fórmula */}
      {mostrarFormulario && (
        <FormularioFormula
          onCrear={handleCrearFormula}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}
    </div>
  );
}

// ============================================
// FORMULARIO DE NUEVA FÓRMULA
// ============================================

function FormularioFormula({ onCrear, onCancelar }: {
  onCrear: (datos: any) => void;
  onCancelar: () => void;
}) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pantoneReferencia, setPantoneReferencia] = useState('');
  const [sustratoObjetivo, setSustratoObjetivo] = useState('');
  const [componentes, setComponentes] = useState<any[]>([]);

  const agregarComponente = () => {
    setComponentes([...componentes, {
      tintaId: '',
      porcentaje: 0,
      gramosPorLitro: 0,
      ordenPreparacion: componentes.length + 1
    }]);
  };

  const actualizarComponente = (index: number, campo: string, valor: any) => {
    const nuevos = [...componentes];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setComponentes(nuevos);
  };

  const eliminarComponente = (index: number) => {
    setComponentes(componentes.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!codigo || !nombre) {
      alert('❌ Código y nombre son obligatorios');
      return;
    }

    if (componentes.length === 0) {
      alert('❌ Debe añadir al menos un componente');
      return;
    }

    onCrear({
      codigo,
      nombre,
      descripcion,
      pantoneReferencia,
      sustratoObjetivo,
      componentes
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold text-white mb-4">Nueva Fórmula Maestra</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Código *</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Pantone Referencia</label>
              <input
                type="text"
                value={pantoneReferencia}
                onChange={(e) => setPantoneReferencia(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Sustrato Objetivo</label>
              <input
                type="text"
                value={sustratoObjetivo}
                onChange={(e) => setSustratoObjetivo(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Componentes</label>
              <button
                onClick={agregarComponente}
                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
              >
                + Añadir
              </button>
            </div>

            <div className="space-y-2">
              {componentes.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-2">
                  <input
                    type="text"
                    value={comp.tintaId}
                    onChange={(e) => actualizarComponente(idx, 'tintaId', e.target.value)}
                    placeholder="ID Tinta"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                  <input
                    type="number"
                    value={comp.porcentaje}
                    onChange={(e) => actualizarComponente(idx, 'porcentaje', Number(e.target.value))}
                    placeholder="%"
                    className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                  <button
                    onClick={() => eliminarComponente(idx)}
                    className="p-1 bg-red-600 hover:bg-red-500 rounded"
                  >
                    <XCircle className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>

            {componentes.length > 0 && (
              <div className="text-xs text-gray-400 mt-2">
                Suma de porcentajes: {componentes.reduce((sum, c) => sum + c.porcentaje, 0).toFixed(2)}%
                {componentes.reduce((sum, c) => sum + c.porcentaje, 0) !== 100 && (
                  <span className="text-red-400 ml-2">(debe ser 100%)</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Crear Fórmula
          </button>
          <button
            onClick={onCancelar}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
