/**
 * Servicio para gestionar bibliotecas de color
 * Permite cargar, guardar, activar/desactivar bibliotecas
 */

import { BibliotecaColor, ColorPantone } from '../types/color';
import { parseColorFile } from './parserCSV';

const STORAGE_KEY = 'flexcolor_bibliotecas';

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
 */
export function saveBibliotecas(bibliotecas: BibliotecaColor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bibliotecas));
  } catch (error) {
    console.error('Error saving bibliotecas:', error);
  }
}

/**
 * Crea una nueva biblioteca desde un archivo
 */
export function crearBiblioteca(
  nombre: string,
  fileContent: string,
  filename: string
): { success: boolean; biblioteca?: BibliotecaColor; errores: string[] } {
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

  // Guardar en localStorage
  const bibliotecas = getBibliotecas();
  bibliotecas.push(biblioteca);
  saveBibliotecas(bibliotecas);

  return {
    success: true,
    biblioteca,
    errores: parseResult.errores
  };
}

/**
 * Elimina una biblioteca
 */
export function eliminarBiblioteca(id: string): boolean {
  try {
    const bibliotecas = getBibliotecas();
    const filtered = bibliotecas.filter(b => b.id !== id);
    saveBibliotecas(filtered);
    return true;
  } catch (error) {
    console.error('Error deleting biblioteca:', error);
    return false;
  }
}

/**
 * Activa/desactiva una biblioteca
 */
export function toggleBiblioteca(id: string): boolean {
  try {
    const bibliotecas = getBibliotecas();
    const index = bibliotecas.findIndex(b => b.id === id);
    
    if (index === -1) return false;
    
    bibliotecas[index].activa = !bibliotecas[index].activa;
    saveBibliotecas(bibliotecas);
    return true;
  } catch (error) {
    console.error('Error toggling biblioteca:', error);
    return false;
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
