/**
 * Servicio para gestionar bibliotecas de color
 * Permite cargar, guardar, activar/desactivar bibliotecas
 * 
 * CORRECCIÓN Incidencia 4:
 * - Las funciones ahora verifican la persistencia real
 * - Devuelven información sobre éxito/fracaso del guardado
 * - No capturan excepciones silenciosamente
 */

import { BibliotecaColor, ColorPantone } from '../types/color';
import { parseColorFile } from './parserCSV';

// Re-exportar tipos para uso en otros módulos
export type { BibliotecaColor, ColorPantone };

const STORAGE_KEY = 'flexcolor_bibliotecas';

/**
 * Resultado de operaciones de guardado
 */
export interface SaveResult {
  success: boolean;
  error?: string;
  quotaExceeded?: boolean;
}

/**
 * Verifica si localStorage está disponible y tiene capacidad
 */
function checkLocalStorageAvailability(): { available: boolean; error?: string } {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return { available: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { available: false, error: 'Almacenamiento local lleno. Exporte sus datos y libere espacio.' };
    }
    return { available: false, error: 'Almacenamiento local no disponible' };
  }
}

/**
 * Obtiene todas las bibliotecas guardadas
 */
export function getBibliotecas(): BibliotecaColor[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading bibliotecas:', error);
  }
  return [];
}

/**
 * Guarda todas las bibliotecas
 * CORRECCIÓN: Verifica que el guardado fue exitoso
 */
export function saveBibliotecas(bibliotecas: BibliotecaColor[]): SaveResult {
  // Verificar disponibilidad antes de guardar
  const check = checkLocalStorageAvailability();
  if (!check.available) {
    return { success: false, error: check.error, quotaExceeded: check.error?.includes('lleno') };
  }

  try {
    const serialized = JSON.stringify(bibliotecas);
    localStorage.setItem(STORAGE_KEY, serialized);
    
    // VERIFICACIÓN: Leer de vuelta para confirmar que se guardó
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== serialized) {
      return { success: false, error: 'Los datos no se guardaron correctamente' };
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        return { 
          success: false, 
          error: 'Espacio de almacenamiento insuficiente. Exporte sus datos y libere espacio.',
          quotaExceeded: true
        };
      }
      if (error.name === 'SecurityError') {
        return { 
          success: false, 
          error: 'Acceso al almacenamiento local bloqueado por el navegador'
        };
      }
    }
    return { success: false, error: `Error al guardar: ${error}` };
  }
}

/**
 * Crea una nueva biblioteca desde un archivo
 * CORRECCIÓN: Verifica que el guardado fue exitoso
 */
