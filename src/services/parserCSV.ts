/**
 * Servicio para parsear archivos CSV de colores Pantone
 * Compatible con el formato del repositorio aj90909/unofficial-pantone-solid-coated-2024-v5
 */

import Papa from 'papaparse';
import { ColorPantone, ParseResult } from '../types/color';
import { labToRgb } from '../utils/colorConversions';

/**
 * Detecta si los valores son LAB o RGB basado en los rangos
 * LAB: L (0-100), a (-128 a 127), b (-128 a 127)
 * RGB: R, G, B (0-255)
 */
function detectFormat(values: number[]): 'lab' | 'rgb' | 'unknown' {
  if (values.length < 3) return 'unknown';
  
  const [v1, v2, v3] = values;
  
  // Si todos están en rango 0-100, probablemente es LAB (Luminosidad)
  if (v1 >= 0 && v1 <= 100 && v2 >= -128 && v2 <= 127 && v3 >= -128 && v3 <= 127) {
    return 'lab';
  }
  
  // Si todos están en rango 0-255, probablemente es RGB
  if (v1 >= 0 && v1 <= 255 && v2 >= 0 && v2 <= 255 && v3 >= 0 && v3 <= 255) {
    return 'rgb';
  }
  
  return 'unknown';
}

/**
 * Valida un color Pantone
 */
function validateColor(color: ColorPantone): { valid: boolean; error?: string } {
  if (!color.name || typeof color.name !== 'string') {
    return { valid: false, error: 'Nombre inválido' };
  }
  
  if (!color.lab || typeof color.lab !== 'object') {
    return { valid: false, error: 'Valores LAB inválidos' };
  }
  
  const { L, a, b } = color.lab;
  
  if (typeof L !== 'number' || L < 0 || L > 100) {
    return { valid: false, error: `L inválido: ${L}` };
  }
  
  if (typeof a !== 'number' || a < -128 || a > 127) {
    return { valid: false, error: `a inválido: ${a}` };
  }
  
  if (typeof b !== 'number' || b < -128 || b > 127) {
    return { valid: false, error: `b inválido: ${b}` };
  }
  
  return { valid: true };
}

/**
 * Parsea un archivo CSV de colores Pantone
 * Formato esperado: PANTONENAME, UNIQUECODE, RED, GREEN, BLUE
 * Nota: Aunque las cabeceras dicen RED/GREEN/BLUE, los valores son LAB
 */
export function parsePantoneCSV(csvContent: string): ParseResult {
  const result: ParseResult = {
    success: true,
    colores: [],
    errores: [],
    totalProcesados: 0,
    totalValidos: 0
  };

  try {
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (parsed.errors.length > 0) {
      result.success = false;
      result.errores = parsed.errors.map(e => e.message);
      return result;
    }

    const data = parsed.data as any[];
    result.totalProcesados = data.length;

    for (const row of data) {
      try {
        // Intentar diferentes formatos de columnas
        const name = row.PANTONENAME || row.PANTONE || row.name || row.Nombre || '';
        const uniqueCode = parseInt(row.UNIQUECODE || row.code || row.Codigo || '0');
        
        // Los valores pueden estar en columnas RED/GREEN/BLUE (aunque son LAB)
        // o en columnas L/A/B
        const v1 = parseFloat(row.RED || row.L || row.l || '0');
        const v2 = parseFloat(row.GREEN || row.A || row.a || '0');
        const v3 = parseFloat(row.BLUE || row.B || row.b || '0');

        if (!name) {
          result.errores.push('Fila sin nombre de color');
          continue;
        }

        // Detectar formato (LAB o RGB)
        const format = detectFormat([v1, v2, v3]);
        
        let lab: { L: number; a: number; b: number };
        
        if (format === 'lab') {
          lab = { L: v1, a: v2, b: v3 };
        } else if (format === 'rgb') {
          // Convertir RGB a LAB (aproximación)
          const rgb = { r: v1, g: v2, b: v3 };
          // Usar chroma-js para conversión
          const chroma = require('chroma-js');
          const labValues = chroma(rgb.r, rgb.g, rgb.b, 'rgb').lab();
          lab = { L: labValues[0], a: labValues[1], b: labValues[2] };
        } else {
          result.errores.push(`Formato desconocido para ${name}`);
          continue;
        }

        const color: ColorPantone = {
          name: name.trim(),
          uniqueCode: uniqueCode || undefined,
          lab,
          rgb: labToRgb(lab.L, lab.a, lab.b),
          hex: require('chroma-js').lab(lab.L, lab.a, lab.b).hex()
        };

        const validation = validateColor(color);
        
        if (validation.valid) {
          result.colores.push(color);
          result.totalValidos++;
        } else {
          result.errores.push(`${name}: ${validation.error}`);
        }
      } catch (error) {
        result.errores.push(`Error procesando fila: ${error}`);
      }
    }

    if (result.totalValidos === 0) {
      result.success = false;
      result.errores.push('No se encontraron colores válidos en el archivo');
    }

  } catch (error) {
    result.success = false;
    result.errores.push(`Error fatal al parsear CSV: ${error}`);
  }

  return result;
}

