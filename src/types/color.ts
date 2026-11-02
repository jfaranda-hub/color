/**
 * Tipos base para el sistema de gestión de color
 */

export interface ColorPantone {
  name: string; // "PANTONE 185 C"
  uniqueCode?: number; // 10485
  lab: {
    L: number; // 0-100
    a: number; // -128 a 127
    b: number; // -128 a 127
  };
  rgb?: {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
  };
  hex?: string; // "#RRGGBB"
  category?: string; // Categoría del color
}

export interface BibliotecaColor {
  id: string;
  nombre: string;
  colores: ColorPantone[];
  activa: boolean;
  fechaCarga: string; // ISO string
  formato: 'csv' | 'json' | 'txt';
  totalColores: number;
}

export interface FichaTecnica {
  id: string;
  nombre: string;
  proveedor?: string;
  tipoTinta?: string;
  pantoneRef?: string; // "185 C" (para cruzar con biblioteca)
  lab?: { L: number; a: number; b: number };
  sustrato?: string;
  condicionesImpresion?: {
    anilox?: string;
    velocidad?: string;
    temperatura?: string;
  };
  observaciones?: string;
}

export interface ParseResult {
  success: boolean;
  colores: ColorPantone[];
  errores: string[];
  totalProcesados: number;
  totalValidos: number;
}
