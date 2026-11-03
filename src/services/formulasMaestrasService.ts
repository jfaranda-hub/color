/**
 * Servicio de Fórmulas Maestras Versionadas
 * FASE 9B - FlexColor Pro Industrial
 * 
 * Permite:
 * - Crear y guardar fórmulas maestras
 * - Versionar fórmulas sin sobrescribir versiones anteriores
 * - Recuperar versiones anteriores
 * - Comparar diferencias entre versiones
 * - Bloquear edición de versiones aprobadas
 */

import { FormulaMaestra, VersionFormula, ComponenteFormula, EstadoFormula } from '../types/industrial';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_FORMULAS = 'flexcolor_formulas_maestras';
const STORAGE_KEY_VERSIONES = 'flexcolor_versiones_formulas';

// ============================================
// PERSISTENCIA
// ============================================

function getFormulas(): FormulaMaestra[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FORMULAS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading formulas:', error);
    return [];
  }
}

function saveFormulas(formulas: FormulaMaestra[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FORMULAS, JSON.stringify(formulas));
  } catch (error) {
    console.error('Error saving formulas:', error);
  }
}

function getVersiones(): VersionFormula[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VERSIONES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading versions:', error);
    return [];
  }
}

function saveVersiones(versiones: VersionFormula[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VERSIONES, JSON.stringify(versiones));
  } catch (error) {
    console.error('Error saving versions:', error);
  }
}

// ============================================
// OPERACIONES DE FÓRMULAS
// ============================================

/**
 * Crea una nueva fórmula maestra con su primera versión
 */
export function crearFormula(
  codigo: string,
  nombre: string,
  descripcion: string | undefined,
  pantoneReferencia: string | undefined,
  sustratoObjetivo: string | undefined,
  componentes: Omit<ComponenteFormula, 'id' | 'versionId'>[],
  usuarioId: string
): { success: boolean; formula?: FormulaMaestra; version?: VersionFormula; error?: string } {
  // Validar que el código sea único
  const formulas = getFormulas();
  if (formulas.some(f => f.codigo === codigo)) {
    return { success: false, error: `Ya existe una fórmula con el código ${codigo}` };
  }

  // Validar que la suma de porcentajes sea 100%
  const sumaPorcentajes = componentes.reduce((sum, c) => sum + c.porcentaje, 0);
  if (Math.abs(sumaPorcentajes - 100) > 0.01) {
    return { success: false, error: `La suma de porcentajes debe ser 100%. Actual: ${sumaPorcentajes.toFixed(2)}%` };
  }

  // Crear fórmula maestra
  const formula: FormulaMaestra = {
    id: uuidv4(),
    codigo,
    nombre,
    descripcion,
    pantoneReferencia,
    sustratoObjetivo,
    estado: 'borrador',
    creadoPor: usuarioId,
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
    versionActual: 1
  };

  // Crear primera versión
  const version: VersionFormula = {
    id: uuidv4(),
    formulaId: formula.id,
    numeroVersion: 1,
    fechaCreacion: new Date().toISOString(),
    creadoPor: usuarioId,
    motivoCambio: 'Creación inicial',
    estado: 'borrador',
    componentes: componentes.map(c => ({
      ...c,
      id: uuidv4(),
      versionId: '' // Se asignará después
    }))
  };

  // Asignar versionId a los componentes
  version.componentes = version.componentes.map(c => ({
    ...c,
    versionId: version.id
  }));

  // Guardar
  formulas.push(formula);
  saveFormulas(formulas);

  const versiones = getVersiones();
  versiones.push(version);
  saveVersiones(versiones);

  return { success: true, formula, version };
}

/**
 * Crea una nueva versión de una fórmula existente
 */
