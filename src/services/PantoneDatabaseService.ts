/**
 * Servicio de gestión de base de datos Pantone
 * CORRECCIÓN Incidencia 3:
 * - Ahora usa gestorBibliotecas como almacén único
 * - Crea una biblioteca especial "Pantone Database" internamente
 * - Mantiene compatibilidad con la API existente
 * - No duplica registros
 */

import { PantoneColorExpanded } from "../data/pantoneLabExpanded";
import { ColorPantone } from "../types/color";
import { 
  getBibliotecas, 
  saveBibliotecas, 
  BibliotecaColor 
} from "./gestorBibliotecas";

// ID especial para la biblioteca Pantone Database
const PANTONE_DB_ID = "pantone-database-principal";

export interface ImportResult {
  success: boolean;
  totalImported: number;
  errors: string[];
  duplicates: number;
  saveError?: string;
}

/**
 * Obtiene la biblioteca Pantone Database si existe
 */
function getPantoneBiblioteca(): BibliotecaColor | undefined {
  const bibliotecas = getBibliotecas();
  return bibliotecas.find(b => b.id === PANTONE_DB_ID);
}

/**
 * Obtiene la base de datos Pantone desde la biblioteca unificada
 */
export function getPantoneDatabase(): PantoneColorExpanded[] {
  const bib = getPantoneBiblioteca();
  if (!bib) {
    return [];
  }
  
  // Convertir ColorPantone a PantoneColorExpanded
  return bib.colores.map(c => ({
    code: c.name, // En ColorPantone, name contiene el código
    name: c.name,
    L: c.lab.L,
    a: c.lab.a,
    b: c.lab.b,
    hex: c.hex || '',
    rgb: c.rgb || { r: 0, g: 0, b: 0 },
    cmyk: { c: 0, m: 0, y: 0, k: 0 }, // Valores por defecto
    hsl: { h: 0, s: 0, l: 0 },
    hsv: { h: 0, s: 0, v: 0 },
    category: c.category || 'Pantone'
  }));
}

/**
 * Guarda la base de datos Pantone en la biblioteca unificada
 * CORRECCIÓN: Verifica que el guardado fue exitoso
 */
export function savePantoneDatabase(colors: PantoneColorExpanded[]): { success: boolean; error?: string } {
  // Convertir PantoneColorExpanded a ColorPantone
  const colores: ColorPantone[] = colors.map(c => ({
    name: c.code,
    lab: { L: c.L, a: c.a, b: c.b },
    rgb: c.rgb,
    hex: c.hex,
    category: c.category
  }));

  const bibliotecas = getBibliotecas();
  const existingIndex = bibliotecas.findIndex(b => b.id === PANTONE_DB_ID);

  const pantoneBib: BibliotecaColor = {
    id: PANTONE_DB_ID,
    nombre: "Pantone Database",
    colores: colores,
    activa: true,
    fechaCarga: existingIndex >= 0 ? bibliotecas[existingIndex].fechaCarga : new Date().toISOString(),
    formato: 'json',
    totalColores: colores.length
  };

  if (existingIndex >= 0) {
    bibliotecas[existingIndex] = pantoneBib;
  } else {
    bibliotecas.push(pantoneBib);
  }

  const saveResult = saveBibliotecas(bibliotecas);
  
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }
  
  return { success: true };
}

/**
 * Valida un color Pantone
 */
