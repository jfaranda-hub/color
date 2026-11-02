/**
 * Servicio de gestión de base de datos Pantone
 * Permite importar, exportar y gestionar colores Pantone desde la app
 */

import { PantoneColorExpanded } from "../data/pantoneLabExpanded";

const STORAGE_KEY = "flexcolor_pantone_database";

export interface ImportResult {
  success: boolean;
  totalImported: number;
  errors: string[];
  duplicates: number;
}

/**
 * Obtiene la base de datos Pantone desde localStorage
 */
export function getPantoneDatabase(): PantoneColorExpanded[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading Pantone database from localStorage:", error);
  }
  return [];
}

/**
 * Guarda la base de datos Pantone en localStorage
 */
export function savePantoneDatabase(colors: PantoneColorExpanded[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  } catch (error) {
    console.error("Error saving Pantone database to localStorage:", error);
  }
}

/**
 * Valida un color Pantone
 */
function validatePantoneColor(color: any): { valid: boolean; error?: string } {
  if (!color.code || typeof color.code !== "string") {
    return { valid: false, error: "Código Pantone inválido" };
  }
  
  if (!color.L || typeof color.L !== "number" || color.L < 0 || color.L > 100) {
    return { valid: false, error: `Valor L inválido para ${color.code}: ${color.L}` };
  }
  
  if (color.a === undefined || typeof color.a !== "number" || color.a < -128 || color.a > 127) {
    return { valid: false, error: `Valor a inválido para ${color.code}: ${color.a}` };
  }
  
  if (color.b === undefined || typeof color.b !== "number" || color.b < -128 || color.b > 127) {
    return { valid: false, error: `Valor b inválido para ${color.code}: ${color.b}` };
  }
  
  return { valid: true };
}

/**
 * Importa colores Pantone desde un array
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
  const newColors: PantoneColorExpanded[] = [];

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
      category: color.category || "Sin categoría"
    };

    newColors.push(newColor);
    existingCodes.add(color.code);
    result.totalImported++;
  }

  if (newColors.length > 0) {
    const updatedDb = [...existingDb, ...newColors];
    savePantoneDatabase(updatedDb);
  }

  if (result.errors.length > 0) {
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
 */
export function clearPantoneDatabase(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Obtiene estadísticas de la base de datos
 */
export function getPantoneDatabaseStats(): {
  totalColors: number;
  categories: string[];
  lastImport?: string;
} {
  const db = getPantoneDatabase();
  const categories = Array.from(new Set(db.map(c => c.category)));
  
  return {
    totalColors: db.length,
    categories,
    lastImport: localStorage.getItem("flexcolor_pantone_last_import") || undefined
  };
}