export function crearNuevaVersion(
  formulaId: string,
  motivoCambio: string,
  componentes: Omit<ComponenteFormula, 'id' | 'versionId'>[],
  usuarioId: string
): { success: boolean; version?: VersionFormula; error?: string } {
  const formulas = getFormulas();
  const formula = formulas.find(f => f.id === formulaId);

  if (!formula) {
    return { success: false, error: 'Fórmula no encontrada' };
  }

  // Obtener versión actual
  const versiones = getVersiones();
  const versionActual = versiones
    .filter(v => v.formulaId === formulaId)
    .sort((a, b) => b.numeroVersion - a.numeroVersion)[0];

  // No permitir crear nueva versión si la actual está aprobada
  if (versionActual && versionActual.estado === 'aprobada') {
    return { success: false, error: 'No se puede crear una nueva versión de una fórmula aprobada. Cree una nueva fórmula.' };
  }

  // Validar suma de porcentajes
  const sumaPorcentajes = componentes.reduce((sum, c) => sum + c.porcentaje, 0);
  if (Math.abs(sumaPorcentajes - 100) > 0.01) {
    return { success: false, error: `La suma de porcentajes debe ser 100%. Actual: ${sumaPorcentajes.toFixed(2)}%` };
  }

  // Crear nueva versión
  const nuevaVersion: VersionFormula = {
    id: uuidv4(),
    formulaId: formula.id,
    numeroVersion: (versionActual?.numeroVersion || 0) + 1,
    fechaCreacion: new Date().toISOString(),
    creadoPor: usuarioId,
    motivoCambio,
    estado: 'borrador',
    componentes: componentes.map(c => ({
      ...c,
      id: uuidv4(),
      versionId: '' // Se asignará después
    }))
  };

  // Asignar versionId a los componentes
  nuevaVersion.componentes = nuevaVersion.componentes.map(c => ({
    ...c,
    versionId: nuevaVersion.id
  }));

  // Guardar versión
  versiones.push(nuevaVersion);
  saveVersiones(versiones);

  // Actualizar fórmula
  formula.versionActual = nuevaVersion.numeroVersion;
  formula.fechaModificacion = new Date().toISOString();
  saveFormulas(formulas);

  return { success: true, version: nuevaVersion };
}

/**
 * Obtiene todas las fórmulas maestras
 */
export function getTodasLasFormulas(): FormulaMaestra[] {
  return getFormulas();
}

/**
 * Obtiene una fórmula por su ID
 */
export function getFormulaPorId(id: string): FormulaMaestra | undefined {
  return getFormulas().find(f => f.id === id);
}

/**
 * Obtiene una fórmula por su código
 */
export function getFormulaPorCodigo(codigo: string): FormulaMaestra | undefined {
  return getFormulas().find(f => f.codigo === codigo);
}

/**
 * Obtiene todas las versiones de una fórmula
 */
export function getVersionesDeFormula(formulaId: string): VersionFormula[] {
  return getVersiones()
    .filter(v => v.formulaId === formulaId)
    .sort((a, b) => b.numeroVersion - a.numeroVersion);
}

/**
 * Obtiene una versión específica de una fórmula
 */
export function getVersion(formulaId: string, numeroVersion: number): VersionFormula | undefined {
  return getVersiones().find(v => v.formulaId === formulaId && v.numeroVersion === numeroVersion);
}

/**
 * Obtiene la versión actual de una fórmula
 */
export function getVersionActual(formulaId: string): VersionFormula | undefined {
  const formula = getFormulaPorId(formulaId);
  if (!formula) return undefined;
  return getVersion(formulaId, formula.versionActual);
}

/**
 * Cambia el estado de una versión
 */
export function cambiarEstadoVersion(
  versionId: string,
  nuevoEstado: EstadoFormula,
  usuarioId: string
): { success: boolean; error?: string } {
  const versiones = getVersiones();
  const version = versiones.find(v => v.id === versionId);

  if (!version) {
    return { success: false, error: 'Versión no encontrada' };
  }

  // Validar transiciones de estado
  if (version.estado === 'aprobada' && nuevoEstado !== 'obsoleta') {
    return { success: false, error: 'Una versión aprobada solo puede marcarse como obsoleta' };
  }

  version.estado = nuevoEstado;
  saveVersiones(versiones);

  // Si se aprueba, actualizar estado de la fórmula
  if (nuevoEstado === 'aprobada') {
    const formulas = getFormulas();
    const formula = formulas.find(f => f.id === version.formulaId);
    if (formula) {
      formula.estado = 'aprobada';
      saveFormulas(formulas);
    }
  }

  return { success: true };
}