function validatePantoneColor(color: any): { valid: boolean; error?: string } {
  if (!color.code || typeof color.code !== "string") {
    return { valid: false, error: "Código Pantone inválido" };
  }
  
  // Validar L (incluyendo cero como válido)
  if (color.L === undefined || typeof color.L !== "number" || !isFinite(color.L) || isNaN(color.L)) {
    return { valid: false, error: `Valor L inválido para ${color.code}: ${color.L}` };
  }
  if (color.L < 0 || color.L > 100) {
    return { valid: false, error: `Valor L fuera de rango para ${color.code}: ${color.L}` };
  }
  
  // Validar a
  if (color.a === undefined || typeof color.a !== "number" || !isFinite(color.a) || isNaN(color.a)) {
    return { valid: false, error: `Valor a inválido para ${color.code}: ${color.a}` };
  }
  if (color.a < -128 || color.a > 127) {
    return { valid: false, error: `Valor a fuera de rango para ${color.code}: ${color.a}` };
  }
  
  // Validar b
  if (color.b === undefined || typeof color.b !== "number" || !isFinite(color.b) || isNaN(color.b)) {
    return { valid: false, error: `Valor b inválido para ${color.code}: ${color.b}` };
  }
  if (color.b < -128 || color.b > 127) {
    return { valid: false, error: `Valor b fuera de rango para ${color.code}: ${color.b}` };
  }
  
  return { valid: true };
}

/**
 * Importa colores Pantone desde un array
 * CORRECCIÓN: Verifica que el guardado fue exitoso
 */
export function importPantoneColors(colors: any[]): ImportResult {
  const result: ImportResult = {
    success: true,
    totalImported: 0,
    errors: [],
    duplicates: 0
  };

  const existingDb = getPantoneDatabase();
  const existingCodes = new Set(existingDb.map(c => c.code));
  const newColors: PantoneColorExpanded[] = [...existingDb]; // Mantener existentes

  for (const color of colors) {
    const validation = validatePantoneColor(color);
    
    if (!validation.valid) {
      result.errors.push(validation.error!);
      continue;
    }

    if (existingCodes.has(color.code)) {
      result.duplicates++;
      continue;
    }

    // Convertir a PantoneColorExpanded
    const newColor: PantoneColorExpanded = {
      code: color.code,
      name: color.name || color.code,
      L: color.L,
      a: color.a,
      b: color.b,
      hex: color.hex || "",
      rgb: color.rgb || { r: 0, g: 0, b: 0 },
      cmyk: color.cmyk || { c: 0, m: 0, y: 0, k: 0 },
      hsl: color.hsl || { h: 0, s: 0, l: 0 },
      hsv: color.hsv || { h: 0, s: 0, v: 0 },
      category: color.category || "Pantone"
    };

    newColors.push(newColor);
    existingCodes.add(color.code);
    result.totalImported++;
  }

  if (newColors.length > 0) {
    const saveResult = savePantoneDatabase(newColors);
    
    if (!saveResult.success) {
      result.success = false;
      result.saveError = saveResult.error;
      result.errors.push(`Error al guardar: ${saveResult.error}`);
      return result;
    }
  }

  if (result.errors.length > 0 && result.totalImported === 0) {
    result.success = false;
  }

  return result;
}

/**
 * Exporta la base de datos Pantone como JSON
 */
export function exportPantoneDatabase(): string {
  const db = getPantoneDatabase();
  return JSON.stringify(db, null, 2);
}

/**
 * Limpia la base de datos Pantone
 * CORRECCIÓN: Verifica que el guardado fue exitoso
 */
export function clearPantoneDatabase(): { success: boolean; error?: string } {
  const bibliotecas = getBibliotecas();
  const filtered = bibliotecas.filter(b => b.id !== PANTONE_DB_ID);
  
  const saveResult = saveBibliotecas(filtered);
  
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }
  
  return { success: true };
}

/**
 * Obtiene estadísticas de la base de datos Pantone
 */
export function getPantoneDatabaseStats(): {
  totalColors: number;
  categories: string[];
  lastImport?: string;
} {
  const bib = getPantoneBiblioteca();
  
  if (!bib) {
    return {
      totalColors: 0,
      categories: []
    };
  }
  
  const categories = Array.from(new Set(bib.colores.map(c => c.category).filter((c): c is string => Boolean(c))));
  
  return {
    totalColors: bib.totalColores,
    categories,
    lastImport: bib.fechaCarga
  };
}