/**
 * Parsea un archivo JSON de colores
 */
export function parseColorJSON(jsonContent: string): ParseResult {
  const result: ParseResult = {
    success: true,
    colores: [],
    errores: [],
    totalProcesados: 0,
    totalValidos: 0
  };

  try {
    const data = JSON.parse(jsonContent);
    
    if (!Array.isArray(data)) {
      result.success = false;
      result.errores.push('El JSON debe ser un array de objetos');
      return result;
    }

    result.totalProcesados = data.length;

    for (const item of data) {
      try {
        const color: ColorPantone = {
          name: item.name || item.nombre || '',
          uniqueCode: item.uniqueCode || item.codigo,
          lab: item.lab || { L: 0, a: 0, b: 0 },
          rgb: item.rgb,
          hex: item.hex,
          category: item.category || item.categoria
        };

        // Si tiene RGB pero no LAB, convertir
        if (color.rgb && !color.lab) {
          const chroma = require('chroma-js');
          const labValues = chroma(color.rgb.r, color.rgb.g, color.rgb.b, 'rgb').lab();
          color.lab = { L: labValues[0], a: labValues[1], b: labValues[2] };
        }

        // Si tiene HEX pero no RGB/LAB, convertir
        if (color.hex && !color.rgb) {
          const chroma = require('chroma-js');
          const rgb = chroma(color.hex).rgb();
          color.rgb = { r: rgb[0], g: rgb[1], b: rgb[2] };
          const labValues = chroma(color.hex).lab();
          color.lab = { L: labValues[0], a: labValues[1], b: labValues[2] };
        }

        const validation = validateColor(color);
        
        if (validation.valid) {
          result.colores.push(color);
          result.totalValidos++;
        } else {
          result.errores.push(`${color.name}: ${validation.error}`);
        }
      } catch (error) {
        result.errores.push(`Error procesando item: ${error}`);
      }
    }

    if (result.totalValidos === 0) {
      result.success = false;
      result.errores.push('No se encontraron colores válidos en el archivo');
    }

  } catch (error) {
    result.success = false;
    result.errores.push(`Error fatal al parsear JSON: ${error}`);
  }

  return result;
}

/**
 * Detecta el formato del archivo y lo parsea
 */
export function parseColorFile(content: string, filename: string): ParseResult {
  const extension = filename.toLowerCase().split('.').pop();
  
  if (extension === 'csv') {
    return parsePantoneCSV(content);
  } else if (extension === 'json') {
    return parseColorJSON(content);
  } else {
    return {
      success: false,
      colores: [],
      errores: [`Formato no soportado: ${extension}`],
      totalProcesados: 0,
      totalValidos: 0
    };
  }
}