/**
 * Compara dos versiones de una fórmula
 */
export function compararVersiones(
  formulaId: string,
  version1Num: number,
  version2Num: number
): {
  success: boolean;
  diferencias?: {
    componente: string;
    version1?: ComponenteFormula;
    version2?: ComponenteFormula;
    cambio: 'añadido' | 'eliminado' | 'modificado';
  }[];
  error?: string;
} {
  const version1 = getVersion(formulaId, version1Num);
  const version2 = getVersion(formulaId, version2Num);

  if (!version1 || !version2) {
    return { success: false, error: 'Una o ambas versiones no existen' };
  }

  const diferencias: any[] = [];

  // Componentes en versión 1
  const map1 = new Map(version1.componentes.map(c => [c.tintaId, c]));
  const map2 = new Map(version2.componentes.map(c => [c.tintaId, c]));

  // Buscar componentes añadidos o modificados
  for (const [tintaId, comp2] of map2) {
    const comp1 = map1.get(tintaId);
    if (!comp1) {
      diferencias.push({
        componente: tintaId,
        version2: comp2,
        cambio: 'añadido'
      });
    } else if (
      comp1.porcentaje !== comp2.porcentaje ||
      comp1.gramosPorLitro !== comp2.gramosPorLitro
    ) {
      diferencias.push({
        componente: tintaId,
        version1: comp1,
        version2: comp2,
        cambio: 'modificado'
      });
    }
  }

  // Buscar componentes eliminados
  for (const [tintaId, comp1] of map1) {
    if (!map2.has(tintaId)) {
      diferencias.push({
        componente: tintaId,
        version1: comp1,
        cambio: 'eliminado'
      });
    }
  }

  return { success: true, diferencias };
}

/**
 * Elimina una fórmula y todas sus versiones (solo si está en borrador)
 */
export function eliminarFormula(formulaId: string): { success: boolean; error?: string } {
  const formulas = getFormulas();
  const formula = formulas.find(f => f.id === formulaId);

  if (!formula) {
    return { success: false, error: 'Fórmula no encontrada' };
  }

  // No permitir eliminar fórmulas aprobadas
  if (formula.estado === 'aprobada') {
    return { success: false, error: 'No se puede eliminar una fórmula aprobada' };
  }

  // Eliminar versiones
  const versiones = getVersiones();
  const versionesFiltradas = versiones.filter(v => v.formulaId !== formulaId);
  saveVersiones(versionesFiltradas);

  // Eliminar fórmula
  const formulasFiltradas = formulas.filter(f => f.id !== formulaId);
  saveFormulas(formulasFiltradas);

  return { success: true };
}

/**
 * Busca fórmulas por texto (código, nombre, Pantone)
 */
export function buscarFormulas(query: string): FormulaMaestra[] {
  const lowerQuery = query.toLowerCase();
  return getFormulas().filter(f =>
    f.codigo.toLowerCase().includes(lowerQuery) ||
    f.nombre.toLowerCase().includes(lowerQuery) ||
    f.pantoneReferencia?.toLowerCase().includes(lowerQuery) ||
    f.sustratoObjetivo?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtiene estadísticas de fórmulas
 */
export function getEstadisticasFormulas(): {
  total: number;
  borrador: number;
  validada: number;
  aprobadas: number;
  obsoletas: number;
} {
  const formulas = getFormulas();
  return {
    total: formulas.length,
    borrador: formulas.filter(f => f.estado === 'borrador').length,
    validada: formulas.filter(f => f.estado === 'validada').length,
    aprobadas: formulas.filter(f => f.estado === 'aprobada').length,
    obsoletas: formulas.filter(f => f.estado === 'obsoleta').length
  };
}
