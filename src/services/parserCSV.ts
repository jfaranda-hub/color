/**
 * Servicio para parsear archivos CSV de colores Pantone
 * Compatible con el formato del repositorio aj90909/unofficial-pantone-solid-coated-2024-v5
 * 
 * CORRECCIÓN Incidencia 2:
 * - Eliminado require('chroma-js') incompatible con ESM
 * - Uso de import estático de chroma-js
 * - Validación de NaN e Infinity
 * - Admite valores cero válidos
 * - Muestra números de fila en errores
 * - Detección mejorada de formato LAB/RGB
 */

import Papa from 'papaparse';
import chroma from 'chroma-js';
import { ColorPantone, ParseResult } from '../types/color';
import { labToRgb } from '../utils/colorConversions';

/**
 * Valida que un número sea finito y no NaN
 */
function isValidNumber(value: number): boolean {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
}

/**
 * Detecta si los valores son LAB o RGB basado en las cabeceras y rangos
 * 
 * CORRECCIÓN: No adivinar solo por rangos numéricos
 * Si las cabeceras son RED/GREEN/BLUE pero los valores están en rango LAB,
 * asumir que son LAB (formato del repositorio Pantone)
 */
function detectFormat(
  headers: string[],
  values: number[],
  rowIndex: number,
  errores: string[]
): 'lab' | 'rgb' | 'unknown' {
  if (values.length < 3) {
    errores.push(`Fila ${rowIndex}: menos de 3 valores de color`);
    return 'unknown';
  }

  const [v1, v2, v3] = values;

  // Validar que todos sean números válidos
  if (!isValidNumber(v1) || !isValidNumber(v2) || !isValidNumber(v3)) {
    errores.push(`Fila ${rowIndex}: valores no numéricos o infinitos detectados`);
    return 'unknown';
  }

  // Si las cabeceras son RED/GREEN/BLUE, el repositorio Pantone usa LAB
  const headerStr = headers.map(h => h.toUpperCase()).join(',');
  if (headerStr.includes('RED') && headerStr.includes('GREEN') && headerStr.includes('BLUE')) {
    // Verificar si los valores están en rango LAB
    if (v1 >= 0 && v1 <= 100 && v2 >= -128 && v2 <= 127 && v3 >= -128 && v3 <= 127) {
      return 'lab';
    }
    // Si están en rango RGB, convertir
    if (v1 >= 0 && v1 <= 255 && v2 >= 0 && v2 <= 255 && v3 >= 0 && v3 <= 255) {
      return 'rgb';
    }
  }

  // Si las cabeceras son L/A/B, es LAB directo
  if (headerStr.includes('L') && (headerStr.includes('A') || headerStr.includes('B'))) {
    if (v1 >= 0 && v1 <= 100 && v2 >= -128 && v2 <= 127 && v3 >= -128 && v3 <= 127) {
      return 'lab';
    }
  }

  // Detección por rangos (fallback)
  // LAB: L (0-100), a (-128 a 127), b (-128 a 127)
  if (v1 >= 0 && v1 <= 100 && v2 >= -128 && v2 <= 127 && v3 >= -128 && v3 <= 127) {
    return 'lab';
  }

  // RGB: R, G, B (0-255)
  if (v1 >= 0 && v1 <= 255 && v2 >= 0 && v2 <= 255 && v3 >= 0 && v3 <= 255) {
    return 'rgb';
  }

  errores.push(`Fila ${rowIndex}: formato desconocido (valores: ${v1}, ${v2}, ${v3})`);
  return 'unknown';
}

/**
 * Valida un color Pantone
 */
