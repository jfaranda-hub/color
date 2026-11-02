/**
 * Servicio para gestionar fichas técnicas
 * Permite cargar, buscar y cruzar fichas con colores Pantone
 */

import { FichaTecnica } from '../types/color';

const STORAGE_KEY = 'flexcolor_fichas_tecnicas';

/**
 * Obtiene todas las fichas técnicas guardadas
 */
export function getFichasTecnicas(): FichaTecnica[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading fichas técnicas:', error);
  }
  return [];
}

/**
 * Guarda todas las fichas técnicas
 */
export function saveFichasTecnicas(fichas: FichaTecnica[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fichas));
  } catch (error) {
    console.error('Error saving fichas técnicas:', error);
  }
}

/**
 * Añade una nueva ficha técnica
 */
export function addFichaTecnica(ficha: FichaTecnica): boolean {
  try {
    const fichas = getFichasTecnicas();
    fichas.push(ficha);
    saveFichasTecnicas(fichas);
    return true;
  } catch (error) {
    console.error('Error adding ficha técnica:', error);
    return false;
  }
}

/**
 * Actualiza una ficha técnica existente
 */
export function updateFichaTecnica(id: string, updates: Partial<FichaTecnica>): boolean {
  try {
    const fichas = getFichasTecnicas();
    const index = fichas.findIndex(f => f.id === id);
    
    if (index === -1) return false;
    
    fichas[index] = { ...fichas[index], ...updates };
    saveFichasTecnicas(fichas);
    return true;
  } catch (error) {
    console.error('Error updating ficha técnica:', error);
    return false;
  }
}

/**
 * Elimina una ficha técnica
 */
export function deleteFichaTecnica(id: string): boolean {
  try {
    const fichas = getFichasTecnicas();
    const filtered = fichas.filter(f => f.id !== id);
    saveFichasTecnicas(filtered);
    return true;
  } catch (error) {
    console.error('Error deleting ficha técnica:', error);
    return false;
  }
}

/**
 * Busca fichas técnicas por referencia Pantone
 */
export function getFichasByPantoneRef(pantoneRef: string): FichaTecnica[] {
  const fichas = getFichasTecnicas();
  const normalizedRef = pantoneRef.toLowerCase().trim();
  
  return fichas.filter(f => 
    f.pantoneRef?.toLowerCase().trim() === normalizedRef
  );
}

/**
 * Busca fichas técnicas por nombre, proveedor o tipo de tinta
 */
export function searchFichas(query: string): FichaTecnica[] {
  const fichas = getFichasTecnicas();
  const lowerQuery = query.toLowerCase();
  
  return fichas.filter(f => 
    f.nombre.toLowerCase().includes(lowerQuery) ||
    f.proveedor?.toLowerCase().includes(lowerQuery) ||
    f.tipoTinta?.toLowerCase().includes(lowerQuery) ||
    f.pantoneRef?.toLowerCase().includes(lowerQuery) ||
    f.sustrato?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtiene fichas sin referencia Pantone (fichas generales)
 */
export function getFichasGenerales(): FichaTecnica[] {
  const fichas = getFichasTecnicas();
  return fichas.filter(f => !f.pantoneRef || f.pantoneRef.trim() === '');
}

/**
 * Obtiene estadísticas de las fichas técnicas
 */
export function getEstadisticasFichas(): {
  totalFichas: number;
  fichasConPantone: number;
  fichasGenerales: number;
  proveedores: string[];
  tiposTinta: string[];
} {
  const fichas = getFichasTecnicas();
  
  const proveedores = Array.from(new Set(
    fichas
      .map(f => f.proveedor)
      .filter((p): p is string => !!p)
  ));
  
  const tiposTinta = Array.from(new Set(
    fichas
      .map(f => f.tipoTinta)
      .filter((t): t is string => !!t)
  ));
  
  return {
    totalFichas: fichas.length,
    fichasConPantone: fichas.filter(f => f.pantoneRef && f.pantoneRef.trim() !== '').length,
    fichasGenerales: fichas.filter(f => !f.pantoneRef || f.pantoneRef.trim() === '').length,
    proveedores,
    tiposTinta
  };
}

/**
 * Importa fichas técnicas desde un archivo JSON
 */
export function importFichasFromJSON(jsonContent: string): {
  success: boolean;
  totalImportadas: number;
  errores: string[];
} {
  const result = {
    success: true,
    totalImportadas: 0,
    errores: [] as string[]
  };

  try {
    const data = JSON.parse(jsonContent);
    
    if (!Array.isArray(data)) {
      result.success = false;
      result.errores.push('El JSON debe ser un array de objetos');
      return result;
    }

    const fichas: FichaTecnica[] = [];

    for (const item of data) {
      try {
        const ficha: FichaTecnica = {
          id: item.id || `ficha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nombre: item.nombre || item.name || '',
          proveedor: item.proveedor || item.provider,
          tipoTinta: item.tipoTinta || item.inkType,
          pantoneRef: item.pantoneRef || item.pantone,
          lab: item.lab,
          sustrato: item.sustrato || item.substrate,
          condicionesImpresion: item.condicionesImpresion || item.printingConditions,
          observaciones: item.observaciones || item.notes
        };

        if (!ficha.nombre) {
          result.errores.push('Ficha sin nombre');
          continue;
        }

        fichas.push(ficha);
        result.totalImportadas++;
      } catch (error) {
        result.errores.push(`Error procesando ficha: ${error}`);
      }
    }

    if (fichas.length > 0) {
      const fichasExistentes = getFichasTecnicas();
      saveFichasTecnicas([...fichasExistentes, ...fichas]);
    }

    if (result.totalImportadas === 0) {
      result.success = false;
      result.errores.push('No se importaron fichas válidas');
    }

  } catch (error) {
    result.success = false;
    result.errores.push(`Error fatal al parsear JSON: ${error}`);
  }

  return result;
}