export function crearBiblioteca(
  nombre: string,
  fileContent: string,
  filename: string
): { success: boolean; biblioteca?: BibliotecaColor; errores: string[]; saveError?: string } {
  const parseResult = parseColorFile(fileContent, filename);
  
  if (!parseResult.success || parseResult.colores.length === 0) {
    return {
      success: false,
      errores: parseResult.errores
    };
  }

  const extension = filename.toLowerCase().split('.').pop() as 'csv' | 'json' | 'txt';
  
  const biblioteca: BibliotecaColor = {
    id: `bib-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nombre,
    colores: parseResult.colores,
    activa: true,
    fechaCarga: new Date().toISOString(),
    formato: extension,
    totalColores: parseResult.totalValidos
  };

  // Guardar en localStorage y verificar
  const bibliotecas = getBibliotecas();
  bibliotecas.push(biblioteca);
  
  const saveResult = saveBibliotecas(bibliotecas);
  
  if (!saveResult.success) {
    // Si falla el guardado, no devolver éxito
    return {
      success: false,
      errores: [],
      saveError: saveResult.error || 'Error desconocido al guardar'
    };
  }

  return {
    success: true,
    biblioteca,
    errores: parseResult.errores
  };
}

/**
 * Elimina una biblioteca
 * CORRECCIÓN: Verifica que el guardado fue exitoso
 */
export function eliminarBiblioteca(id: string): { success: boolean; error?: string } {
  try {
    const bibliotecas = getBibliotecas();
    const filtered = bibliotecas.filter(b => b.id !== id);
    
    if (filtered.length === bibliotecas.length) {
      return { success: false, error: 'Biblioteca no encontrada' };
    }
    
    const saveResult = saveBibliotecas(filtered);
    
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: `Error al eliminar: ${error}` };
  }
}

/**
 * Activa/desactiva una biblioteca
 * CORRECCIÓN: Verifica que el guardado fue exitoso
 */
export function toggleBiblioteca(id: string): { success: boolean; error?: string } {
  try {
    const bibliotecas = getBibliotecas();
    const index = bibliotecas.findIndex(b => b.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Biblioteca no encontrada' };
    }
    
    bibliotecas[index].activa = !bibliotecas[index].activa;
    
    const saveResult = saveBibliotecas(bibliotecas);
    
    if (!saveResult.success) {
      // Revertir cambio si falla el guardado
      bibliotecas[index].activa = !bibliotecas[index].activa;
      return { success: false, error: saveResult.error };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: `Error al cambiar estado: ${error}` };
  }
}

/**
 * Obtiene todos los colores de las bibliotecas activas
 */
export function getColoresActivos(): ColorPantone[] {
  const bibliotecas = getBibliotecas();
  const activas = bibliotecas.filter(b => b.activa);
  
  // Combinar todos los colores de las bibliotecas activas
  const colores: ColorPantone[] = [];
  for (const bib of activas) {
    colores.push(...bib.colores);
  }
  
  return colores;
}

/**
 * Busca un color por nombre o código
 */
export function buscarColor(query: string): ColorPantone[] {
  const colores = getColoresActivos();
  const lowerQuery = query.toLowerCase();
  
  return colores.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.uniqueCode?.toString().includes(lowerQuery) ||
    c.category?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Encuentra el color más cercano a unos valores LAB
 */
export function encontrarColorMasCercano(
  L: number,
  a: number,
  b: number,
  limit: number = 10
): Array<ColorPantone & { deltaE: number }> {
  const colores = getColoresActivos();
  
  const withDelta = colores.map(c => {
    const dL = L - c.lab.L;
    const da = a - c.lab.a;
    const db = b - c.lab.b;
    const deltaE = Math.sqrt(dL * dL + da * da + db * db);
    return { ...c, deltaE };
  });
  
  return withDelta
    .sort((a, b) => a.deltaE - b.deltaE)
    .slice(0, limit);
}

/**
 * Obtiene estadísticas de las bibliotecas
 */
export function getEstadisticas(): {
  totalBibliotecas: number;
  bibliotecasActivas: number;
  totalColores: number;
  formatos: Record<string, number>;
} {
  const bibliotecas = getBibliotecas();
  const activas = bibliotecas.filter(b => b.activa);
  
  const formatos: Record<string, number> = {};
  let totalColores = 0;
  
  for (const bib of bibliotecas) {
    formatos[bib.formato] = (formatos[bib.formato] || 0) + 1;
    if (bib.activa) {
      totalColores += bib.totalColores;
    }
  }
  
  return {
    totalBibliotecas: bibliotecas.length,
    bibliotecasActivas: activas.length,
    totalColores,
    formatos
  };
}

/**
 * Exporta todas las bibliotecas como JSON
 */
export function exportarBibliotecas(): string {
  const bibliotecas = getBibliotecas();
  return JSON.stringify(bibliotecas, null, 2);
}

/**
 * Importa bibliotecas desde JSON
 */
export function importarBibliotecas(json: string): { success: boolean; count: number; error?: string } {
  try {
    const bibliotecas = JSON.parse(json) as BibliotecaColor[];
    
    if (!Array.isArray(bibliotecas)) {
      return { success: false, count: 0, error: 'El JSON debe ser un array de bibliotecas' };
    }
    
    const saveResult = saveBibliotecas(bibliotecas);
    
    if (!saveResult.success) {
      return { success: false, count: 0, error: saveResult.error };
    }
    
    return { success: true, count: bibliotecas.length };
  } catch (error) {
    return { success: false, count: 0, error: `Error al importar: ${error}` };
  }
}