function validateColor(color: ColorPantone, rowIndex: number): { valid: boolean; error?: string } {
  if (!color.name || typeof color.name !== 'string' || color.name.trim() === '') {
    return { valid: false, error: `Fila ${rowIndex}: nombre vacío o inválido` };
  }

  if (!color.lab || typeof color.lab !== 'object') {
    return { valid: false, error: `Fila ${rowIndex} (${color.name}): valores LAB inválidos` };
  }

  const { L, a, b } = color.lab;

  // Validar que sean números válidos
  if (!isValidNumber(L) || !isValidNumber(a) || !isValidNumber(b)) {
    return { valid: false, error: `Fila ${rowIndex} (${color.name}): valores LAB contienen NaN o Infinity` };
  }

  // Validar rangos (incluyendo cero como válido)
  if (L < 0 || L > 100) {
    return { valid: false, error: `Fila ${rowIndex} (${color.name}): L=${L} fuera de rango [0-100]` };
  }

  if (a < -128 || a > 127) {
    return { valid: false, error: `Fila ${rowIndex} (${color.name}): a=${a} fuera de rango [-128, 127]` };
  }

  if (b < -128 || b > 127) {
    return { valid: false, error: `Fila ${rowIndex} (${color.name}): b=${b} fuera de rango [-128, 127]` };
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
      result.errores = parsed.errors.map(e => `Error de parseo: ${e.message}`);
      return result;
    }

    const data = parsed.data as any[];
    const headers = parsed.meta.fields || [];
    result.totalProcesados = data.length;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowIndex = i + 2; // +2 porque la fila 1 es la cabecera

      try {
        // Intentar diferentes formatos de columnas
        const name = row.PANTONENAME || row.PANTONE || row.name || row.Nombre || '';
        const uniqueCode = parseInt(row.UNIQUECODE || row.code || row.Codigo || '0');

        // Los valores pueden estar en columnas RED/GREEN/BLUE (aunque son LAB)
        // o en columnas L/A/B
        const v1 = parseFloat(row.RED || row.L || row.l || '0');
        const v2 = parseFloat(row.GREEN || row.A || row.a || '0');
        const v3 = parseFloat(row.BLUE || row.B || row.b || '0');

        if (!name || name.trim() === '') {
          result.errores.push(`Fila ${rowIndex}: nombre de color vacío`);
          continue;
        }

        // Detectar formato (LAB o RGB) con información de cabeceras
        const format = detectFormat(headers, [v1, v2, v3], rowIndex, result.errores);

        if (format === 'unknown') {
          continue;
        }

        let lab: { L: number; a: number; b: number };

        if (format === 'lab') {
          lab = { L: v1, a: v2, b: v3 };
        } else if (format === 'rgb') {
          // Convertir RGB a LAB usando chroma-js (import estático)
          try {
            const labValues = chroma(v1, v2, v3, 'rgb').lab();
            lab = { L: labValues[0], a: labValues[1], b: labValues[2] };
          } catch (error) {
            result.errores.push(`Fila ${rowIndex} (${name}): error convirtiendo RGB a LAB`);
            continue;
          }
        } else {
          continue;
        }

        // Convertir LAB a HEX usando chroma-js (import estático)
        let hex: string;
        try {
          hex = chroma.lab(lab.L, lab.a, lab.b).hex();
        } catch (error) {
          result.errores.push(`Fila ${rowIndex} (${name}): error calculando HEX`);
          continue;
        }

        const color: ColorPantone = {
          name: name.trim(),
          uniqueCode: uniqueCode || undefined,
          lab,
          rgb: labToRgb(lab.L, lab.a, lab.b),
          hex
        };

        const validation = validateColor(color, rowIndex);

        if (validation.valid) {
          result.colores.push(color);
          result.totalValidos++;
        } else {
          result.errores.push(validation.error!);
        }
      } catch (error) {
        result.errores.push(`Fila ${rowIndex}: error inesperado - ${error}`);
      }
    }

    if (result.totalValidos === 0) {
      result.success = false;
      if (result.errores.length === 0) {
        result.errores.push('No se encontraron colores válidos en el archivo');
      }
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

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const rowIndex = i + 1;

      try {
        const color: ColorPantone = {
          name: item.name || item.nombre || '',
          uniqueCode: item.uniqueCode || item.codigo,
          lab: item.lab || { L: 0, a: 0, b: 0 },
          rgb: item.rgb,
          hex: item.hex,
          category: item.category || item.categoria
        };

        // Validar valores LAB
        if (!color.lab || !isValidNumber(color.lab.L) || !isValidNumber(color.lab.a) || !isValidNumber(color.lab.b)) {
          result.errores.push(`Elemento ${rowIndex}: valores LAB inválidos o contienen NaN/Infinity`);
          continue;
        }

        // Si tiene RGB pero no LAB válido, convertir
        if (color.rgb && (!color.lab || color.lab.L === 0 && color.lab.a === 0 && color.lab.b === 0)) {
          try {
            const labValues = chroma(color.rgb.r, color.rgb.g, color.rgb.b, 'rgb').lab();
            color.lab = { L: labValues[0], a: labValues[1], b: labValues[2] };
          } catch (error) {
            result.errores.push(`Elemento ${rowIndex}: error convirtiendo RGB a LAB`);
            continue;
          }
        }

        // Si tiene HEX pero no RGB/LAB, convertir
        if (color.hex && !color.rgb) {
          try {
            const rgb = chroma(color.hex).rgb();
            color.rgb = { r: rgb[0], g: rgb[1], b: rgb[2] };
            const labValues = chroma(color.hex).lab();
            color.lab = { L: labValues[0], a: labValues[1], b: labValues[2] };
          } catch (error) {
            result.errores.push(`Elemento ${rowIndex}: error convirtiendo HEX a RGB/LAB`);
            continue;
          }
        }

        const validation = validateColor(color, rowIndex);

        if (validation.valid) {
          result.colores.push(color);
          result.totalValidos++;
        } else {
          result.errores.push(validation.error!);
        }
      } catch (error) {
        result.errores.push(`Elemento ${rowIndex}: error procesando item - ${error}`);
      }
    }

    if (result.totalValidos === 0) {
      result.success = false;
      if (result.errores.length === 0) {
        result.errores.push('No se encontraron colores válidos en el archivo');
      }
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
      errores: [`Formato no soportado: ${extension}. Use CSV o JSON.`],
      totalProcesados: 0,
      totalValidos: 0
    };
  }
}
